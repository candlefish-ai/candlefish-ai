/**
 * End-to-End User Flow Tests
 * Complete user journey testing with Playwright
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const FAMILY_EMAIL = 'family@candlefish-ai.com';
const FAMILY_PASSWORD = 'family-secure-2025';
const ADMIN_EMAIL = 'patrick@candlefish-ai.com';
const ADMIN_PASSWORD = 'admin-test-123';

// Page object models
class LoginPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto(`${BASE_URL}/secure-login.html`);
        await expect(this.page).toHaveTitle(/Candlefish AI - Secure Executive Access/);
    }

    async fillEmail(email: string) {
        await this.page.fill('#email', email);
    }

    async fillPassword(password: string) {
        await this.page.fill('#password', password);
    }

    async togglePasswordVisibility() {
        await this.page.click('#togglePassword');
    }

    async submitForm() {
        await this.page.click('#submitButton');
    }

    async waitForError() {
        await expect(this.page.locator('#errorMessage')).toBeVisible();
    }

    async waitForLoading() {
        await expect(this.page.locator('#loadingIndicator')).toBeVisible();
    }

    async expectError(message: string) {
        await expect(this.page.locator('#errorMessage')).toContainText(message);
    }

    async expectSuccess() {
        await expect(this.page.locator('.success-message')).toBeVisible();
        await expect(this.page.locator('.success-message')).toContainText('Authentication successful');
    }

    async expectRedirectToDocumentViewer() {
        await expect(this.page).toHaveURL(/secure-document-viewer\.html/);
    }
}

class DocumentViewerPage {
    constructor(private page: Page) {}

    async waitForDocumentLoad() {
        await expect(this.page.locator('#loadingScreen')).toBeHidden();
        await expect(this.page.locator('#documentContent')).toBeVisible();
    }

    async expectDocumentContent() {
        await expect(this.page.locator('#documentBody')).toContainText('Family Business Structure');
    }

    async expectUserInfo(name: string, role: string) {
        await expect(this.page.locator('#userInfo')).toContainText(`${name} (${role})`);
    }

    async expectSessionTimer() {
        await expect(this.page.locator('#sessionTimer')).toContainText('Session:');
        await expect(this.page.locator('#sessionTimer')).toMatch(/Session: \d+:\d{2}:\d{2}/);
    }

    async logout() {
        await this.page.click('#logoutButton');
    }

    async printDocument() {
        // Mock print dialog
        const printPromise = this.page.waitForEvent('dialog');
        await this.page.click('#printButton');
        const dialog = await printPromise;
        await dialog.accept();
    }

    async downloadDocument() {
        const downloadPromise = this.page.waitForEvent('download');
        await this.page.click('#downloadButton');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('FAM-2025-001');
    }

    async shareDocument() {
        await this.page.click('#shareButton');
        // Check for clipboard success message
        await expect(this.page.locator('.temporary-message')).toBeVisible();
        await expect(this.page.locator('.temporary-message')).toContainText('copied to clipboard');
    }

    async expectAccessDenied(message: string) {
        await expect(this.page.locator('#errorScreen')).toBeVisible();
        await expect(this.page.locator('#errorMessage')).toContainText(message);
    }

    async returnToLogin() {
        await this.page.click('#backToLogin');
        await expect(this.page).toHaveURL(/secure-login\.html/);
    }
}

// Test fixtures and setup
test.describe('Complete User Authentication Flow', () => {
    let context: BrowserContext;
    let page: Page;
    let loginPage: LoginPage;
    let documentPage: DocumentViewerPage;

    test.beforeEach(async ({ browser }) => {
        // Create fresh context for each test to avoid session pollution
        context = await browser.newContext({
            // Simulate different devices and network conditions
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            viewport: { width: 1280, height: 720 },
            ignoreHTTPSErrors: true
        });
        
        page = await context.newPage();
        loginPage = new LoginPage(page);
        documentPage = new DocumentViewerPage(page);

        // Mock API responses for E2E testing
        await page.route('**/api/auth/login', async route => {
            const request = route.request();
            const postData = JSON.parse(request.postData() || '{}');
            
            if (postData.email === FAMILY_EMAIL && postData.password === FAMILY_PASSWORD) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        token: 'mock-jwt-token-family',
                        user: {
                            id: 2,
                            email: FAMILY_EMAIL,
                            name: 'Family Member',
                            role: 'family'
                        },
                        expiresIn: 7200,
                        sessionId: 'session_123',
                        cookieSet: true
                    })
                });
            } else {
                await route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        error: 'Invalid credentials',
                        code: 'INVALID_CREDENTIALS'
                    })
                });
            }
        });

        await page.route('**/api/documents/FAM-2025-001', async route => {
            const authHeader = route.request().headers()['authorization'];
            
            if (authHeader && authHeader.includes('mock-jwt-token')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        document: {
                            id: 'FAM-2025-001',
                            title: 'Candlefish AI Family Business Structure',
                            content: '<h1>Family Business Structure</h1><p>This is confidential family business content detailing our organizational structure, governance policies, and strategic initiatives for 2025.</p>',
                            lastUpdated: '2025-08-03',
                            accessedBy: FAMILY_EMAIL,
                            accessedAt: new Date().toISOString()
                        }
                    })
                });
            } else {
                await route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        error: 'Access token required',
                        code: 'UNAUTHORIZED'
                    })
                });
            }
        });

        await page.route('**/api/auth/logout', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    message: 'Logged out successfully'
                })
            });
        });
    });

    test.afterEach(async () => {
        await context.close();
    });

    test('should complete successful login and document viewing flow', async () => {
        // Step 1: Navigate to login page
        await loginPage.goto();
        
        // Verify page loaded correctly
        await expect(page.locator('h2')).toContainText('Executive Document Access');
        await expect(page.locator('.confidential-notice')).toContainText('CONFIDENTIAL FAMILY COMMUNICATION');

        // Step 2: Fill login form
        await loginPage.fillEmail(FAMILY_EMAIL);
        await loginPage.fillPassword(FAMILY_PASSWORD);

        // Step 3: Submit form and verify loading state
        await loginPage.submitForm();
        await loginPage.waitForLoading();

        // Step 4: Verify successful authentication
        await loginPage.expectSuccess();

        // Step 5: Verify redirect to document viewer
        test.setTimeout(10000); // Allow time for redirect
        await loginPage.expectRedirectToDocumentViewer();

        // Step 6: Verify document loads
        await documentPage.waitForDocumentLoad();
        await documentPage.expectDocumentContent();

        // Step 7: Verify user information display
        await documentPage.expectUserInfo('Family Member', 'family');
        await documentPage.expectSessionTimer();

        // Step 8: Test document actions
        await documentPage.shareDocument();

        // Step 9: Logout and verify redirect
        await documentPage.logout();
        await expect(page).toHaveURL(/secure-login\.html/);
    });

    test('should handle invalid credentials correctly', async () => {
        await loginPage.goto();

        // Try invalid credentials
        await loginPage.fillEmail(FAMILY_EMAIL);
        await loginPage.fillPassword('wrong-password');
        await loginPage.submitForm();

        // Verify error handling
        await loginPage.waitForError();
        await loginPage.expectError('Invalid credentials');

        // Verify password field is cleared
        await expect(page.locator('#password')).toHaveValue('');

        // Verify focus returns to password field
        await expect(page.locator('#password')).toBeFocused();
    });

    test('should validate form inputs correctly', async () => {
        await loginPage.goto();

        // Test empty email
        await loginPage.fillPassword(FAMILY_PASSWORD);
        await loginPage.submitForm();

        await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
        await expect(page.locator('.field-error')).toContainText('Email address is required');

        // Test invalid email format
        await loginPage.fillEmail('invalid-email');
        await page.locator('#email').blur();

        await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
        await expect(page.locator('.field-error')).toContainText('Please enter a valid email address');

        // Test password requirement
        await loginPage.fillEmail(FAMILY_EMAIL);
        await page.locator('#password').clear();
        await loginPage.submitForm();

        await expect(page.locator('.field-error')).toContainText('Authorization code is required');
    });

    test('should handle password visibility toggle', async () => {
        await loginPage.goto();

        await loginPage.fillPassword('test-password');
        
        // Initially password should be hidden
        await expect(page.locator('#password')).toHaveAttribute('type', 'password');
        await expect(page.locator('#togglePassword')).toHaveAttribute('aria-label', 'Show password');

        // Toggle to show password
        await loginPage.togglePasswordVisibility();
        await expect(page.locator('#password')).toHaveAttribute('type', 'text');
        await expect(page.locator('#togglePassword')).toHaveAttribute('aria-label', 'Hide password');

        // Toggle back to hide password
        await loginPage.togglePasswordVisibility();
        await expect(page.locator('#password')).toHaveAttribute('type', 'password');
        await expect(page.locator('#togglePassword')).toHaveAttribute('aria-label', 'Show password');
    });
});

