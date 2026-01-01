import Stripe from 'stripe';
import { PLANS } from './plans';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

export { PLANS };

export type PlanType = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanType | null {
  const proPriceId = process.env.STRIPE_PRICE_ID_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
  const businessPriceId = process.env.STRIPE_PRICE_ID_BUSINESS || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS;

  console.log('getPlanByPriceId call with:', priceId);
  console.log('Pro price ID:', proPriceId);
  console.log('Business price ID:', businessPriceId);

 if (priceId === proPriceId) {
  console.log('Matches PRO plan!');
  return 'PRO';
 }
 if (priceId === businessPriceId) {
  console.log('Matched BUSINESS plan!');
  return 'BUSINESS';
 }

 console.log('No match found - returning null');
 return null;
}