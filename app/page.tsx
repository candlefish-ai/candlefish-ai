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
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #ffffff;
          background: #000000;
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
          font-size: 2.5rem;
          font-weight: 400;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }
        .logo-mark {
          width: 80px;
          height: 80px;
          background: #00CED1;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #000000;
          font-size: 40px;
        }
        .tagline {
          font-size: 1.25rem;
          color: #d4d4d4;
          margin-bottom: 2rem;
        }
        .hero {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 3rem;
          margin-bottom: 3rem;
          animation: slideUp 1s ease-out 0.3s both;
        }
        .hero h1 {
          font-size: 3rem;
          font-weight: 300;
          margin-bottom: 1.5rem;
          color: #ffffff;
          line-height: 1.2;
        }
        .hero h1 .accent {
          color: #00CED1;
        }
        .hero p {
          font-size: 1.25rem;
          color: #d4d4d4;
          margin-bottom: 2rem;
          line-height: 1.6;
          font-weight: 300;
        }
        .cta-button {
          display: inline-block;
          padding: 1rem 2rem;
          background: #00CED1;
          color: #000000;
          text-decoration: none;
          border-radius: 0;
          font-weight: 500;
          transition: background 0.3s ease, transform 0.3s ease;
          position: relative;
        }
        .cta-button:hover {
          background: #40E0D0;
          transform: translateY(-2px);
        }
        .cta-button::after {
          content: '→';
          margin-left: 0.5rem;
          display: inline-block;
          transition: none;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .feature {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
          animation: fadeIn 1s ease-out 0.6s both;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .feature:hover {
          transform: translateY(-4px);
          border-color: #00CED1;
        }
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #00CED1;
        }
        .feature h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #ffffff;
          font-weight: 500;
        }
        .feature p {
          color: #d4d4d4;
        }
        .meta-generator {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 3rem;
          margin-bottom: 3rem;
          animation: fadeIn 1s ease-out 0.9s both;
        }
        .meta-generator h2 {
          font-size: 2.5rem;
          font-weight: 300;
          margin-bottom: 1.5rem;
          color: #ffffff;
          text-align: center;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #d4d4d4;
          font-weight: 500;
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }
        .form-group input:focus {
          outline: none;
          border-color: #00CED1;
        }
        .generate-button {
          width: 100%;
          padding: 0.75rem 1.5rem;
          background: #00CED1;
          color: #000000;
          border: none;
          border-radius: 0;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          position: relative;
        }
        .generate-button:hover {
          background: #40E0D0;
          transform: translateY(-2px);
        }
        .generate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .generate-button::after {
          content: '→';
          margin-left: 0.5rem;
          display: inline-block;
          transition: none;
        }
        .result {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .result h3 {
          color: #ffffff;
          margin-bottom: 0.5rem;
        }
        .result p {
          color: #d4d4d4;
          font-family: 'Space Mono', 'SF Mono', Monaco, monospace;
          word-break: break-all;
        }
        footer {
          text-align: center;
          padding: 2rem 0;
          color: #737373;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
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
        .grid-pattern {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(0, 206, 209, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 206, 209, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: -1;
        }
      `}</style>

      <div className="grid-pattern"></div>
      <div className="container">
        <header>
          <div className="logo">
            <div className="logo-mark">C</div>
            <span>CANDLEFISH</span>
          </div>
          <p className="tagline">Illuminating the Depths of Artificial Intelligence</p>
        </header>

        <section className="hero">
          <h1>Illuminating the path to<br/><span className="accent">AI transformation</span></h1>
          <p>
            We turn your slowest business processes into your fastest competitive 
            advantages through discrete, composable AI modules.
          </p>
          <a href="#contact" className="cta-button">
            Explore Partnership
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
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#d4d4d4' }}>
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
            <div className="result" style={{ borderColor: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)' }}>
              <h3 style={{ color: '#ff6b6b' }}>Error</h3>
              <p style={{ color: '#ff6b6b' }}>{error}</p>
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