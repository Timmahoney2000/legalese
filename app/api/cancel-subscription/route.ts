import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsageStats, getUserPlanFromStripe, createOrGetUser } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await ggetServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'Unauthaurized' },
                { status: 401 }
            );
        }

        // Get plan from Stripe 
        const actualPlan = await getUserPlanFromStripe(session.user.email);

        // Update local user with actual plan
        const user = createOrgetUser(session.user.email);
        user.plan = actualPlan;

        const usage = getUsageStats(session.user.email);

        if (!usage) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(usage);
    } catch (error) {
        console.error('Usage stats error:', error);
        return NextResponse.json(
            { error: 'Failed to get usage stats' },
            { status: 500 }
        );
    }
}