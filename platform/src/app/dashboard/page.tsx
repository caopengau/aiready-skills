import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import {
  listUserRepositories,
  getLatestAnalysis,
  getUserByEmail,
  createUser,
} from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  let user;
  let repos: any[] = [];

  try {
    // Ensure user exists in our database (lazy creation for OAuth users)
    user = await getUserByEmail(session.user.email);

    if (!user) {
      // Create user from session data
      user = await createUser({
        id: crypto.randomUUID(),
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Fetch user's repositories
    repos = await listUserRepositories(user.id);
  } catch (error) {
    console.error('Dashboard error:', error);
    // If there's a database error, still show dashboard with empty state
    user = {
      id: session.user.id || 'temp',
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    };
  }

  // Fetch latest analysis for each repo
  const reposWithAnalysis = await Promise.all(
    repos.map(async (repo) => {
      const latestAnalysis = await getLatestAnalysis(repo.id);
      return { ...repo, latestAnalysis };
    })
  );

  // Calculate overall AI score (average of all repos)
  const reposWithScores = reposWithAnalysis.filter(
    (r) => r.aiScore !== undefined
  );
  const overallScore =
    reposWithScores.length > 0
      ? Math.round(
          reposWithScores.reduce((sum, r) => sum + (r.aiScore || 0), 0) /
            reposWithScores.length
        )
      : null;

  return (
    <DashboardClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      }}
      repos={reposWithAnalysis}
      overallScore={overallScore}
    />
  );
}
