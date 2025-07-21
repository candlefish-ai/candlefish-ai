export function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Where Natural Wisdom Meets
            <span className="gradient-text"> Artificial Intelligence</span>
          </h1>
          <p className="hero-description">
            Like the candlefish that lights up the ocean depths, we illuminate the path through
            the vast sea of AI possibilities. Our consciousness-aligned approach ensures your
            AI transformation enhances rather than replaces human intelligence.
          </p>
          <div className="hero-actions">
            <button className="cta-primary">Light Your Path Forward</button>
            <button className="cta-secondary">Explore Our Vision</button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">2M+</div>
              <div className="stat-label">Thinking Tokens</div>
            </div>
            <div className="stat">
              <div className="stat-value">400K</div>
              <div className="stat-label">Output Capacity</div>
            </div>
            <div className="stat">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .hero {
          padding: 6rem 0;
          background: radial-gradient(ellipse at top, rgba(102, 126, 234, 0.1) 0%, transparent 50%);
          position: relative;
          overflow: hidden;
        }
        
        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 107, 107, 0.05) 0%, transparent 70%);
          animation: rotate 30s linear infinite;
        }
        
        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          animation: slideUp 1s ease-out;
        }
        
        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }
        
        .gradient-text {
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 800px;
          margin: 0 auto 2.5rem;
          line-height: 1.8;
        }
        
        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 4rem;
        }
        
        .cta-primary, .cta-secondary {
          padding: 1rem 2.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .cta-primary {
          background: var(--primary-gradient);
          color: white;
          box-shadow: var(--shadow-md);
        }
        
        .cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        
        .cta-secondary {
          background: transparent;
          color: var(--text-primary);
          border: 2px solid var(--border-color);
        }
        
        .cta-secondary:hover {
          background: var(--bg-white);
          border-color: transparent;
          box-shadow: var(--shadow-md);
        }
        
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .stat {
          text-align: center;
          padding: 1.5rem;
          background: var(--bg-white);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          transition: all 0.3s ease;
        }
        
        .stat:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        
        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .stat-label {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .hero {
            padding: 4rem 0;
          }
          
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-description {
            font-size: 1.125rem;
          }
          
          .hero-actions {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
            margin: 0 auto 3rem;
          }
          
          .cta-primary, .cta-secondary {
            width: 100%;
          }
          
          .hero-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}