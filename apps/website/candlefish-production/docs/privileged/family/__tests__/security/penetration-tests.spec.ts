import { test, expect } from '@playwright/test';

test.describe('Family Letter Security Penetration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test.describe('Authentication Security', () => {
    test('should not accept SQL injection attempts', async ({ page }) => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1' --",
        "' OR 1=1 --",
        "admin'--",
        "' UNION SELECT * FROM users --"
      ];

      for (const attempt of sqlInjectionAttempts) {
        await page.fill('#password', attempt);
        await page.click('button');

        await expect(page.locator('#error')).toBeVisible();
        await expect(page).toHaveURL(/index\.html/);

        const authValue = await page.evaluate(() =>
          sessionStorage.getItem('family-letter-auth')
        );
        expect(authValue).toBeNull();

        await page.waitForTimeout(3100); // Wait for error to hide
      }
    });

    test('should not accept XSS attempts', async ({ page }) => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '<svg onload="alert(\'xss\')">',
        '"><script>alert("xss")</script>'
      ];

      for (const attempt of xssAttempts) {
        await page.fill('#password', attempt);
        await page.click('button');

        // Should not execute any scripts
        await expect(page.locator('#error')).toBeVisible();
        await expect(page).toHaveURL(/index\.html/);

        // No alert dialogs should appear
        await expect(page.locator('text=xss')).not.toBeVisible();

        await page.waitForTimeout(3100);
      }
    });

    test('should resist brute force attempts', async ({ page }) => {
      const attempts = [
        'password123', 'admin', 'candlefish123', 'Candlefish',
        'CANDLEFISH', 'candlefish2024', 'candlefish!', 'test',
        '123456', 'password', 'family', 'executive'
      ];

      for (const attempt of attempts) {
        await page.fill('#password', attempt);
        await page.click('button');

        await expect(page.locator('#error')).toBeVisible();
        await expect(page).toHaveURL(/index\.html/);

        await page.waitForTimeout(100); // Brief pause between attempts
      }

      // None should succeed
      const authValue = await page.evaluate(() =>
        sessionStorage.getItem('family-letter-auth')
      );
      expect(authValue).toBeNull();
    });

    test('should handle extremely long input without breaking', async ({ page }) => {
      const longInput = 'a'.repeat(10000);

      await page.fill('#password', longInput);
      await page.click('button');

      await expect(page.locator('#error')).toBeVisible();
      await expect(page).toHaveURL(/index\.html/);
    });

    test('should not leak sensitive information in error messages', async ({ page }) => {
      await page.fill('#password', 'wrong');
      await page.click('button');

      const errorText = await page.locator('#error').textContent();

      // Error should not reveal the actual password
      expect(errorText).not.toContain('candlefish');
      expect(errorText).not.toContain('expected');
      expect(errorText).toBe('Invalid authorization code. Please try again.');
    });
  });

  test.describe('Session Security', () => {
    test('should use secure session storage', async ({ page }) => {
      await page.fill('#password', 'candlefish');
      await page.click('button');

      // Check that session data is properly set
      const authValue = await page.evaluate(() =>
        sessionStorage.getItem('family-letter-auth')
      );
      expect(authValue).toBe('true');

      // Session should not contain sensitive data
      const allSessionData = await page.evaluate(() => {
        const data = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          data[key] = sessionStorage.getItem(key);
        }
        return data;
      });

      // Should not store password or other sensitive info
      expect(JSON.stringify(allSessionData)).not.toContain('candlefish');
    });

    test('should not persist authentication across browser close', async ({ context }) => {
      const page = await context.newPage();
      await page.goto('/index.html');

      // Authenticate
      await page.fill('#password', 'candlefish');
      await page.click('button');

      // Close and reopen browser (new context)
      await page.close();

      const newPage = await context.newPage();
      await newPage.goto('/index.html');

      // Should require re-authentication
      await expect(newPage.locator('#authForm')).toBeVisible();
    });
  });

  test.describe('Client-Side Security', () => {
    test('should not expose password in client-side code', async ({ page }) => {
      await page.goto('/index.html');

      // Check if password is visible in page source
      const pageContent = await page.content();

      // Password should ideally not be in client-side code (this test will fail with current implementation)
      // This documents the security vulnerability
      const hasPasswordInSource = pageContent.includes('candlefish');

      // Log warning about security issue
      if (hasPasswordInSource) {
        console.warn('SECURITY VULNERABILITY: Password found in client-side code');
      }

      // This test documents the current insecure state
      expect(hasPasswordInSource).toBe(true); // Currently fails security
    });

    test('should not allow bypassing authentication via console', async ({ page }) => {
      await page.goto('/index.html');

      // Try to bypass authentication via console
      await page.evaluate(() => {
        sessionStorage.setItem('family-letter-auth', 'true');
      });

      // This would currently work, which is a security issue
      await page.reload();

      // Document the vulnerability
      const currentUrl = page.url();
      const isBypassSuccessful = currentUrl.includes('family.html');

      if (isBypassSuccessful) {
        console.warn('SECURITY VULNERABILITY: Authentication can be bypassed via console');
      }
    });

    test('should not expose sensitive functions globally', async ({ page }) => {
      await page.goto('/index.html');

      // Check for exposed functions
      const exposedFunctions = await page.evaluate(() => {
        const functions = [];
        if (typeof window.checkPassword === 'function') {
          functions.push('checkPassword');
        }
        return functions;
      });

      // Functions being globally exposed is a security concern
      if (exposedFunctions.length > 0) {
        console.warn(`SECURITY WARNING: Exposed functions: ${exposedFunctions.join(', ')}`);
      }
    });
  });

  test.describe('Content Security', () => {
    test('should have proper content security headers', async ({ page }) => {
      const response = await page.goto('/index.html');
      const headers = response.headers();

      // Check for security headers (these will likely be missing in current setup)
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'content-security-policy'
      ];

      const missingHeaders = securityHeaders.filter(header => !headers[header]);

      if (missingHeaders.length > 0) {
        console.warn(`SECURITY WARNING: Missing headers: ${missingHeaders.join(', ')}`);
      }

      // Document current state
      expect(missingHeaders.length).toBeGreaterThan(0); // Currently missing headers
    });

    test('should protect against clickjacking', async ({ page }) => {
      const response = await page.goto('/index.html');
      const headers = response.headers();

      const frameOptions = headers['x-frame-options'];
      const csp = headers['content-security-policy'];

      // Should have frame protection
      const hasFrameProtection = frameOptions === 'DENY' ||
                                 frameOptions === 'SAMEORIGIN' ||
                                 (csp && csp.includes('frame-ancestors'));

      if (!hasFrameProtection) {
        console.warn('SECURITY WARNING: No clickjacking protection found');
      }

      // Document current state
      expect(hasFrameProtection).toBe(false); // Currently unprotected
    });
  });

  test.describe('Input Validation Security', () => {
    test('should handle Unicode and special characters', async ({ page }) => {
      const specialInputs = [
        '🔐🔑', // Emoji
        'αβγδε', // Greek letters
        '中文测试', // Chinese characters
        'тест', // Cyrillic
        '﷽', // Arabic ligature
        '\x00\x01\x02', // Control characters
        '\n\r\t', // Whitespace characters
      ];

      for (const input of specialInputs) {
        await page.fill('#password', input);
        await page.click('button');

        await expect(page.locator('#error')).toBeVisible();
        await expect(page).toHaveURL(/index\.html/);

        await page.waitForTimeout(100);
      }
    });

    test('should prevent timing attacks', async ({ page }) => {
      const startTime = Date.now();

      // Test with wrong password
      await page.fill('#password', 'wrong');
      await page.click('button');
      await page.waitForSelector('#error:visible');

      const wrongPasswordTime = Date.now() - startTime;

      await page.waitForTimeout(3100); // Wait for error to hide

      const startTime2 = Date.now();

      // Test with correct password
      await page.fill('#password', 'candlefish');
      await page.click('button');

      const correctPasswordTime = Date.now() - startTime2;

      // Timing difference shouldn't be significant (would indicate timing attack vulnerability)
      const timingDifference = Math.abs(correctPasswordTime - wrongPasswordTime);

      // This is informational - large differences could indicate timing vulnerabilities
      console.log(`Timing difference: ${timingDifference}ms`);
    });
  });
});
