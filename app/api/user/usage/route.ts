import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUsageStats, getUserPlanFromStripe, createOrGetUser } from '@/lib/users';


export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Temporary Test - Force Return Pro
    return NextResponse.json({
      used: 0,
      limit: 100,
      resetDate: new Date(),
      plan: 'PRO',
      test: 'FORCED PRO RESPONSE'
    });
  } catch (error) {
    console.error('Usage stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get usage stats' },
      { status: 500 }
    );
  }
}
