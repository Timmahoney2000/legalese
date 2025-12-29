// Existing interfaces...
export interface DictionaryEntry {
  term: string;
  definition: string;
  category?: string;
}

export interface ProcessedDocument {
  originalText: string;
  translatedText?: string;
  identifiedTerms: string[];
  fileName: string;
  fileType: string;
}

export interface TranslationRequest {
  documentText: string;
  fileName: string;
}

export interface DictionaryMatch {
  term: string;
  definition: string;
  category?: string;
  relevance: number;
}

// NEW: User and Subscription Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  translationsUsed: number;
  translationsResetDate: Date;
}

export interface UsageStats {
  used: number;
  limit: number;
  resetDate: Date;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
}