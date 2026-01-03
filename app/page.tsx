'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentViewer from '@/components/DocumentViewer';
import Header from '@/components/Header';

interface SystemStatus {
  openai: {
    configured: boolean;
    working: boolean;
    model: string;
  };
  pinecone: {
    configured: boolean;
    working: boolean;
    index: string;
  };
  rateLimit: {
    remaining: number;
    max: number;
    resetTime: number;
  };
  ready: boolean;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [documentText, setDocumentText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  
  useEffect(() => {
    checkSystemStatus();
  }, []);
  
  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('Failed to check system status:', error);
    }
  };
  
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setTranslatedText('');
    
    try {
      // Upload and process document
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process document');
      }
      
      const data = await response.json();
      setDocumentText(data.document.text);
      setFileName(data.document.fileName);
      
      // Start translation
      await translateDocument(data.document.text, data.document.fileName);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };
  
const translateDocument = async (text: string, name: string) => {
  setIsTranslating(true);
  setTranslatedText('');
  
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText: text,
        fileName: name,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      
      // Authentication required
      if (response.status === 401) {
        alert('Please sign in to translate documents.');
        window.location.href = '/auth/signin?callbackUrl=/';
        return;
      }
      
      // Limit reached
      if (response.status === 429) {
        alert(error.message);
        if (error.upgradeUrl) {
          window.location.href = error.upgradeUrl;
        }
        return;
      }
      
      throw new Error(error.error || 'Failed to translate document');
    }

    const handleReset = () => {
  setDocumentText('');
  setTranslatedText('');
  setFileName('');
  setIsProcessing(false);
  setIsTranslating(false);
};
    
    // Update usage stats from headers
    const usageUsed = response.headers.get('X-Usage-Used');
    const usageLimit = response.headers.get('X-Usage-Limit');
    const usagePlan = response.headers.get('X-Usage-Plan');
    
    if (usageUsed && usageLimit) {
      console.log(`Usage: ${usageUsed}/${usageLimit} (${usagePlan} plan)`);
    }
    
    // Update system status to reflect new usage
    checkSystemStatus();
    
    // Stream the response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('Failed to get response reader');
    }
    
    let accumulated = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      accumulated += chunk;
      setTranslatedText(accumulated);
    }
    
  } catch (error) {
    console.error('Translation error:', error);
    alert(error instanceof Error ? error.message : 'Failed to translate document');
  } finally {
    setIsTranslating(false);
  }
};

const handleReset = () => {
  setDocumentText('');
  setTranslatedText('');
  setFileName('');
  setIsProcessing(false);
  setIsTranslating(false);
};
  
  return (
    <div className="min-h-screen bg-legal-cream">
      <Header />
      
      {/* Rate Limit Banner */}
      {systemStatus && systemStatus.rateLimit.remaining === 0 && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="container mx-auto px-4 py-3 text-center">
            <p className="text-sm text-red-800">
              ⚠️ You&apos;ve reached your daily limit of {systemStatus.rateLimit.max} translations. 
              Resets in {formatResetTime(systemStatus.rateLimit.resetTime)}.
            </p>
          </div>
        </div>
      )}
      
      {/* Remaining translations notice */}
      {systemStatus && systemStatus.rateLimit.remaining > 0 && systemStatus.rateLimit.remaining <= 3 && !documentText && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4 py-2 text-center">
            <p className="text-xs text-yellow-800">
              {systemStatus.rateLimit.remaining} free translation{systemStatus.rateLimit.remaining !== 1 ? 's' : ''} remaining today
            </p>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-12">
        {!documentText ? (
          <div className="max-w-4xl mx-auto">
            {/* Sign In Prompt for Non-Authenticated Users */}
{status === 'unauthenticated' && (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 animate-fade-in">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-blue-900 mb-1">
          Sign in to start translating
        </h3>
        <p className="text-sm text-blue-800 mb-3">
          Create a free account to translate legal documents with AI. Get 10 free translations per day!
        </p>
        <button
          onClick={() => signIn('google')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  </div>
)}
            <div className="text-center mb-12 animate-fade-in">
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  AI-Powered • {systemStatus?.rateLimit.remaining || 0} Translations Left Today
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-legal-navy mb-6">
                Legal Document
                <span className="gold-accent"> Translator</span>
              </h1>
              <p className="text-xl text-legal-stone max-w-2xl mx-auto leading-relaxed">
                Understand Legal Documents — Without Being a Lawyer
<br></br>
LawParse translates legal language into clear, plain English for professionals who work with contracts, policies, and agreements every day.

If you’re not a lawyer but still expected to understand legal documents, LawParse helps you make sense of them before you escalate to legal counsel.
              </p>
            </div>
            
            <div className="legal-pattern rounded-2xl p-8 mb-12">
              <DocumentUpload 
                onUpload={handleFileUpload}
                isProcessing={isProcessing}
                disabled={!systemStatus?.ready || systemStatus?.rateLimit.remaining === 0}
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up">
              <Feature
                icon="🤖"
                title="AI-Powered"
                description="Uses advanced OpenAI to understand and translate legal language"
              />
              <Feature
                icon="📚"
                title="Trusted, Source-Aware Explanations"
                description="LawParse generates explanations based on established legal definitions and publicly available legal sources, producing consistent, structured interpretations designed for non‑lawyers.

Outputs are informational only and should not be considered legal advice."
              />
              <Feature
                icon="🆓"
                title="Start Free — Upgrade When You Need More."
                description={`${systemStatus?.rateLimit.max || 5} free translations per day.
                 When you need higher limits, document uploads, or professional‑grade features, upgrade to a paid plan designed for real‑world workflows.`}
              />
            </div>
            
            {/* Info Section */}
            <div className="mt-16 p-8 bg-white rounded-xl document-shadow">
              <h2 className="font-serif text-2xl font-bold text-legal-navy mb-4 text-center">
                How It Works
              </h2>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <Step number="1" title="Upload" description="Drop your PDF, DOCX, or TXT legal document" />
                <Step number="2" title="Analyze" description="AI identifies legal terms and concepts, then references them based on reputable public legal sources" />
                <Step number="3" title="Translate" description="Convert to plain English with explanations" />
                <Step number="4" title="Download" description="Save or copy your translated document" />
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <DocumentViewer
              originalText={documentText}
              translatedText={translatedText}
              fileName={fileName}
              isTranslating={isTranslating}
              onReset={handleReset}
            />
          </div>
        )}
      </main>
      
      <footer className="border-t border-legal-stone/20 py-8 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-legal-stone text-sm space-y-2">
            <p className="font-medium">
              Based on established legal definitions and publicly available legal sources.
            </p>
            <p className="text-xs opacity-70">
              Translations are AI-generated and should not be considered legal advice. 
              Consult a qualified attorney for legal matters.
            </p>
           
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center group">
      <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-serif font-semibold text-legal-navy text-lg mb-2">
        {title}
      </h3>
      <p className="text-legal-stone text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div>
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-legal-gold/20 flex items-center justify-center">
        <span className="text-legal-navy font-bold text-lg">{number}</span>
      </div>
      <h3 className="font-semibold text-legal-navy mb-1">{title}</h3>
      <p className="text-sm text-legal-stone">{description}</p>
    </div>
  );
}

function formatResetTime(resetTime: number): string {
  const now = Date.now();
  const diff = resetTime - now;
  
  if (diff < 0) return 'soon';
  
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}