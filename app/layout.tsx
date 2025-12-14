import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Legal Translator - Free AI-Powered Legal Document Translation',
  description: 'Transform complex legal documents into clear, accessible plain English. Free AI-powered translation using Groq and Black\'s Law Dictionary. Perfect for understanding contracts, agreements, and legal paperwork.',
  keywords: 'legal translator, legal document translation, plain English, contract translator, legal jargon, free legal help, AI legal assistant',
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Legal Translator - Free AI-Powered Legal Document Translation',
    description: 'Transform complex legal documents into clear, accessible plain English. Free AI-powered translation.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}