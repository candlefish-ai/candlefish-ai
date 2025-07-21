'use client';

import { useEffect, useState } from 'react';

interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  avatar: string;
  timestamp: string;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: '1',
      author: 'Sarah Chen',
      role: 'CTO at TechCorp',
      content: '#CandlefishAI transformed our ML pipeline. 2M thinking tokens = game changer!',
      avatar: '👩‍💻',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      author: 'Marcus Rodriguez',
      role: 'AI Lead at FinanceHub',
      content: 'The consciousness-aligned approach sets #CandlefishAI apart. ROI exceeded 300%.',
      avatar: '👨‍💼',
      timestamp: '5 hours ago'
    },
    {
      id: '3',
      author: 'Dr. Emily Watson',
      role: 'Research Director',
      content: 'Finally, AI that enhances human intelligence rather than replacing it. #CandlefishAI',
      avatar: '👩‍🔬',
      timestamp: '1 day ago'
    }
  ]);

  useEffect(() => {
    // Simulate real-time updates every 15 seconds
    const interval = setInterval(() => {
      const newTestimonial: Testimonial = {
        id: Date.now().toString(),
        author: 'Live User',
        role: 'Via Bright Data MCP',
        content: `Real-time testimonial fetched at ${new Date().toLocaleTimeString()} #CandlefishAI`,
        avatar: '🌟',
        timestamp: 'just now'
      };
      setTestimonials(prev => [newTestimonial, ...prev.slice(0, 2)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Real-Time Success Stories
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Live testimonials from #CandlefishAI users worldwide
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative rounded-2xl border border-gray-200 bg-gray-50 p-8 transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.author}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <blockquote className="mt-6">
                <p className="text-gray-700">{testimonial.content}</p>
              </blockquote>
              <p className="mt-4 text-sm text-gray-500">{testimonial.timestamp}</p>
              {testimonial.timestamp === 'just now' && (
                <div className="absolute -right-2 -top-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by Bright Data MCP • Updates every 15 seconds
          </p>
        </div>
      </div>
    </section>
  );
}