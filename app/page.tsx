'use client';

import { useState } from 'react';

export default function Home() {
  const [industry, setIndustry] = useState('');
  const [result, setResult] = useState<{ title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Unknown error');
      }
      setResult(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
            Cantarell, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        header {
          text-align: center;
          padding: 4rem 0;
          animation: fadeIn 1s ease-out;
        }
        .logo {
          font-size: 3rem;
          font-weight: 300;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #ff6b6b, #ffd93d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tagline {
          font-size: 1.25rem;
          color: #4a5568;
          margin-bottom: 2rem;
        }
        .hero {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin-bottom: 3rem;
          animation: slideUp 1s ease-out 0.3s both;
        }
        .hero h1 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: #2d3748;
        }
        .hero p {
          font-size: 1.125rem;
          color: #4a5568;
          margin-bottom: 2rem;
          line-height: 1.8;
        }
        .cta-button {
          display: inline-block;
          padding: 1rem 2rem;
          background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .feature {
          background: rgba(255, 255, 255, 0.8);
          padding: 2rem;
          border-radius: 15px;
          text-align: center;
          animation: fadeIn 1s ease-out 0.6s both;
        }
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .feature h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }
        .feature p {
          color: #4a5568;
        }
        .meta-generator {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin-bottom: 3rem;
          animation: fadeIn 1s ease-out 0.9s both;
        }
        .meta-generator h2 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #2d3748;
          text-align: center;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #4a5568;
          font-weight: 600;
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }
        .generate-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(45deg, #ff6b6b 0%, #ffd93d 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .generate-button:hover {
          transform: translateY(-2px);
        }
        .generate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .result {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #f7fafc;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
        }
        .result h3 {
          color: #2d3748;
          margin-bottom: 0.5rem;
        }
        .result p {
          color: #4a5568;
          font-family: 'Courier New', monospace;
          word-break: break-all;
        }
        footer {
          text-align: center;
          padding: 2rem 0;
          color: #718096;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 768px) {
          .logo {
            font-size: 2rem;
          }
          .hero h1 {
            font-size: 1.75rem;
          }
          .container {
            padding: 1rem;
          }
        }
      `}</style>

      <div className="container">
        <header>
          <div className="logo">🕯️ CANDLEFISH AI 🐟</div>
          <p className="tagline">Illuminating the Depths of Artificial Intelligence</p>
        </header>

        <section className="hero">
          <h1>Where Natural Wisdom Meets Artificial Intelligence</h1>
          <p>
            Like the candlefish that lights up the ocean depths, we illuminate the path through
            the vast sea of AI possibilities. Our consciousness-aligned approach ensures your
            AI transformation enhances rather than replaces human intelligence.
          </p>
          <a href="#contact" className="cta-button">
            Light Your Path Forward
          </a>
        </section>

        <section className="features">
          <div className="feature">
            <div className="feature-icon">🕯️</div>
            <h3>Illumination</h3>
            <p>
              We bring clarity to complex AI challenges, lighting the way through technical
              depths with wisdom and expertise.
            </p>
          </div>
          <div className="feature">
            <div className="feature-icon">🌊</div>
            <h3>Deep Navigation</h3>
            <p>
              Navigate the ocean of data and possibilities with our experienced guidance,
              finding treasures in the depths.
            </p>
          </div>
          <div className="feature">
            <div className="feature-icon">🧬</div>
            <h3>Natural Integration</h3>
            <p>
              Seamlessly blend artificial intelligence with your organization's natural
              wisdom and human expertise.
            </p>
          </div>
        </section>

        <section className="meta-generator">
          <h2>AI-Powered SEO Meta Generator</h2>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#718096' }}>
            Experience our AI capabilities. Generate optimized meta tags for your industry.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="industry">Your Industry</label>
              <input
                type="text"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Healthcare, Finance, E-commerce"
                required
              />
            </div>
            <button type="submit" className="generate-button" disabled={loading}>
              {loading ? 'Generating…' : 'Generate AI-Optimized Meta Tags'}
            </button>
          </form>

          {error && (
            <div className="result" style={{ borderColor: '#feb2b2', background: '#fff5f5' }}>
              <h3 style={{ color: '#c53030' }}>Error</h3>
              <p style={{ color: '#c53030' }}>{error}</p>
            </div>
          )}

          {result && (
            <div className="result">
              <h3>Generated Title Tag</h3>
              <p>{result.title}</p>
              <h3 style={{ marginTop: '1rem' }}>Generated Meta Description</h3>
              <p>{result.description}</p>
            </div>
          )}
        </section>

        <footer>
          <p>&copy; 2024 Candlefish AI. Illuminating Intelligence. 🕯️🐟</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Born from a serendipitous bathroom discovery, lighting the way to AI
            transformation.
          </p>
        </footer>
      </div>
    </>
  );
}