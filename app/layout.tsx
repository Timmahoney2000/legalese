import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'LawParse - AI-Powered Legal Document Translation | Plain English Explanations',
  description: 'Transform complex legal documents into plain English instantly. AI-powered legal translation trusted by thousands. Try free - 10 translations per day.',
  keywords: 'legal document translator, legal jargon, plain English, contract translator, legal AI, document simplification',
  openGraph: {
    title: 'LawParse - AI Legal Document Translator',
    description: 'Transform complex legal documents into plain English instantly',
    url: 'https://lawparse.com',
    siteName: 'LawParse',
    images: [
      {
        url: 'https://lawparse.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LawParse - AI Legal Document Translator',
    description: 'Transform complex legal documents into plain English instantly',
    images: ['https://lawparse.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "LawParse",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}