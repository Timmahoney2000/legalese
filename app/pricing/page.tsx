'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import PricingCard from '@/components/PricingCard';
import Header from '@/components/Header';
import { PLANS } from '@/lib/plans';

export default function PricingPage() {
  const { data: session } = useSession();
  const [currentPlan, setCurrentPlan] = useState<string>('FREE');

  useEffect(() => {
    const fetchPlan = async () => {
      if (!session) return;
      
      try {
        const response = await fetch('/api/user/usage');
        const data = await response.json();
        setCurrentPlan(data.plan || 'FREE');
      } catch (error) {
        console.error('Failed to fetch plan:', error);
      }
    };

    fetchPlan();
  }, [session]);

  return (
    <div className="min-h-screen bg-legal-cream">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold text-legal-navy mb-4">
            Choose Your Plan
          </h1>
          <p className="text-legal-stone text-lg">
            Select the perfect plan for your legal translation needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            name={PLANS.FREE.name}
            price={PLANS.FREE.price}
            features={PLANS.FREE.features}
            isCurrentPlan={currentPlan === 'FREE'}
          />

          <PricingCard
            name={PLANS.PRO.name}
            price={PLANS.PRO.price}
            priceId={PLANS.PRO.priceId}
            features={PLANS.PRO.features}
            isPopular={true}
            isCurrentPlan={currentPlan === 'PRO'}
          />

          <PricingCard
            name={PLANS.BUSINESS.name}
            price={PLANS.BUSINESS.price}
            priceId={PLANS.BUSINESS.priceId}
            features={PLANS.BUSINESS.features}
            isCurrentPlan={currentPlan === 'BUSINESS'}
          />
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-legal-navy mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes! You can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="Yes, we offer a 14-day money-back guarantee if you&apos;re not satisfied"
            />
            <FAQItem
              question="Can I upgrade my plan later?"
              answer="Absolutely! You can upgrade your plan at any time and only pay the prorated difference."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-legal-navy mb-2">{question}</h3>
      <p className="text-legal-stone text-sm">{answer}</p>
    </div>
  );
}