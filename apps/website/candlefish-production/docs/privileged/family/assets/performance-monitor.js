// Performance Monitoring for Candlefish AI Family Letter
(function() {
  'use strict';

  // Check if Performance API is available
  if (!('performance' in window)) {
    console.warn('Performance API not supported');
    return;
  }

  // Web Vitals metrics collection
  const vitals = {
    FCP: 0,  // First Contentful Paint
    LCP: 0,  // Largest Contentful Paint
    FID: 0,  // First Input Delay
    CLS: 0,  // Cumulative Layout Shift
    TTFB: 0  // Time to First Byte
  };

  // Helper to send metrics (customize endpoint)
  function sendMetrics(metrics) {
    // In production, send to your analytics endpoint
    console.log('Performance Metrics:', metrics);

    // Example: Send to analytics
    // fetch('/api/metrics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metrics)
    // });
  }

  // Measure TTFB
  function measureTTFB() {
    const navigationTiming = performance.getEntriesByType('navigation')[0];
    if (navigationTiming) {
      vitals.TTFB = navigationTiming.responseStart - navigationTiming.requestStart;
    }
  }

  // Measure FCP
  function measureFCP() {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      vitals.FCP = fcpEntry.startTime;
    }
  }

  // Measure LCP
  function measureLCP() {
    let lastEntry;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      lastEntry = entries[entries.length - 1];
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // Report LCP when page is about to be unloaded
    addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && lastEntry) {
        vitals.LCP = lastEntry.startTime;
        observer.disconnect();
      }
    });
  }

  // Measure FID
  function measureFID() {
    const observer = new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0];
      if (firstInput) {
        vitals.FID = firstInput.processingStart - firstInput.startTime;
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  // Measure CLS
  function measureCLS() {
    let clsValue = 0;
    let clsEntries = [];
    let sessionValue = 0;
    let sessionEntries = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count layout shifts without recent input
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          // New session if gap > 1s or duration > 5s
          if (sessionValue &&
              entry.startTime - lastSessionEntry.startTime > 1000 ||
              entry.startTime - firstSessionEntry.startTime > 5000) {
            sessionValue = entry.value;
            sessionEntries = [entry];
          } else {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          }

          // Update CLS if this session is larger
          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            clsEntries = sessionEntries;
          }
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });

    // Report CLS when page is about to be unloaded
    addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        vitals.CLS = clsValue;
        observer.disconnect();
      }
    });
  }

  // Measure resource timing
  function measureResources() {
    const resources = performance.getEntriesByType('resource');
    const resourceMetrics = {
      images: [],
      scripts: [],
      stylesheets: [],
      total: resources.length
    };

    resources.forEach(resource => {
      const metric = {
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0,
        cached: resource.transferSize === 0
      };

      if (resource.initiatorType === 'img') {
        resourceMetrics.images.push(metric);
      } else if (resource.initiatorType === 'script') {
        resourceMetrics.scripts.push(metric);
      } else if (resource.initiatorType === 'css' || resource.initiatorType === 'link') {
        resourceMetrics.stylesheets.push(metric);
      }
    });

    return resourceMetrics;
  }

  // Initialize measurements
  function init() {
    measureTTFB();
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();

    // Report metrics when page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = {
          vitals,
          resources: measureResources(),
          navigation: {
            type: performance.navigation.type,
            redirectCount: performance.navigation.redirectCount
          },
          memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : null,
          connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
          } : null,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        };

        sendMetrics(metrics);
      }, 3000); // Wait 3s to ensure all metrics are collected
    });
  }

  // Start monitoring
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
