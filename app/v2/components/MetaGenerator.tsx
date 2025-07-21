'use client';

import { useState } from 'react';

export function MetaGenerator() {
  const [industry, setIndustry] = useState('');
  const [result, setResult] = useState<{ title: string; description: string; thinking?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showThinking, setShowThinking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/app/v2/api/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry }),
      });
      
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to generate meta tags');
      }
      
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meta-generator">
      <div className="generator-card">
        <form onSubmit={handleSubmit} className="generator-form">
          <div className="form-header">
            <h3>AI-Powered Meta Tag Generator</h3>
            <p>Powered by Claude Sonnet 4 with 2M thinking tokens</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="industry">Your Industry</label>
            <input
              type="text"
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Healthcare, Finance, E-commerce"
              required
              maxLength={50}
              className="form-input"
            />
            <span className="input-hint">{industry.length}/50 characters</span>
          </div>
          
          <button type="submit" className="generate-button" disabled={loading || !industry.trim()}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Thinking deeply...
              </>
            ) : (
              'Generate AI-Optimized Meta Tags'
            )}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result-container">
            <div className="result-item">
              <h4>SEO Title Tag</h4>
              <p className="result-text">{result.title}</p>
              <span className="char-count">{result.title.length}/60 chars</span>
            </div>
            
            <div className="result-item">
              <h4>Meta Description</h4>
              <p className="result-text">{result.description}</p>
              <span className="char-count">{result.description.length}/160 chars</span>
            </div>
            
            {result.thinking && (
              <div className="thinking-section">
                <button 
                  className="thinking-toggle"
                  onClick={() => setShowThinking(!showThinking)}
                >
                  {showThinking ? '🧠 Hide' : '🧠 Show'} AI Thinking Process
                </button>
                {showThinking && (
                  <div className="thinking-content">
                    <pre>{result.thinking}</pre>
                  </div>
                )}
              </div>
            )}
            
            <div className="result-actions">
              <button className="copy-button" onClick={() => {
                navigator.clipboard.writeText(`Title: ${result.title}\nDescription: ${result.description}`);
              }}>
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .meta-generator {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .generator-card {
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          border: 1px solid var(--border-color);
          animation: slideUp 0.6s ease-out;
        }
        
        .generator-form {
          padding: 2.5rem;
        }
        
        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .form-header h3 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .form-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-weight: 600;
        }
        
        .form-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .input-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-light);
          text-align: right;
        }
        
        .generate-button {
          width: 100%;
          padding: 1.25rem;
          background: var(--primary-gradient);
          color: white;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .generate-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        
        .generate-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .error-message {
          margin: 1.5rem;
          padding: 1rem;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #c33;
        }
        
        .result-container {
          background: #f8f9fa;
          padding: 2rem;
          border-top: 1px solid var(--border-color);
        }
        
        .result-item {
          background: white;
          padding: 1.5rem;
          border-radius: var(--radius-sm);
          margin-bottom: 1rem;
          border: 1px solid var(--border-color);
        }
        
        .result-item h4 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 1.125rem;
        }
        
        .result-text {
          font-family: 'Courier New', monospace;
          color: var(--text-secondary);
          line-height: 1.6;
          word-break: break-word;
        }
        
        .char-count {
          display: inline-block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-light);
          background: #f0f0f0;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
        }
        
        .thinking-section {
          margin-top: 1rem;
        }
        
        .thinking-toggle {
          background: transparent;
          border: 2px solid var(--border-color);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .thinking-toggle:hover {
          background: var(--bg-white);
          border-color: #667eea;
          color: #667eea;
        }
        
        .thinking-content {
          margin-top: 1rem;
          max-height: 300px;
          overflow-y: auto;
          background: white;
          padding: 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }
        
        .thinking-content pre {
          white-space: pre-wrap;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .result-actions {
          margin-top: 1rem;
          display: flex;
          gap: 1rem;
        }
        
        .copy-button {
          background: var(--accent-gradient);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .copy-button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .generator-form {
            padding: 1.5rem;
          }
          
          .result-container {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}