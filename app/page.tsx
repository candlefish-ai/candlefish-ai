'use client';

import { useState } from 'react';
import Logo from '../components/Logo';

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
    <div className="candlefish-page">
      {/* Advanced background patterns */}
      <div className="candlefish-grid-pattern"></div>
      <div className="candlefish-neural-pattern"></div>
      
      <div className="candlefish-container">
        {/* Header with Logo */}
        <header className="candlefish-header candlefish-fade-in">
          <Logo 
            variant="horizontal" 
            size="xl" 
            animated={true}
          />
          <p className="candlefish-tagline">Illuminating the Depths of Artificial Intelligence</p>
        </header>

        {/* Hero Section */}
        <section className="candlefish-hero candlefish-slide-up candlefish-stagger-1">
          <h1 className="candlefish-hero__title">
            Illuminating the path to<br/>
            <span className="candlefish-hero__accent">AI transformation</span>
          </h1>
          <p className="candlefish-hero__subtitle">
            We turn your slowest business processes into your fastest competitive 
            advantages through discrete, composable AI modules.
          </p>
          <a href="#contact" className="candlefish-cta">
            Explore Partnership
            <span className="candlefish-cta__icon">→</span>
          </a>
        </section>

        {/* Features Grid */}
        <section className="candlefish-features candlefish-adaptive-layout candlefish-slide-up candlefish-stagger-2">
          <div className="candlefish-feature">
            <div className="candlefish-feature__icon">🕯️</div>
            <h3 className="candlefish-feature__title">Illumination</h3>
            <p className="candlefish-feature__description">
              We bring clarity to complex AI challenges, lighting the way through technical
              depths with wisdom and expertise.
            </p>
          </div>
          <div className="candlefish-feature">
            <div className="candlefish-feature__icon">🌊</div>
            <h3 className="candlefish-feature__title">Deep Navigation</h3>
            <p className="candlefish-feature__description">
              Navigate the ocean of data and possibilities with our experienced guidance,
              finding treasures in the depths.
            </p>
          </div>
          <div className="candlefish-feature">
            <div className="candlefish-feature__icon">🧬</div>
            <h3 className="candlefish-feature__title">Symbiosis</h3>
            <p className="candlefish-feature__description">
              Seamlessly blend artificial intelligence with your organization's natural
              wisdom and human expertise.
            </p>
          </div>
        </section>

        {/* Meta Generator Demo */}
        <section className="candlefish-meta-generator candlefish-slide-up candlefish-stagger-3">
          <h2 className="candlefish-meta-generator__title">AI-Powered SEO Meta Generator</h2>
          <p className="candlefish-meta-generator__subtitle">
            Experience our AI capabilities. Generate optimized meta tags for your industry.
          </p>
          
          <form onSubmit={handleSubmit} className="candlefish-container">
            <div className="candlefish-form-group">
              <label htmlFor="industry" className="candlefish-form-label">Your Industry</label>
              <input
                type="text"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Healthcare, Technology, Finance"
                required
                className="candlefish-form-input"
              />
            </div>
            <button type="submit" disabled={loading} className="candlefish-generate-button">
              {loading ? 'Generating…' : 'Generate AI-Optimized Meta Tags'}
              {!loading && <span className="candlefish-cta__icon">→</span>}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="candlefish-result candlefish-result--error candlefish-fade-in">
              <h3 className="candlefish-result__title candlefish-result__title--error">Error</h3>
              <p className="candlefish-result__content candlefish-result__content--error">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="candlefish-result candlefish-fade-in">
              <h3 className="candlefish-result__title">Generated Title Tag</h3>
              <p className="candlefish-result__content">{result.title}</p>
              <h3 className="candlefish-result__title" style={{ marginTop: '1rem' }}>Generated Meta Description</h3>
              <p className="candlefish-result__content">{result.description}</p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="candlefish-footer">
          <p>© 2024 Candlefish AI. Illuminating the future of artificial intelligence.</p>
        </footer>
      </div>
    </div>
  );
}