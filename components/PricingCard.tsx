'use client';

import { useState } from 'react';

interface PricingCardProps {
  name: string;
  price: number;
  priceId?: string;
  features: readonly string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
}

export default function PricingCard({
  name,
  price,
  priceId,
  features,
  isPopular,
  isCurrentPlan,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!priceId) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          planType: name.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        relative rounded-2xl p-8 border-2 bg-white
        ${isPopular 
          ? 'border-legal-gold shadow-2xl scale-105' 
          : 'border-legal-stone/20 shadow-lg'
        }
        ${isCurrentPlan ? 'ring-4 ring-green-400' : ''}
      `}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-legal-gold text-legal-navy px-4 py-1 rounded-full text-sm font-bold">
            MOST POPULAR
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            CURRENT PLAN
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="font-serif text-2xl font-bold text-legal-navy mb-2">
          {name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-legal-navy">
            ${price}
          </span>
          {price > 0 && (
            <span className="text-legal-stone">/month</span>
          )}
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-legal-navy text-sm">{feature}</span>
          </li>
        ))}
      </ul>

   <button
   onClick={handleSubscribe}
   disabled={loading || isCurrentPlan}
   className={`w-full py-3 rounded-lg font-semibold transition-colors ${
    isCurrentPlan
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
    : isPopular
    ? 'bg-legal-gold text-legal-navy hover:bg-legal-gold/90'
    : 'bg-legal-navy text-white hover:bg-legal-navy/90'
   } ${loading ? 'opacity-50 cursor-wait' : ''}`}
   >
    {loading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : 'Subscribe Now'}
   </button>
    </div>
  );
}