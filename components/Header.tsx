'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-legal-gold/30 bg-legal-navy">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-legal-gold flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-legal-cream">
                LawParse
              </h1>
              <p className="text-legal-gold text-xs">
                AI Legal Translation
              </p>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-legal-cream hover:text-legal-gold transition-colors text-sm font-medium"
            >
              Pricing
            </Link>

            {status === 'loading' ? (
              <div className="w-8 h-8 border-2 border-legal-gold border-t-transparent rounded-full animate-spin" />
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-legal-cream hover:text-legal-gold transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 bg-legal-gold text-legal-navy rounded-lg text-sm font-medium hover:bg-legal-gold/90 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="px-4 py-2 bg-legal-gold text-legal-navy rounded-lg text-sm font-medium hover:bg-legal-gold/90 transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}