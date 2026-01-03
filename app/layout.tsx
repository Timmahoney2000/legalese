import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

import { AnalyticsProps } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'LawParse - AI-Powered Legal Document Translation | Plain English Explanations',
  description: 'Transform complex legal documents plain English instantly. AI-powered legal translation trusted by thousands. try free - 10 translations per day.',
  keywords: 'legal document translator, legal jargon, plain English, contract translator, legal AI, document simplification.',
  openGraph: {
    title: 'LawParse - AI legal Document Translator',
    description: 'Transform complex legal documents into plain English instantly',
    url: 'http://lawparse.com',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareAppLocation",
    "name": "LawParse",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "ratingValue": "4.8",
      "ratingCount": "127"
    }
  };
  
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}