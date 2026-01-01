'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { PLANS } from '@/lib/plans';

interface UsageStats {
  used: number;
  limit: number;
  resetDate: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchUsage();
    }
  }, [status, router]);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/user/usage');
      const data = await response.json();
      setUsage(data);
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    } finally {
      setLoading(false);
    }
  };

const handleCancelSubscription = async () => {
  if (!confirm('Are you sure you want to cancel your subscription? You\'ll keep access until the end of your billing period.')) {
    return;
  }

  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to cancel subscription');
    }

    alert('Subscription canceled. You\'ll keep access until the end of your billing period');

    // Refresh usage data
    fetchUsage();
  } catch (error) {
    console.error('Cancel error:', error);
    alert(error instanceof Error ? error.message : 'Failed to cancel subscription');
  }
};

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-legal-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-legal-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-legal-stone">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !usage) {
    return null;
  }

  const currentPlan = PLANS[usage.plan];
  const usagePercentage = usage.limit === 999999 
    ? 0 
    : (usage.used / usage.limit) * 100;

  return (
    <div className="min-h-screen bg-legal-cream">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-legal-navy mb-2">
              Dashboard
            </h1>
            <p className="text-legal-stone">
              Welcome back, {session.user?.name || session.user?.email}
            </p>
          </div>

          {/* Current Plan Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 border-2 border-legal-gold">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-legal-navy mb-1">
                  {currentPlan.name} Plan
                </h2>
                <p className="text-legal-stone text-sm">
                  {usage.plan === 'FREE' 
                    ? 'Upgrade to unlock more features'
                    : 'Thank you for being a subscriber!'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-legal-navy">
                  ${currentPlan.price}
                </div>
                <div className="text-sm text-legal-stone">
                  {currentPlan.price > 0 ? '/month' : 'free'}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-legal-navy">{feature}</span>
                </div>
              ))}
            </div>

           {usage.plan === 'FREE' ? (

            <a href="/pricing"
            className="block w-full py-3 bg-legal-gold text-legal-navy text-center rounded-lg font-semibold hover:bg-legal-gold/90 transition-colors"
            >
              Upgrade Plan
            </a>
           ) : (
            <button
            onClick={handleCancelSubscription}
            className="block w-full py-3 bg-red-50 text-red-700 border-2 border-red-200 text-center rounded-lg font-semibold hover:bg-red-100 transition-colors"
            >
            Cancel Subscription
            </button>
           )}
          </div>

          {/* Usage Stats */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="font-serif text-2xl font-bold text-legal-navy mb-6">
              Usage Statistics
            </h2>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-legal-navy">
                  Translations Used
                </span>
                <span className="text-sm text-legal-stone">
                  {usage.used} / {usage.limit === 999999 ? '∞' : usage.limit}
                </span>
              </div>
              
              {usage.limit !== 999999 && (
                <div className="w-full bg-legal-stone/20 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usagePercentage > 90 
                        ? 'bg-red-500' 
                        : usagePercentage > 70 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Reset Date */}
            <div className="p-4 bg-legal-cream rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-legal-stone">
                  Usage resets on:
                </span>
                <span className="text-sm font-semibold text-legal-navy">
                  {new Date(usage.resetDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Warning if close to limit */}
            {usagePercentage > 80 && usage.limit !== 999999 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">
                      Approaching Limit
                    </h4>
                    <p className="text-sm text-yellow-800">
                      You&apos;ve used {Math.round(usagePercentage)}% of your monthly translations.
                      {usage.plan === 'FREE' && (
                        <span> Consider upgrading for unlimited access.</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            
             <a href="/"
              className="bg-legal-navy text-legal-cream p-6 rounded-xl shadow-lg hover:bg-legal-slate transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Translate Document</h3>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-legal-cream/70 text-sm">
                Upload and translate a new legal document
              </p>
            </a>

            
             <a href="/pricing"
              className="bg-white border-2 border-legal-stone/20 p-6 rounded-xl shadow-lg hover:border-legal-gold transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg text-legal-navy">View Plans</h3>
                <svg className="w-6 h-6 text-legal-navy group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-legal-stone text-sm">
                Compare plans and upgrade your account
              </p>
            </a>
          </div>

          {/* Sign Out */}
          <div className="mt-8 text-center">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-legal-stone hover:text-legal-navy text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}