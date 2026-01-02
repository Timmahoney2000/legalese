import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
        }

        // Find customer by email
        const customers = await stripe.customers.list({
            email: session.user.email,
            limit: 1,
        });

        if (customers.data.length === 0) {
            return NextResponse.json(
                { error: 'No subscription found' },
                { status: 404 }
            );
        }

        const customer = customers.data[0];

        // Get active subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            );
        }

        // Cancel the subscription at period end
        const subscription = await stripe.subscriptions.update(
            subscriptions.data[0].id,
            {
                cancel_at_period_end: true,
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Subscription will cancel at the end of your billing period',
            cancelAt: subscription.cancel_at,
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500}
        );
    }
}
