import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { planType } = await req.json();

    if (!planType || (planType !== 'PRO' && planType !== 'BUSINESS')) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );

      // Check for existing subscription
      const existingCustomers = await stripe.customers.list({
        email: session.user.email!,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0];

        // Check for active subscriptions
        const activeSubscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1,
        });

        if (activeSubscriptions.data.length > 0) {
          return NextResponse.json(
            {
              error: 'You already have an active subscription. Please cancel your current subscription before upgrading.',
              redirectUrl: '/dashboard'
            },
            { status: 400 }
          );
        }
      }
    }

    const plan = PLANS[planType];

    if (!plan.priceId) {
      return NextResponse.json(
      { error: 'Plan not configured' },
      { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userEmail: session.user.email!,
        planType,
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
    { error: 'Failed to start checkout' },
    { status: 500 }
    );
}
}