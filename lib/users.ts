import type { User, UsageStats } from '@/types';
import { PLANS, type PlanType } from './plans';

// In-memory user storage (replace with database later)
const users = new Map<string, User>();

export function createOrGetUser(email: string): User {
  let user = users.get(email);
  
  if (!user) {
    user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      plan: 'FREE',
      translationsUsed: 0,
      translationsResetDate: getNextResetDate(),
    };
    users.set(email, user);
  }
  
  return user;
}

export function getUserByEmail(email: string): User | null {
  return users.get(email) || null;
}

export function updateUserPlan(
  email: string,
  plan: PlanType,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): User | null {
  const user = users.get(email);
  if (!user) return null;
  
  user.plan = plan;
  user.stripeCustomerId = stripeCustomerId;
  user.stripeSubscriptionId = stripeSubscriptionId;
  user.subscriptionStatus = 'active';
  
  users.set(email, user);
  return user;
}

export function incrementUsage(email: string): boolean {
  const user = users.get(email);
  if (!user) return false;
  
  // Reset if needed
  if (new Date() > user.translationsResetDate) {
    user.translationsUsed = 0;
    user.translationsResetDate = getNextResetDate();
  }
  
 const limit = user.plan === 'FREE'
 ? PLANS.FREE.translationsPerDay
 : user.plan === 'PRO'
 ? PLANS.PRO.translationsPerMonth
 : PLANS.BUSINESS.translationsPerMonth;
  
  // Business plan has unlimited (-1)
  if (limit === -1 || user.translationsUsed < limit) {
    user.translationsUsed++;
    users.set(email, user);
    return true;
  }
  
  return false; // Limit reached
}

export function getUsageStats(email: string): UsageStats | null {
  const user = users.get(email);
  if (!user) return null;
  
  const plan = PLANS[user.plan];
  const limit = user.plan === 'FREE'
    ? PLANS.FREE.translationsPerDay
    : user.plan === 'PRO'
    ? PLANS.PRO.translationsPerMonth
    : PLANS.BUSINESS.translationsPerMonth;
  
  return {
    used: user.translationsUsed,
    limit: limit === -1 ? 999999 : limit,
    resetDate: user.translationsResetDate,
    plan: user.plan,
  };
}

function getNextResetDate(): Date {
  const now = new Date();
  // Reset at midnight tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}