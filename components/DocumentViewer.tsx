'use client';

import { useState } from 'react';

interface DocumentViewerProps {
  originalText: string;
  translatedText: string;
  fileName: string;
  isTranslating: boolean;
  onReset: () => void;
}

export default function DocumentViewer({
  originalText,
  translatedText,
  fileName,
  isTranslating,
  onReset,
}: DocumentViewerProps) {
  const [view, setView] = useState<'split' | 'original' | 'translated'>('split');
  
  const handleDownload = () => {
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated-${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(translatedText);
    alert('Translated text copied to clipboard!');
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-legal-navy mb-2">
            {fileName}
          </h2>
          <p className="text-legal-stone">
            {isTranslating ? 'Translating with AI...' : 'Translation complete'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="px-4 py-2 border border-legal-stone/30 text-legal-navy rounded-lg hover:bg-legal-navy/5 transition-colors"
          >
            ← New Document
          </button>
          
          {translatedText && !isTranslating && (
            <>
              <button
                onClick={handleCopy}
                className="px-4 py-2 border border-legal-stone/30 text-legal-navy rounded-lg hover:bg-legal-navy/5 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy
              </button>
              
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-legal-navy text-legal-cream rounded-lg hover:bg-legal-slate transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* View Toggle */}
      <div className="mb-6 flex items-center gap-2 bg-legal-navy/5 p-1 rounded-lg w-fit">
        <button
          onClick={() => setView('split')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'split'
              ? 'bg-legal-navy text-legal-cream'
              : 'text-legal-navy hover:bg-legal-navy/10'
          }`}
        >
          Split View
        </button>
        <button
          onClick={() => setView('original')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'original'
              ? 'bg-legal-navy text-legal-cream'
              : 'text-legal-navy hover:bg-legal-navy/10'
          }`}
        >
          Original Only
        </button>
        <button
          onClick={() => setView('translated')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'translated'
              ? 'bg-legal-navy text-legal-cream'
              : 'text-legal-navy hover:bg-legal-navy/10'
          }`}
        >
          Translation Only
        </button>
      </div>
      
      {/* Document Panels */}
      <div className={`grid gap-6 ${view === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {(view === 'split' || view === 'original') && (
          <div className="document-shadow rounded-xl overflow-hidden bg-white">
            <div className="bg-legal-slate text-legal-cream px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif font-semibold">Original Document</h3>
              <span className="text-xs bg-legal-cream/20 px-3 py-1 rounded-full">
                Legal Text
              </span>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-legal-navy">
                {originalText}
              </pre>
            </div>
          </div>
        )}
        
        {(view === 'split' || view === 'translated') && (
          <div className="document-shadow rounded-xl overflow-hidden bg-white border-2 border-green-400">
            <div className="bg-legal-navy text-legal-cream px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif font-semibold">Plain English Translation</h3>
             <span className="text-xs bg-green-400 px-3 py-1 rounded-full text-legal-navy font-medium">
  GPT-4 + Pinecone
</span>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              {isTranslating && !translatedText && (
                <div className="flex items-center gap-3 text-legal-stone">
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <span>Translating your document with AI...</span>
                </div>
              )}
              
              {translatedText && (
                <div className="prose prose-legal max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-legal-navy">
                    {translatedText}
                  </pre>
                </div>
              )}
              
              {!isTranslating && !translatedText && (
                <p className="text-legal-stone italic">
                  Translation will appear here...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Info Box */}
      {translatedText && !isTranslating && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-serif font-semibold text-legal-navy mb-2">
                Translation Complete - Free & Fast
              </h4>
              <p className="text-sm text-legal-navy/80 leading-relaxed">
                This translation was generated using OpenAI GPT-4 with Pinecone vector database for semantic legal term matching.
                While we strive for accuracy, please consult with a legal professional for important matters.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}