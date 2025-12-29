import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, getPlanByPriceId } from '@/lib/stripe';
import { updateUserPlan } from '@/lib/users';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const priceId = subscription.items.data[0].price.id;
        const planType = getPlanByPriceId(priceId);

        if (planType && session.metadata?.userEmail) {
          updateUserPlan(
            session.metadata.userEmail,
            planType,
            session.customer as string,
            session.subscription as string
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        const planType = getPlanByPriceId(priceId);

        // Get customer email
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );

        if (planType && 'email' in customer && customer.email) {
          updateUserPlan(
            customer.email,
            planType,
            subscription.customer as string,
            subscription.id
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get customer email
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );

        if ('email' in customer && customer.email) {
          // Downgrade to free plan
          updateUserPlan(customer.email, 'FREE');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}