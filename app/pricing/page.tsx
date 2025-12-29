import { Suspense } from 'react';
import Header from '@/components/Header';
import PricingCard from '@/components/PricingCard';
import { PLANS } from '@/lib/plans';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-legal-cream">
            <Header />

            <main className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="font-serif text-5xl font-bold text-legal-navy mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-legal-stone max-w-2xl mx-auto">
                        Choose the plan that&apos;s right for you. Upgrade or downgrade anytime.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <PricingCard
                    name={PLANS.FREE.name}
                    price={PLANS.FREE.price}
                    features={PLANS.FREE.features}
                    />

                    <PricingCard
                    name={PLANS.PRO.name}
                    price={PLANS.PRO.price}
                    priceId={PLANS.PRO.priceId}
                    features={PLANS.PRO.features}
                    isPopular
                    />

                    <PricingCard
                    name={PLANS.BUSINESS.name}
                    price={PLANS.BUSINESS.price}
                    priceId={PLANS.BUSINESS.priceId}
                    features={PLANS.BUSINESS.features}
                    />
                </div>

                {/* FAQ Section */}
                <div className="mt-24 max-w-3xl mx-auto">
                    <h2 className="font-serif text-3xl font-bold text-legal-navy mb-8 text-center">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <FAQItem
                        question="Can I cancel anytime?"
                        answer="Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
                        />
                        <FAQItem
                        question="Do you offer refunds?"
                        answer="Yes, we offer a 14-day money-back guarantee if you're not satisfied"
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