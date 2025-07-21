'use client';

import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-rgb(var(--primary-500)/0.1) to-rgb(var(--accent-500)/0.1)" />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_rgb(var(--primary-500)/0.15)_0%,_transparent_50%)]" />
        </motion.div>
      </div>
      
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Illuminate Your
            <span className="block font-normal text-rgb(var(--primary-500))">
              AI Transformation
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-rgb(var(--foreground)/0.6) font-light max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Like the candlefish that lights ocean depths, we guide enterprises through the vast possibilities of artificial intelligence.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button className="px-8 py-4 bg-rgb(var(--primary-500)) text-white rounded-full font-medium hover:shadow-lg transition-all duration-150">
              Start Your Journey
            </button>
            <button className="px-8 py-4 border border-current rounded-full font-medium hover:bg-rgb(var(--foreground)/0.05) transition-all duration-150">
              Watch Demo
            </button>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="grid grid-cols-3 gap-8 mt-24 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div>
            <div className="text-4xl font-light text-rgb(var(--primary-500))">2M+</div>
            <div className="text-sm text-rgb(var(--foreground)/0.6) mt-2">Thinking Tokens</div>
          </div>
          <div>
            <div className="text-4xl font-light text-rgb(var(--accent-500))">400K</div>
            <div className="text-sm text-rgb(var(--foreground)/0.6) mt-2">Output/min</div>
          </div>
          <div>
            <div className="text-4xl font-light text-rgb(var(--primary-500))">99.9%</div>
            <div className="text-sm text-rgb(var(--foreground)/0.6) mt-2">Uptime</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}