module.exports = {
  ci: {
    collect: {
      staticDistDir: './',
      url: [
        'http://localhost/index.html',
        'http://localhost/candlefish_update_08032025_family.html'
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
          requestLatencyMs: 0,
          rttMs: 0
        },
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false
        }
      }
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance budget assertions
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],

        // Resource size budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 50000 }],
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 30000 }],
        'resource-summary:image:size': ['error', { maxNumericValue: 200000 }],
        'resource-summary:total:size': ['error', { maxNumericValue: 300000 }],

        // Best practices
        'uses-webp-images': 'warn',
        'uses-optimized-images': 'error',
        'uses-text-compression': 'error',
        'uses-responsive-images': 'warn',
        'efficient-animated-content': 'warn',
        'uses-rel-preload': 'warn',
        'uses-rel-preconnect': 'warn',

        // Accessibility
        'color-contrast': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',

        // SEO
        'meta-description': 'warn',
        'crawlable-anchors': 'error',
        'link-text': 'error',
        'is-crawlable': 'error',

        // PWA
        'service-worker': 'warn',
        'works-offline': 'warn',
        'installable-manifest': 'off'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      // Configure if using Lighthouse CI Server
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: 'YOUR_LHCI_TOKEN'
    }
  }
};
