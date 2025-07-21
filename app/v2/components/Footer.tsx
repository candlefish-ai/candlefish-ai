export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Candlefish AI</h4>
            <p>Illuminating the depths of artificial intelligence with natural wisdom.</p>
            <div className="footer-icons">
              <span>🕯️</span>
              <span>🐟</span>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Technology</h4>
            <ul>
              <li>Claude Sonnet 4</li>
              <li>2M Thinking Tokens</li>
              <li>400K Output Capacity</li>
              <li>Enterprise WAF</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#ai-demo">AI Demo</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="/privacy">Privacy</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Connect</h4>
            <p>Ready to illuminate your AI journey?</p>
            <button className="footer-cta">Get Started</button>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Candlefish AI. All rights reserved.</p>
          <p className="footer-note">
            Born from a serendipitous bathroom discovery, lighting the way to AI transformation.
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .footer {
          background: var(--bg-white);
          border-top: 1px solid var(--border-color);
          padding: 3rem 0 1rem;
          margin-top: 4rem;
        }
        
        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .footer-section h4 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.125rem;
        }
        
        .footer-section p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .footer-section ul {
          list-style: none;
        }
        
        .footer-section li {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }
        
        .footer-section a {
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        .footer-section a:hover {
          color: #667eea;
        }
        
        .footer-icons {
          display: flex;
          gap: 1rem;
          font-size: 2rem;
          margin-top: 0.5rem;
        }
        
        .footer-cta {
          margin-top: 1rem;
          background: var(--primary-gradient);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .footer-cta:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
          color: var(--text-light);
        }
        
        .footer-note {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
          
          .footer-icons {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
}