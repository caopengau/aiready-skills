import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import {
  createAnalysis,
  getRepository,
  listRepositoryAnalyses,
  getUser,
} from '@/lib/db';
import {
  storeAnalysis,
  calculateAiScore,
  extractSummary,
  extractBreakdown,
  AnalysisData,
} from '@/lib/storage';
import { planLimits } from '@/lib/plans';
import { sendAnalysisCompleteEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

// Helper to count runs this month
async function getRunsThisMonth(userId: string): Promise<number> {
  // Get current month's start date
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();

  // Query all user's repos and count analyses this month
  // For now, we'll use a simple approach - in production, use a metric record
  const { listUserRepositories } = await import('@/lib/db');
  const repos = await listUserRepositories(userId);

  let totalRuns = 0;
  for (const repo of repos) {
    const analyses = await listRepositoryAnalyses(repo.id, 100);
    const thisMonthAnalyses = analyses.filter((a) => a.timestamp >= monthStart);
    totalRuns += thisMonthAnalyses.length;
  }

  return totalRuns;
}

// POST /api/analysis/upload - Upload analysis results
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { repoId, data } = body as { repoId: string; data: AnalysisData };

    if (!repoId || !data) {
      return NextResponse.json(
        { error: 'Repository ID and analysis data are required' },
        { status: 400 }
      );
    }

    // Verify repository exists and belongs to user
    const repo = await getRepository(repoId);
    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    if (repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check run limit (Free tier: 10 runs/month)
    const maxRunsPerMonth = planLimits.free.maxRunsPerMonth; // 10 runs for free tier
    const runsThisMonth = await getRunsThisMonth(session.user.id);

    if (runsThisMonth >= maxRunsPerMonth) {
      return NextResponse.json(
        {
          error: `You've reached the maximum of ${maxRunsPerMonth} analysis runs this month on the Free plan.`,
          code: 'RUN_LIMIT_REACHED',
          currentRuns: runsThisMonth,
          maxRuns: maxRunsPerMonth,
          resetDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            1
          ).toISOString(),
          upgradeUrl: 'https://getaiready.dev/pricing',
        },
        { status: 403 }
      );
    }

    // Generate timestamp for this analysis
    const timestamp = data.metadata?.timestamp || new Date().toISOString();
    const analysisId = randomUUID();

    // Store raw data in S3
    const rawKey = await storeAnalysis({
      userId: session.user.id,
      repoId,
      timestamp,
      data,
    });

    // Calculate AI score
    const aiScore = data.summary?.aiReadinessScore || calculateAiScore(data);

    // Create analysis record in DynamoDB
    const analysis = await createAnalysis({
      id: analysisId,
      repoId,
      userId: session.user.id,
      timestamp,
      aiScore,
      breakdown: extractBreakdown(data),
      rawKey,
      summary: extractSummary(data),
      createdAt: new Date().toISOString(),
    });

    // Calculate remaining runs
    const remainingRuns = maxRunsPerMonth - runsThisMonth - 1;

    // Send email notification (async, don't wait for it)
    getUser(session.user.id).then((user) => {
      if (user?.email) {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || 'https://platform.getaiready.dev';
        sendAnalysisCompleteEmail({
          to: user.email!,
          repoName: repo.name,
          aiScore,
          breakdown: analysis.breakdown,
          summary: analysis.summary,
          dashboardUrl: `${baseUrl}/dashboard?repo=${repoId}`,
        }).catch((err) => console.error('Failed to send analysis email:', err));
      }
    });

    return NextResponse.json(
      {
        analysis,
        message: 'Analysis uploaded successfully',
        limits: {
          runsRemaining: remainingRuns,
          maxRunsPerMonth,
          resetDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            1
          ).toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/analysis/upload?repoId=<repoId> - Get analyses for a repository
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get('repoId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!repoId) {
      return NextResponse.json(
        { error: 'Repository ID is required' },
        { status: 400 }
      );
    }

    // Verify repository exists and belongs to user
    const repo = await getRepository(repoId);
    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    if (repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const analyses = await listRepositoryAnalyses(repoId, limit);

    // Get run limits info
    const maxRunsPerMonth = planLimits.free.maxRunsPerMonth;
    const runsThisMonth = await getRunsThisMonth(session.user.id);
    const retentionDays = planLimits.free.dataRetentionDays;

    // Add expiry info to each analysis
    const analysesWithExpiry = analyses.map((a) => {
      const createdAt = new Date(a.createdAt);
      const expiresAt = new Date(
        createdAt.getTime() + retentionDays * 24 * 60 * 60 * 1000
      );
      const daysUntilExpiry = Math.max(
        0,
        Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      );

      return {
        ...a,
        expiresAt: expiresAt.toISOString(),
        daysUntilExpiry,
      };
    });

    return NextResponse.json({
      analyses: analysesWithExpiry,
      limits: {
        runsRemaining: maxRunsPerMonth - runsThisMonth,
        maxRunsPerMonth,
        resetDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ).toISOString(),
        retentionDays,
      },
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}
