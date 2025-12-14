export default function Header() {
  return (
    <header className="border-b border-legal-gold/30 bg-legal-navy">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-legal-gold flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-legal-cream">
                LegalTranslate
              </h1>
              <p className="text-legal-gold text-xs">
                Free AI-Powered Translation
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="#how-it-works" 
              className="text-legal-cream hover:text-legal-gold transition-colors text-sm font-medium"
            >
              How It Works
            </a>
            <a 
              href="https://github.com/yourusername/legal-translator" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-legal-cream hover:text-legal-gold transition-colors text-sm font-medium"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}