import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'LawParse - AI-Powered Legal Document Translation',
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
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}