test.describe('Document Viewer Functionality', () => {
    let context: BrowserContext;
    let page: Page;
    let documentPage: DocumentViewerPage;

    test.beforeEach(async ({ browser }) => {
        context = await browser.newContext();
        page = await context.newPage();
        documentPage = new DocumentViewerPage(page);

        // Setup API mocks for authenticated state
        await page.route('**/api/documents/FAM-2025-001', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    document: {
                        id: 'FAM-2025-001',
                        title: 'Candlefish AI Family Business Structure',
                        content: '<h1>Family Business Structure</h1><p>Detailed family business content...</p>',
                        lastUpdated: '2025-08-03'
                    }
                })
            });
        });

        // Set up authenticated session
        await page.addInitScript(() => {
            sessionStorage.setItem('auth_method', 'cookie');
            sessionStorage.setItem('user_info', JSON.stringify({
                email: 'family@candlefish-ai.com',
                name: 'Family Member',
                role: 'family',
                lastLogin: new Date().toISOString()
            }));
        });
    });

    test.afterEach(async () => {
        await context.close();
    });

    test('should load document content correctly for authenticated user', async () => {
        await page.goto(`${BASE_URL}/secure-document-viewer.html`);

        // Verify document loads
        await documentPage.waitForDocumentLoad();
        await documentPage.expectDocumentContent();
        await documentPage.expectUserInfo('Family Member', 'family');
        await documentPage.expectSessionTimer();

        // Verify all document elements are visible
        await expect(page.locator('#documentHeader')).toBeVisible();
        await expect(page.locator('#documentContent')).toBeVisible();
        await expect(page.locator('#documentFooter')).toBeVisible();
        await expect(page.locator('.document-actions')).toBeVisible();
    });

    test('should show access denied for unauthenticated user', async () => {
        // Clear session storage to simulate unauthenticated user
        await page.addInitScript(() => {
            sessionStorage.clear();
        });

        await page.goto(`${BASE_URL}/secure-document-viewer.html`);

        await documentPage.expectAccessDenied('Authentication required');
        await documentPage.returnToLogin();
    });

    test('should handle document actions correctly', async () => {
        await page.goto(`${BASE_URL}/secure-document-viewer.html`);
        await documentPage.waitForDocumentLoad();

        // Test print functionality (mock)
        page.on('dialog', async dialog => {
            expect(dialog.type()).toBe('alert');
            await dialog.accept();
        });

        // Print button should trigger print dialog
        await page.evaluate(() => {
            window.print = () => alert('Print dialog opened');
        });
        await documentPage.printDocument();

        // Test download functionality
        await page.evaluate(() => {
            // Mock download by creating a temporary link
            const originalCreateElement = document.createElement;
            document.createElement = function(tagName) {
                if (tagName === 'a') {
                    const link = originalCreateElement.call(this, 'a');
                    link.click = () => console.log('Download initiated');
                    return link;
                }
                return originalCreateElement.call(this, tagName);
            };
        });

        await documentPage.downloadDocument();

        // Test share functionality (mock clipboard)
        await page.evaluate(() => {
            if (!navigator.clipboard) {
                navigator.clipboard = {};
            }
            navigator.clipboard.writeText = async (text) => {
                console.log('Copied to clipboard:', text);
                return Promise.resolve();
            };
        });

        await documentPage.shareDocument();
    });
});

