export const PLANS = {
    FREE: {
        name: 'Free',
        price: 0,
        translationsPerDay: 10,
        maxPages: 10,
        features: [
            '10 translations per day',
            'Up to 10 pages per document',
            'Basic support',
        ],
    },
    PRO: {
        name: 'Pro',
        price: 19,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || process.env.STRIPE_PRICE_ID_PRO,
        translationsPerMonth: 100,
        maxPages: 50,
        features: [
            '100 translations per month',
            'Up to 50 pages per document',
            'Priority processing',
            'Email support',
            'Download as DOCX/PDF',
        ],
    },
    BUSINESS: {
        name: 'Business',
        price: 99,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS || process.env.STRIPE_PRICE_ID_BUSINESS,
        translationsPerMonth: -1, // unlimited
        maxPages: -1, // unlimited
        features: [
            'Unlimited translations',
            'Unlimited page length',
            'Batch processing',
            'API access',
            'Priority support',
            'Custom branding options',
        ],
    },
} as const;

export type PlanType = keyof typeof PLANS;