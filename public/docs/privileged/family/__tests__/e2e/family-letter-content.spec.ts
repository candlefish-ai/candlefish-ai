import { test, expect } from '@playwright/test';

test.describe('Family Letter Content Display', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate first
    await page.goto('/index.html');
    await page.fill('#password', 'candlefish');
    await page.click('button');
    await page.waitForURL(/candlefish_update_08032025_family\.html/);
  });

  test('should display family letter with correct structure', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle('Candlefish AI - Family Business Structure');

    // Check letterhead
    await expect(page.locator('img[alt="Candlefish AI"]')).toBeVisible();

    // Check company name in letterhead
    await expect(page.getByText('CANDLEFISH AI')).toBeVisible();
    await expect(page.getByText('Illuminating Business Intelligence')).toBeVisible();

    // Check date
    await expect(page.getByText('August 3, 2025')).toBeVisible();

    // Check addressees
    await expect(page.getByText('Tyler, Kendall, and Trevor,')).toBeVisible();

    // Check signature
    await expect(page.getByText('Love,\nPat')).toBeVisible();
  });

  test('should contain key business structure content', async ({ page }) => {
    // Check for key topics
    await expect(page.getByText(/pre-revenue/)).toBeVisible();
    await expect(page.getByText(/Morgan Stanley/)).toBeVisible();
    await expect(page.getByText(/Candlefish Holdings LLC/)).toBeVisible();
    await expect(page.getByText(/intellectual property/)).toBeVisible();
    await expect(page.getByText(/business unit/)).toBeVisible();
  });

  test('should display proper footer information', async ({ page }) => {
    // Check footer
    await expect(page.getByText(/© 2025 Candlefish AI, LLC/)).toBeVisible();
    await expect(page.getByText(/Confidential and Proprietary/)).toBeVisible();
  });

  test('should have readable typography and layout', async ({ page }) => {
    // Check that content is properly formatted
    const bodyText = page.locator('body');

    // Verify font family
    const fontFamily = await bodyText.evaluate(el =>
      getComputedStyle(el).fontFamily
    );
    expect(fontFamily).toContain('apple-system');

    // Check line height for readability
    const lineHeight = await bodyText.evaluate(el =>
      getComputedStyle(el).lineHeight
    );
    expect(parseFloat(lineHeight)).toBeGreaterThan(1.4);

    // Check max width for readability
    const maxWidth = await page.locator('div').first().evaluate(el =>
      getComputedStyle(el).maxWidth
    );
    expect(maxWidth).toBeTruthy();
  });

  test('should display logo image correctly', async ({ page }) => {
    const logo = page.locator('img[alt="Candlefish AI"]');

    await expect(logo).toBeVisible();

    // Check image loads successfully
    const isLoaded = await logo.evaluate((img: HTMLImageElement) =>
      img.complete && img.naturalHeight !== 0
    );
    expect(isLoaded).toBe(true);
  });

  test('should handle direct access without authentication', async ({ page }) => {
    // Clear session storage
    await page.evaluate(() => sessionStorage.clear());

    // Try to access family letter directly
    await page.goto('/candlefish_update_08032025_family.html');

    // Should work (no auth check on the content page itself)
    // This is actually a security vulnerability that should be noted
    await expect(page).toHaveTitle('Candlefish AI - Family Business Structure');
  });

  test('should maintain session across page reloads', async ({ page }) => {
    // Reload the page
    await page.reload();

    // Should still display the family letter
    await expect(page).toHaveTitle('Candlefish AI - Family Business Structure');

    // Session should still be active
    const authValue = await page.evaluate(() =>
      sessionStorage.getItem('family-letter-auth')
    );
    expect(authValue).toBe('true');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Content should still be visible and readable
    await expect(page.getByText('CANDLEFISH AI')).toBeVisible();
    await expect(page.getByText('Tyler, Kendall, and Trevor,')).toBeVisible();

    // Check that content doesn't overflow
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);

    // Allow for small differences due to scrollbars
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20);
  });
});
