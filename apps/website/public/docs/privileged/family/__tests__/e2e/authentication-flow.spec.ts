import { test, expect } from '@playwright/test';

test.describe('Family Letter Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session storage
    await page.goto('/index.html');
    await page.evaluate(() => sessionStorage.clear());
  });

  test('should display login form on initial visit', async ({ page }) => {
    await page.goto('/index.html');

    // Check that the auth form is visible
    await expect(page.locator('#authForm')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button')).toContainText('Access Document');

    // Check confidential notice
    await expect(page.locator('.confidential-notice'))
      .toContainText('CONFIDENTIAL FAMILY COMMUNICATION');

    // Check heading
    await expect(page.locator('h2')).toContainText('Executive Document Access');
  });

  test('should successfully authenticate with correct password', async ({ page }) => {
    await page.goto('/index.html');

    // Enter correct password
    await page.fill('#password', 'candlefish');
    await page.click('button');

    // Should redirect to family letter
    await expect(page).toHaveURL(/candlefish_update_08032025_family\.html/);

    // Verify session storage is set
    const authValue = await page.evaluate(() =>
      sessionStorage.getItem('family-letter-auth')
    );
    expect(authValue).toBe('true');
  });

  test('should show error for incorrect password', async ({ page }) => {
    await page.goto('/index.html');

    // Enter incorrect password
    await page.fill('#password', 'wrongpassword');
    await page.click('button');

    // Should show error message
    await expect(page.locator('#error')).toBeVisible();
    await expect(page.locator('#error'))
      .toContainText('Invalid authorization code. Please try again.');

    // Password field should be cleared
    await expect(page.locator('#password')).toHaveValue('');

    // Should remain on login page
    await expect(page).toHaveURL(/index\.html/);

    // Session storage should not be set
    const authValue = await page.evaluate(() =>
      sessionStorage.getItem('family-letter-auth')
    );
    expect(authValue).toBeNull();
  });

  test('should authenticate using Enter key', async ({ page }) => {
    await page.goto('/index.html');

    // Enter correct password and press Enter
    await page.fill('#password', 'candlefish');
    await page.press('#password', 'Enter');

    // Should redirect to family letter
    await expect(page).toHaveURL(/candlefish_update_08032025_family\.html/);
  });

  test('should hide error message after 3 seconds', async ({ page }) => {
    await page.goto('/index.html');

    // Enter incorrect password
    await page.fill('#password', 'wrong');
    await page.click('button');

    // Error should be visible
    await expect(page.locator('#error')).toBeVisible();

    // Wait for error to hide
    await page.waitForTimeout(3100);
    await expect(page.locator('#error')).toBeHidden();
  });

  test('should skip login if already authenticated', async ({ page }) => {
    // Set session storage
    await page.goto('/index.html');
    await page.evaluate(() =>
      sessionStorage.setItem('family-letter-auth', 'true')
    );

    // Reload page
    await page.reload();

    // Should redirect immediately to family letter
    await expect(page).toHaveURL(/candlefish_update_08032025_family\.html/);
  });

  test('should handle multiple failed attempts', async ({ page }) => {
    await page.goto('/index.html');

    // Try multiple wrong passwords
    const attempts = ['wrong1', 'wrong2', 'wrong3'];

    for (const attempt of attempts) {
      await page.fill('#password', attempt);
      await page.click('button');

      await expect(page.locator('#error')).toBeVisible();
      await expect(page.locator('#password')).toHaveValue('');

      // Wait for error to hide before next attempt
      await page.waitForTimeout(3100);
    }

    // Finally enter correct password
    await page.fill('#password', 'candlefish');
    await page.click('button');

    await expect(page).toHaveURL(/candlefish_update_08032025_family\.html/);
  });

  test('should maintain focus on password field', async ({ page }) => {
    await page.goto('/index.html');

    // Password field should be focused initially (autofocus)
    await expect(page.locator('#password')).toBeFocused();

    // After failed attempt, focus should return
    await page.fill('#password', 'wrong');
    await page.click('button');

    // Focus should be maintained
    await expect(page.locator('#password')).toBeFocused();
  });
});
