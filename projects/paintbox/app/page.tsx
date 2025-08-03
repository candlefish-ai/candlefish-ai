'use client';

import Link from 'next/link';
import { Building2, ArrowRight, Sparkles, Zap, Star } from 'lucide-react';
import { animated, useSpring } from '@react-spring/web';
import { useState } from 'react';

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => {
  const [hovered, setHovered] = useState(false);
  
  const spring = useSpring({
    transform: hovered ? 'translateY(-8px)' : 'translateY(0px)',
    boxShadow: hovered ? '0 20px 40px rgba(139, 92, 246, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
    config: { tension: 300, friction: 20 }
  });

  return (
    <animated.div
      className="paintbox-card p-6 text-center hover:shadow-xl transition-all duration-300"
      style={{ animationDelay: `${delay}ms`, ...spring }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-paintbox-primary to-paintbox-accent rounded-lg flex items-center justify-center text-white mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-paintbox-text mb-2">{title}</h3>
      <p className="text-paintbox-text-muted">{description}</p>
    </animated.div>
  );
};

export default function Home() {
  const [buttonHovered, setButtonHovered] = useState(false);
  
  const heroSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { duration: 800 }
  });

  const buttonSpring = useSpring({
    transform: buttonHovered ? 'scale(1.05)' : 'scale(1)',
    config: { tension: 400, friction: 25 }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-paintbox-primary/5 via-paintbox-background to-paintbox-accent/5">
      <div className="container mx-auto px-4 py-16">
        <animated.div style={heroSpring} className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-paintbox-primary to-paintbox-accent rounded-2xl flex items-center justify-center shadow-xl animate-float">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-paintbox-text mb-6 bg-gradient-to-r from-paintbox-primary to-paintbox-accent bg-clip-text text-transparent">
            Paintbox
          </h1>
          
          <p className="text-xl text-paintbox-text-muted mb-8 max-w-2xl mx-auto">
            Professional painting estimates with world-class animations and design
          </p>
          
          <Link href="/estimate/new">
            <animated.button
              style={buttonSpring}
              className="paintbox-btn bg-gradient-to-r from-paintbox-primary to-paintbox-accent hover:from-paintbox-primary-dark hover:to-paintbox-accent shadow-xl"
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
            >
              Create New Estimate
              <ArrowRight className="w-5 h-5 ml-2" />
            </animated.button>
          </Link>
        </animated.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <FeatureCard
            icon={Sparkles}
            title="Beautiful Animations"
            description="Smooth React Spring animations throughout"
            delay={0}
          />
          <FeatureCard
            icon={Zap}
            title="Lightning Fast"
            description="Optimized for 60fps performance"
            delay={100}
          />
          <FeatureCard
            icon={Star}
            title="Professional Design"
            description="Enterprise-grade UI/UX"
            delay={200}
          />
        </div>

        <div className="mt-16 text-center">
          <div className="paintbox-card max-w-2xl mx-auto p-8 bg-gradient-to-r from-paintbox-primary/10 to-paintbox-accent/10">
            <h2 className="text-2xl font-bold text-paintbox-text mb-4">
              Ready to Transform Your Estimates?
            </h2>
            <p className="text-paintbox-text-muted mb-6">
              Experience the future of painting estimates with our beautiful, animated interface
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/estimate/new">
                <button className="paintbox-btn paintbox-btn-primary">Get Started</button>
              </Link>
              <Link href="/demo/animations">
                <button className="paintbox-btn paintbox-btn-secondary">View Demo</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}