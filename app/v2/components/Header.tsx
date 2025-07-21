export function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🕯️</span>
            <span className="logo-text">CANDLEFISH AI</span>
            <span className="logo-icon">🐟</span>
          </div>
          <nav className="nav">
            <a href="#features" className="nav-link">Features</a>
            <a href="#ai-demo" className="nav-link">AI Demo</a>
            <a href="#contact" className="nav-link highlight">Get Started</a>
          </nav>
        </div>
      </div>
      
      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
          animation: slideDown 0.5s ease-out;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 300;
          letter-spacing: 0.1em;
        }
        
        .logo-text {
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .logo-icon {
          font-size: 1.75rem;
        }
        
        .nav {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        
        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .nav-link:hover {
          color: var(--text-primary);
        }
        
        .nav-link.highlight {
          background: var(--primary-gradient);
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 25px;
          box-shadow: var(--shadow-sm);
        }
        
        .nav-link.highlight:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .nav {
            gap: 1rem;
          }
          
          .nav-link {
            font-size: 0.875rem;
          }
          
          .nav-link.highlight {
            padding: 0.4rem 1rem;
          }
        }
      `}</style>
    </header>
  );
}