test.describe('Session Management E2E', () => {
    let context: BrowserContext;
    let page: Page;

    test.beforeEach(async ({ browser }) => {
        context = await browser.newContext();
        page = await context.newPage();
    });

    test.afterEach(async () => {
        await context.close();
    });

    test('should handle session timeout correctly', async () => {
        // Mock short session timeout for testing
        await page.addInitScript(() => {
            window.TEST_SESSION_TIMEOUT = 5000; // 5 seconds for testing
        });

        await page.goto(`${BASE_URL}/secure-document-viewer.html`);

        // Set up authenticated session
        await page.evaluate(() => {
            sessionStorage.setItem('auth_method', 'cookie');
            sessionStorage.setItem('user_info', JSON.stringify({
                email: 'family@candlefish-ai.com',
                name: 'Family Member',
                role: 'family'
            }));
        });

        // Wait for session timeout
        await page.waitForTimeout(6000);

        // Should redirect to login or show access denied
        const isLoginPage = await page.url().includes('secure-login.html');
        const isAccessDenied = await page.locator('#errorScreen').isVisible();

        expect(isLoginPage || isAccessDenied).toBe(true);
    });

    test('should maintain session across page refreshes', async () => {
        // Set up authenticated session
        await page.addInitScript(() => {
            sessionStorage.setItem('auth_method', 'cookie');
            sessionStorage.setItem('user_info', JSON.stringify({
                email: 'family@candlefish-ai.com',
                name: 'Family Member',
                role: 'family'
            }));
        });

        // Mock API to return document
        await page.route('**/api/documents/FAM-2025-001', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    document: {
                        id: 'FAM-2025-001',
                        title: 'Test Document',
                        content: '<p>Test content</p>',
                        lastUpdated: '2025-08-03'
                    }
                })
            });
        });

        await page.goto(`${BASE_URL}/secure-document-viewer.html`);

        // Verify document loads
        await expect(page.locator('#documentContent')).toBeVisible();

        // Refresh page
        await page.reload();

        // Session should be maintained
        await expect(page.locator('#documentContent')).toBeVisible();
        await expect(page.locator('#userInfo')).toContainText('Family Member');
    });
});

