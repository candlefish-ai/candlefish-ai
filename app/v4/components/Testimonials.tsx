'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    content: "Candlefish AI's 2M thinking tokens transformed our data analysis. Insights that took weeks now happen in minutes.",
    author: "Sarah Chen",
    role: "CTO, TechCorp",
    avatar: "SC"
  },
  {
    id: 2,
    content: "The consciousness-aligned approach isn't just marketing—it's a fundamentally better way to implement AI.",
    author: "Marcus Rodriguez",
    role: "AI Lead, FinanceHub",
    avatar: "MR"
  },
  {
    id: 3,
    content: "ROI exceeded 300% in the first quarter. The depth of analysis is unlike anything we've seen.",
    author: "Dr. Emily Watson",
    role: "Research Director",
    avatar: "EW"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Testimonials() {
  const [liveUpdate, setLiveUpdate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLiveUpdate(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-24 px-4 bg-rgb(var(--foreground)/0.02)">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-light mb-4">Trusted by Innovators</h2>
          <p className="text-xl text-rgb(var(--foreground)/0.6)">Real results from real transformations</p>
        </motion.div>
        
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="bg-white dark:bg-rgb(var(--foreground)/0.05) rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-150"
              variants={item}
              whileHover={{ y: -4 }}
            >
              <p className="text-lg mb-6 text-rgb(var(--foreground)/0.8)">&ldquo;{testimonial.content}&rdquo;</p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-rgb(var(--primary-500)) text-white flex items-center justify-center font-medium mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-sm text-rgb(var(--foreground)/0.6)">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {liveUpdate && (
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rgb(var(--accent-500)/0.1) rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rgb(var(--accent-500)) opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rgb(var(--accent-500))"></span>
              </span>
              <span className="text-sm text-rgb(var(--foreground)/0.8)">Live testimonials updating</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}