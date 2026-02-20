import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getRemediation, updateRemediation } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const remediation = await getRemediation(id);

    if (!remediation) {
      return NextResponse.json({ error: 'Remediation not found' }, { status: 404 });
    }

    // Check if user is owner or team admin
    if (remediation.userId !== session.user.id && session.user.role !== 'owner' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { reason } = body;

    await updateRemediation(id, {
      status: 'rejected',
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, status: 'rejected' });
  } catch (error) {
    console.error('Error rejecting remediation:', error);
    return NextResponse.json({ error: 'Failed to reject remediation' }, { status: 500 });
  }
}