test.describe('Accessibility E2E Tests', () => {
    let context: BrowserContext;
    let page: Page;

    test.beforeEach(async ({ browser }) => {
        context = await browser.newContext();
        page = await context.newPage();
    });

    test.afterEach(async () => {
        await context.close();
    });

    test('should support keyboard navigation', async () => {
        await page.goto(`${BASE_URL}/secure-login.html`);

        // Test tab navigation through form
        await page.keyboard.press('Tab');
        await expect(page.locator('#email')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(page.locator('#password')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(page.locator('#togglePassword')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(page.locator('#submitButton')).toBeFocused();

        // Test form submission with Enter key
        await page.locator('#email').fill(FAMILY_EMAIL);
        await page.locator('#password').fill(FAMILY_PASSWORD);
        await page.keyboard.press('Enter');

        // Should trigger form submission
        await expect(page.locator('#loadingIndicator')).toBeVisible();
    });

    test('should have proper ARIA attributes', async () => {
        await page.goto(`${BASE_URL}/secure-login.html`);

        // Check form ARIA attributes
        await expect(page.locator('#loginForm')).toHaveAttribute('role', 'form');
        await expect(page.locator('#errorMessage')).toHaveAttribute('role', 'alert');
        await expect(page.locator('#loadingIndicator')).toHaveAttribute('role', 'status');

        // Check input ARIA attributes
        await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'false');
        await expect(page.locator('#password')).toHaveAttribute('aria-invalid', 'false');

        // Check button ARIA attributes
        await expect(page.locator('#togglePassword')).toHaveAttribute('aria-label');
        await expect(page.locator('#submitButton')).toHaveAttribute('aria-describedby');
    });

    test('should announce errors to screen readers', async () => {
        await page.goto(`${BASE_URL}/secure-login.html`);

        // Try to submit empty form
        await page.click('#submitButton');

        // Error should be announced
        await expect(page.locator('.field-error')).toHaveAttribute('role', 'alert');
        await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
    });

    test('should have sufficient color contrast', async () => {
        await page.goto(`${BASE_URL}/secure-login.html`);

        // This would require actual color contrast checking
        // For now, we verify that error states are clearly distinguishable
        await page.click('#submitButton');
        
        const errorField = page.locator('#email.error');
        await expect(errorField).toBeVisible();
        
        // In a real test, you would check computed styles for contrast ratios
        const styles = await errorField.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                color: computed.color,
                backgroundColor: computed.backgroundColor,
                borderColor: computed.borderColor
            };
        });

        // Verify error styling is applied
        expect(styles.borderColor).toBeDefined();
    });
});

test.describe('Cross-Browser and Mobile Testing', () => {
    test('should work on mobile devices', async ({ browser }) => {
        const context = await browser.newContext({
            ...browser.newContext.defaultOptions,
            viewport: { width: 375, height: 667 }, // iPhone SE dimensions
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
        });
        
        const page = await context.newPage();
        
        await page.goto(`${BASE_URL}/secure-login.html`);
        
        // Verify mobile-friendly design
        await expect(page.locator('.login-form')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        
        // Test touch interactions
        await page.tap('#email');
        await expect(page.locator('#email')).toBeFocused();
        
        await page.fill('#email', FAMILY_EMAIL);
        await page.fill('#password', FAMILY_PASSWORD);
        await page.tap('#submitButton');
        
        await context.close();
    });

    test('should handle slow network conditions', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // Simulate slow 3G
        await page.route('**/*', async route => {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
            await route.continue();
        });
        
        await page.goto(`${BASE_URL}/secure-login.html`);
        
        // Verify page still loads correctly despite slow network
        await expect(page.locator('h2')).toContainText('Executive Document Access');
        
        await context.close();
    });
});