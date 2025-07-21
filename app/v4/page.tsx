'use client';

import { Hero } from './components/Hero';
import { Pricing } from './components/Pricing';
import { Testimonials } from './components/Testimonials';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function CandlefishV4() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-rgb(var(--background)/0.8) backdrop-blur-md border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-light">
            <span className="text-rgb(var(--primary-500))">Candlefish</span> AI
          </div>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-rgb(var(--foreground)/0.1) transition-colors duration-150"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}
        </div>
      </nav>
      
      <main className="overflow-x-hidden">
        <Hero />
        <Testimonials />
        <Pricing />
      </main>
      
      <footer className="py-8 px-4 border-t">
        <div className="container max-w-6xl mx-auto text-center text-sm text-rgb(var(--foreground)/0.6)">
          © 2025 Candlefish AI. Illuminating intelligence.
        </div>
      </footer>
    </>
  );
}