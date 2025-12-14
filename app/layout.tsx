import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Legal Translator - AI-Powered Legal Document Translation',
  description: 'Transform complex legal documents into clear, accessible plain English. AI-powered translation using OpenAI and Black\'s Law Dictionary.',
  keywords: 'legal translator, legal document translation, plain English, contract translator, legal jargon, AI legal assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}