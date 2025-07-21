'use client';

import { useState } from 'react';
import { MetaGenerator } from './components/MetaGenerator';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import './styles/global.css';

export default function CandlefishV2() {
  const [showLiveTestimonials, setShowLiveTestimonials] = useState(false);

  return (
    <div className="app-container">
      <Header />
      
      <main>
        <Hero />
        
        <Features />
        
        <section className="content-section">
          <div className="container">
            <h2 className="section-title">AI-Powered SEO Intelligence</h2>
            <p className="section-subtitle">
              Experience our advanced AI capabilities with 2M thinking tokens
            </p>
            <MetaGenerator />
          </div>
        </section>

        {showLiveTestimonials && (
          <section className="testimonials-section">
            <div className="container">
              <h2 className="section-title">Live Client Success Stories</h2>
              <div id="testimonials-container">
                {/* Bright Data MCP integration would go here */}
                <p className="coming-soon">Real-time testimonials powered by Bright Data MCP</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}