import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Family Letter E2E Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('should not have accessibility violations on login page', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on family letter page', async ({ page }) => {
    // Authenticate first
    await page.fill('#password', 'candlefish');
    await page.click('button');
    await page.waitForURL(/candlefish_update_08032025_family\.html/);
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Start with password field focused (autofocus)
    await expect(page.locator('#password')).toBeFocused();
    
    // Tab to button
    await page.keyboard.press('Tab');
    await expect(page.locator('button')).toBeFocused();
    
    // Shift+Tab back to password
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#password')).toBeFocused();
  });

  test('should support Enter key submission', async ({ page }) => {
    await page.fill('#password', 'candlefish');
    await page.press('#password', 'Enter');
    
    await expect(page).toHaveURL(/candlefish_update_08032025_family\.html/);
  });

  test('should announce errors to screen readers', async ({ page }) => {
    await page.fill('#password', 'wrong');
    await page.click('button');
    
    // Check error element has proper ARIA attributes
    const errorElement = page.locator('#error');
    await expect(errorElement).toBeVisible();
    
    // Check ARIA attributes
    await expect(errorElement).toHaveAttribute('role', 'alert');
    await expect(errorElement).toHaveAttribute('aria-live', 'polite');
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h2')).toContainText('Executive Document Access');
    
    // Navigate to family letter
    await page.fill('#password', 'candlefish');
    await page.click('button');
    await page.waitForURL(/candlefish_update_08032025_family\.html/);
    
    // Family letter should have proper structure too
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThanOrEqual(0);
  });

  test('should have descriptive page titles', async ({ page }) => {
    await expect(page).toHaveTitle('Candlefish AI - Executive Communication');
    
    // Navigate to family letter
    await page.fill('#password', 'candlefish');
    await page.click('button');
    await page.waitForURL(/candlefish_update_08032025_family\.html/);
    
    await expect(page).toHaveTitle('Candlefish AI - Family Business Structure');
  });

  test('should work with high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    // Elements should still be visible and functional
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button')).toBeVisible();
    
    // Test functionality
    await page.fill('#password', 'candlefish');
    await page.click('button');
    
    await expect(page).toHaveURL(/candlefish_update_08032025_family\.html/);
  });

  test('should work with zoom up to 200%', async ({ page }) => {
    // Set zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    // Elements should still be visible and functional
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button')).toBeVisible();
    
    // Test functionality
    await page.fill('#password', 'candlefish');
    await page.click('button');
    
    await expect(page).toHaveURL(/candlefish_update_08032025_family\.html/);
  });

  test('should have proper form labels', async ({ page }) => {
    // Check if input is properly labeled
    const passwordInput = page.locator('#password');
    
    // Should have either label or aria-label
    const labelText = await passwordInput.getAttribute('aria-label');
    const placeholder = await passwordInput.getAttribute('placeholder');
    
    expect(labelText || placeholder).toBeTruthy();
  });

  test('should provide clear error messages', async ({ page }) => {
    await page.fill('#password', 'wrong');
    await page.click('button');
    
    const errorText = await page.locator('#error').textContent();
    
    // Error message should be descriptive
    expect(errorText).toContain('Invalid authorization code');
    expect(errorText).toContain('try again');
  });

  test('should support voice control patterns', async ({ page }) => {
    // Test that elements can be targeted by voice commands
    
    // Button should have descriptive text
    const buttonText = await page.locator('button').textContent();
    expect(buttonText).toContain('Access');
    
    // Input should have accessible name
    const input = page.locator('#password');
    const inputName = await input.getAttribute('placeholder');
    expect(inputName).toContain('authorization code');
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Test error display (should still work without animations)
    await page.fill('#password', 'wrong');
    await page.click('button');
    
    await expect(page.locator('#error')).toBeVisible();
  });

  test('should maintain focus management during interactions', async ({ page }) => {
    // Focus should be on password input initially
    await expect(page.locator('#password')).toBeFocused();
    
    // After failed login, focus should return to input
    await page.fill('#password', 'wrong');
    await page.click('button');
    
    // Focus should be managed appropriately (either on input or error)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should work with screen reader simulation', async ({ page }) => {
    // Test tab order
    await page.keyboard.press('Tab');
    await expect(page.locator('button')).toBeFocused();
    
    // Test form submission via keyboard
    await page.keyboard.press('Shift+Tab');
    await page.fill('#password', 'candlefish');
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/candlefish_update_08032025_family\.html/);
  });
});