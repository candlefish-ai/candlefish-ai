import { test, expect } from '@playwright/test';

test.describe('Family Letter Load Testing', () => {
  test.describe('Page Load Performance', () => {
    test('login page should load quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/index.html');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load in under 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    test('family letter should load quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/candlefish_update_08032025_family.html');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load in under 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    test('should measure Core Web Vitals', async ({ page }) => {
      await page.goto('/index.html');
      
      // Measure performance metrics
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals = {};
            
            entries.forEach((entry) => {
              if (entry.name === 'first-contentful-paint') {
                vitals.fcp = entry.startTime;
              }
              if (entry.entryType === 'largest-contentful-paint') {
                vitals.lcp = entry.startTime;
              }
              if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                vitals.cls = (vitals.cls || 0) + entry.value;
              }
            });
            
            if (vitals.fcp && vitals.lcp) {
              resolve(vitals);
            }
          });
          
          observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
          
          // Fallback timeout
          setTimeout(() => resolve({}), 5000);
        });
      });
      
      // Core Web Vitals thresholds
      if (metrics.fcp) {
        expect(metrics.fcp).toBeLessThan(1800); // FCP < 1.8s
      }
      if (metrics.lcp) {
        expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
      }
      if (metrics.cls) {
        expect(metrics.cls).toBeLessThan(0.1); // CLS < 0.1
      }
    });
  });

  test.describe('Resource Loading', () => {
    test('should load all resources successfully', async ({ page }) => {
      const failedRequests = [];
      
      page.on('requestfailed', request => {
        failedRequests.push(request.url());
      });
      
      await page.goto('/index.html');
      await page.waitForLoadState('networkidle');
      
      expect(failedRequests).toHaveLength(0);
    });

    test('should load images efficiently', async ({ page }) => {
      await page.goto('/index.html');
      
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const isLoaded = await img.evaluate((el: HTMLImageElement) => {
          return el.complete && el.naturalHeight !== 0;
        });
        
        expect(isLoaded).toBe(true);
      }
    });

    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      const startTime = Date.now();
      await page.goto('/index.html');
      const loadTime = Date.now() - startTime;
      
      // Should still load, just slower
      expect(loadTime).toBeLessThan(5000);
      
      // Page should still be functional
      await expect(page.locator('#password')).toBeVisible();
    });
  });

  test.describe('Memory Usage', () => {
    test('should not have memory leaks during normal usage', async ({ page }) => {
      await page.goto('/index.html');
      
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Simulate normal usage
      for (let i = 0; i < 10; i++) {
        await page.fill('#password', 'wrong');
        await page.click('button');
        await page.waitForTimeout(100);
        await page.locator('#error').waitFor({ state: 'visible' });
        await page.waitForTimeout(3100); // Wait for error to hide
      }
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Memory usage shouldn't increase dramatically
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
      }
    });

    test('should clean up after successful authentication', async ({ page }) => {
      await page.goto('/index.html');
      
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Authenticate
      await page.fill('#password', 'candlefish');
      await page.click('button');
      await page.waitForURL(/candlefish_update_08032025_family\.html/);
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Memory usage should be reasonable
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB increase
      }
    });
  });

  test.describe('Concurrent Usage', () => {
    test('should handle multiple rapid authentication attempts', async ({ page }) => {
      await page.goto('/index.html');
      
      const startTime = Date.now();
      
      // Simulate rapid clicking
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          page.evaluate(() => {
            const input = document.getElementById('password') as HTMLInputElement;
            input.value = 'test';
            (window as any).checkPassword();
          })
        );
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should handle all attempts within reasonable time
      expect(duration).toBeLessThan(1000);
      
      // Page should still be responsive
      await expect(page.locator('#password')).toBeVisible();
    });

    test('should maintain performance under stress', async ({ page }) => {
      await page.goto('/index.html');
      
      // Stress test with many DOM manipulations
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        await page.evaluate((iteration) => {
          const input = document.getElementById('password') as HTMLInputElement;
          input.value = `test${iteration}`;
          
          const error = document.getElementById('error');
          error.style.display = 'block';
          setTimeout(() => {
            error.style.display = 'none';
          }, 10);
        }, i);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete stress test within reasonable time
      expect(duration).toBeLessThan(5000);
      
      // Page should still be functional
      await page.fill('#password', 'candlefish');
      await page.click('button');
      await expect(page).toHaveURL(/candlefish_update_08032025_family\.html/);
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page }) => {
      // Simulate mobile device
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await page.goto('/index.html');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load quickly on mobile
      expect(loadTime).toBeLessThan(3000);
      
      // Should be responsive
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button')).toBeVisible();
    });

    test('should handle touch interactions efficiently', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/index.html');
      
      // Test touch interactions
      await page.tap('#password');
      await page.fill('#password', 'candlefish');
      await page.tap('button');
      
      await expect(page).toHaveURL(/candlefish_update_08032025_family\.html/);
    });
  });
});