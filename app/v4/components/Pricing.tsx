'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { motion } from 'framer-motion';

const tiers = [
  {
    name: 'Starter',
    price: '$299',
    description: 'Perfect for exploring AI possibilities',
    features: ['100 API calls/month', '10K thinking tokens', 'Email support', 'Basic analytics'],
    cta: 'Start Free Trial'
  },
  {
    name: 'Growth',
    price: '$999',
    description: 'Scale your AI transformation',
    features: ['1,000 API calls/month', '100K thinking tokens', 'Priority support', 'Advanced analytics', 'Custom integrations'],
    cta: 'Get Started',
    featured: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Unlimited potential',
    features: ['Unlimited API calls', '2M thinking tokens', 'Dedicated support', 'SLA guarantee', 'On-premise option'],
    cta: 'Contact Sales'
  }
];

export function Pricing() {
  return (
    <section className="py-24 px-4">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-light mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-rgb(var(--foreground)/0.6)">Choose the perfect plan for your journey</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              className={`relative rounded-2xl p-8 ${
                tier.featured
                  ? 'bg-rgb(var(--primary-500)) text-white shadow-xl'
                  : 'bg-rgb(var(--foreground)/0.05)'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-rgb(var(--accent-500)) text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-normal mb-2">{tier.name}</h3>
                <div className="text-4xl font-light mb-2">{tier.price}</div>
                <p className={tier.featured ? 'text-white/80' : 'text-rgb(var(--foreground)/0.6)'}>{tier.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={tier.featured ? 'text-white/90' : ''}>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-3 rounded-full font-medium transition-all duration-150 ${
                tier.featured
                  ? 'bg-white text-rgb(var(--primary-500)) hover:shadow-lg'
                  : 'bg-rgb(var(--foreground)/0.1) hover:bg-rgb(var(--foreground)/0.2)'
              }`}>
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Accordion.Root type="single" collapsible className="space-y-4">
            <Accordion.Item value="item-1" className="border rounded-lg overflow-hidden">
              <Accordion.Trigger className="w-full px-6 py-4 text-left hover:bg-rgb(var(--foreground)/0.05) transition-colors duration-150">
                <span className="font-medium">What are thinking tokens?</span>
              </Accordion.Trigger>
              <Accordion.Content className="px-6 pb-4 text-rgb(var(--foreground)/0.6)">
                Thinking tokens represent the computational depth our AI models use to process and understand complex queries. More tokens mean deeper analysis and more nuanced responses.
              </Accordion.Content>
            </Accordion.Item>
            
            <Accordion.Item value="item-2" className="border rounded-lg overflow-hidden">
              <Accordion.Trigger className="w-full px-6 py-4 text-left hover:bg-rgb(var(--foreground)/0.05) transition-colors duration-150">
                <span className="font-medium">Can I change plans anytime?</span>
              </Accordion.Trigger>
              <Accordion.Content className="px-6 pb-4 text-rgb(var(--foreground)/0.6)">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences.
              </Accordion.Content>
            </Accordion.Item>
            
            <Accordion.Item value="item-3" className="border rounded-lg overflow-hidden">
              <Accordion.Trigger className="w-full px-6 py-4 text-left hover:bg-rgb(var(--foreground)/0.05) transition-colors duration-150">
                <span className="font-medium">What's included in Enterprise support?</span>
              </Accordion.Trigger>
              <Accordion.Content className="px-6 pb-4 text-rgb(var(--foreground)/0.6)">
                Enterprise customers receive 24/7 dedicated support, custom SLAs, priority feature requests, and direct access to our engineering team.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </motion.div>
      </div>
    </section>
  );
}