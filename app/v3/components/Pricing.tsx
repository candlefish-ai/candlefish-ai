'use client';

import { useEffect, useState } from 'react';

export function Pricing() {
  const [rateLimit, setRateLimit] = useState<{ limit: string; remaining: string } | null>(null);

  useEffect(() => {
    fetch('/api/v3/generate-meta', { method: 'OPTIONS' })
      .then(res => ({
        limit: res.headers.get('X-RateLimit-Limit') || '100',
        remaining: res.headers.get('X-RateLimit-Remaining') || '100'
      }))
      .then(setRateLimit)
      .catch(() => null);
  }, []);

  const tiers = [
    {
      name: 'Starter',
      price: '$99',
      description: 'Perfect for small businesses',
      features: [
        '100 API calls/month',
        '10K thinking tokens',
        'Email support',
        'Basic analytics'
      ],
      cta: 'Start free trial',
      featured: false
    },
    {
      name: 'Growth',
      price: '$299',
      description: 'For scaling companies',
      features: [
        '1,000 API calls/month',
        '100K thinking tokens',
        'Priority support',
        'Advanced analytics',
        'Custom integrations'
      ],
      cta: 'Get started',
      featured: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Unlimited potential',
      features: [
        'Unlimited API calls',
        '2M thinking tokens',
        'Dedicated support',
        'SLA guarantee',
        'Custom WAF rules',
        'On-premise option'
      ],
      cta: 'Contact sales',
      featured: false
    }
  ];

  return (
    <section id="pricing" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Choose the perfect plan for your AI transformation journey
          </p>
          {rateLimit && (
            <p className="mt-2 text-sm text-gray-500">
              Current rate limit: {rateLimit.remaining}/{rateLimit.limit} requests
            </p>
          )}
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl ${
                tier.featured
                  ? 'border-2 border-indigo-600 shadow-xl'
                  : 'border border-gray-200'
              } bg-white p-8`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                <p className="mt-4 text-4xl font-bold text-gray-900">{tier.price}</p>
                <p className="mt-2 text-base text-gray-600">{tier.description}</p>
              </div>
              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="h-6 w-5 flex-shrink-0 text-indigo-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <a
                  href="#"
                  className={`block w-full rounded-full px-4 py-3 text-center font-semibold ${
                    tier.featured
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}