import Stripe from 'stripe';
import { PLANS } from './plans';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export { PLANS };

export type PlanType = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanType | null {
  if (priceId === PLANS.PRO.priceId) return 'PRO';
  if (priceId === PLANS.BUSINESS.priceId) return 'BUSINESS';
  return null;
}