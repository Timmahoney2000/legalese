interface SystemStatus {
  groq: {
    configured: boolean;
    working: boolean;
    models: string[];
  };
  dictionary: {
    totalTerms: number;
    categories: string[];
  };
  rateLimit: {
    remaining: number;
    max: number;
    resetTime: number;
  };
  ready: boolean;
}

interface StatusBannerProps {
  status: SystemStatus;
  onRefresh: () => void;
}

export default function StatusBanner({ status, onRefresh }: StatusBannerProps) {
  const { groq, dictionary } = status;
  
  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-2">Setup Required</h3>
            
            {!groq.configured && (
              <div className="mb-3">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>❌ Groq API key not configured</strong>
                </p>
                <ol className="text-sm text-yellow-700 space-y-1 ml-4 list-decimal">
                  <li>Get free API key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">console.groq.com</a></li>
                  <li>Add GROQ_API_KEY to .env.local</li>
                  <li>Restart the dev server</li>
                </ol>
              </div>
            )}
            
            {groq.configured && !groq.working && (
              <div className="mb-3">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>⚠️ Groq API key invalid or connection failed</strong>
                </p>
                <p className="text-sm text-yellow-700">
                  Please check your API key and try again.
                </p>
              </div>
            )}
            
            {groq.working && (
              <div className="mb-3">
                <p className="text-sm text-green-700">
                  <strong>✓ Groq AI connected</strong> - {groq.models.length} models available
                </p>
              </div>
            )}
            
            {dictionary.totalTerms === 0 && (
              <div className="mb-3">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>❌ Dictionary not loaded</strong>
                </p>
                <p className="text-sm text-yellow-700">
                  Dictionary file is missing or empty.
                </p>
              </div>
            )}
            
            {dictionary.totalTerms > 0 && (
              <div className="mb-3">
                <p className="text-sm text-green-700">
                  <strong>✓ Dictionary loaded</strong> with {dictionary.totalTerms} legal terms
                </p>
              </div>
            )}
            
            <button
              onClick={onRefresh}
              className="mt-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors"
            >
              ↻ Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}