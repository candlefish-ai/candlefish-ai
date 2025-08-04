/**
 * Lighthouse performance audits for family letter pages
 * Tests Core Web Vitals, accessibility, best practices, and SEO
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

describe('Family Letter Performance Audits', () => {
  let chrome;
  let port;

  beforeAll(async () => {
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    });
    port = chrome.port;
  });

  afterAll(async () => {
    if (chrome) {
      await chrome.kill();
    }
  });

  const runLighthouse = async (url) => {
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: port,
    };

    const runnerResult = await lighthouse(url, options);
    return runnerResult.lhr;
  };

  test('login page should meet performance benchmarks', async () => {
    const report = await runLighthouse('http://localhost:8080/index.html');
    
    // Performance thresholds
    expect(report.categories.performance.score).toBeGreaterThanOrEqual(0.9);
    expect(report.categories.accessibility.score).toBeGreaterThanOrEqual(0.9);
    expect(report.categories['best-practices'].score).toBeGreaterThanOrEqual(0.8);
    
    // Core Web Vitals
    const metrics = report.audits;
    
    // First Contentful Paint should be under 1.8s
    expect(metrics['first-contentful-paint'].numericValue).toBeLessThan(1800);
    
    // Largest Contentful Paint should be under 2.5s
    expect(metrics['largest-contentful-paint'].numericValue).toBeLessThan(2500);
    
    // Cumulative Layout Shift should be under 0.1
    expect(metrics['cumulative-layout-shift'].numericValue).toBeLessThan(0.1);
    
    // Time to Interactive should be under 3.8s
    expect(metrics['interactive'].numericValue).toBeLessThan(3800);
  }, 30000);

  test('family letter page should meet performance benchmarks', async () => {
    const report = await runLighthouse('http://localhost:8080/candlefish_update_08032025_family.html');
    
    // Performance thresholds
    expect(report.categories.performance.score).toBeGreaterThanOrEqual(0.9);
    expect(report.categories.accessibility.score).toBeGreaterThanOrEqual(0.9);
    
    // Core Web Vitals
    const metrics = report.audits;
    
    expect(metrics['first-contentful-paint'].numericValue).toBeLessThan(1800);
    expect(metrics['largest-contentful-paint'].numericValue).toBeLessThan(2500);
    expect(metrics['cumulative-layout-shift'].numericValue).toBeLessThan(0.1);
  }, 30000);

  test('should have optimized images', async () => {
    const report = await runLighthouse('http://localhost:8080/index.html');
    
    // Check image optimization audits
    const imageAudits = [
      'modern-image-formats',
      'efficient-animated-content',
      'image-size-responsive'
    ];
    
    imageAudits.forEach(auditName => {
      if (report.audits[auditName]) {
        expect(report.audits[auditName].score).toBeGreaterThanOrEqual(0.8);
      }
    });
  }, 30000);

  test('should have minimal unused resources', async () => {
    const report = await runLighthouse('http://localhost:8080/index.html');
    
    // Check resource optimization
    const resourceAudits = [
      'unused-css-rules',
      'unused-javascript',
      'unminified-css',
      'unminified-javascript'
    ];
    
    resourceAudits.forEach(auditName => {
      if (report.audits[auditName]) {
        expect(report.audits[auditName].score).toBeGreaterThanOrEqual(0.8);
      }
    });
  }, 30000);

  test('should have proper caching strategy', async () => {
    const report = await runLighthouse('http://localhost:8080/index.html');
    
    // Check caching audits
    if (report.audits['uses-long-cache-ttl']) {
      expect(report.audits['uses-long-cache-ttl'].score).toBeGreaterThanOrEqual(0.5);
    }
  }, 30000);

  test('should pass accessibility audit', async () => {
    const report = await runLighthouse('http://localhost:8080/index.html');
    
    // Detailed accessibility checks
    const a11yAudits = [
      'color-contrast',
      'image-alt',
      'label',
      'link-name',
      'list',
      'meta-viewport'
    ];
    
    a11yAudits.forEach(auditName => {
      if (report.audits[auditName]) {
        expect(report.audits[auditName].score).toBe(1);
      }
    });
  }, 30000);

  test('should follow SEO best practices', async () => {
    const report = await runLighthouse('http://localhost:8080/index.html');
    
    // SEO audits
    const seoAudits = [
      'document-title',
      'meta-description',
      'http-status-code',
      'is-crawlable'
    ];
    
    seoAudits.forEach(auditName => {
      if (report.audits[auditName]) {
        expect(report.audits[auditName].score).toBe(1);
      }
    });
  }, 30000);
});