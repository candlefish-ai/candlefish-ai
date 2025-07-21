export function Features() {
  const features = [
    {
      icon: '🕯️',
      title: 'Deep Illumination',
      description: 'Advanced AI insights that bring clarity to complex challenges, powered by 2M thinking tokens for unprecedented depth.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: '🌊',
      title: 'Ocean Navigation',
      description: 'Navigate vast data oceans with our intelligent guidance system, finding valuable insights in the depths.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: '🧬',
      title: 'Natural Integration',
      description: 'Seamlessly blend AI capabilities with your organization\'s natural wisdom and human expertise.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Process up to 400K output tokens per minute with our optimized infrastructure.',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      icon: '🛡️',
      title: 'Enterprise Security',
      description: 'WAF-protected with rate limiting at 4,000 RPM ensuring secure and reliable service.',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    },
    {
      icon: '🎯',
      title: 'Precision Targeting',
      description: 'AI-powered insights tailored specifically to your industry and unique challenges.',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Illuminate Your AI Journey</h2>
        <p className="section-subtitle">
          Discover how Candlefish AI transforms complexity into clarity
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="feature-icon" style={{ background: feature.gradient }}>
                <span>{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .features {
          padding: 4rem 0;
          background: var(--bg-white);
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }
        
        .feature-card {
          background: white;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          text-align: center;
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease-out both;
          border: 1px solid var(--border-color);
        }
        
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-lg);
          border-color: transparent;
        }
        
        .feature-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          box-shadow: var(--shadow-md);
          transition: all 0.3s ease;
        }
        
        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }
        
        .feature-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        
        .feature-description {
          color: var(--text-secondary);
          line-height: 1.7;
        }
        
        @keyframes fadeInUp {
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
          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .feature-card {
            padding: 2rem;
          }
        }
      `}</style>
    </section>
  );
}