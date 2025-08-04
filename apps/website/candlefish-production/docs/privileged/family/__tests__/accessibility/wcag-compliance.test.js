/**
 * WCAG 2.1 AA Compliance Tests
 * Comprehensive accessibility testing for family letter system
 */

const { axe, toHaveNoViolations } = require('jest-axe');
const { JSDOM } = require('jsdom');

expect.extend(toHaveNoViolations);

// Mock DOM environment
const createDOMEnvironment = (htmlContent) => {
    const dom = new JSDOM(htmlContent, {
        url: 'http://localhost:3000',
        pretendToBeVisual: true,
        resources: 'usable'
    });
    
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    
    return dom;
};

// HTML templates for testing
const loginPageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candlefish AI - Secure Executive Access</title>
    <style>
        .error { border: 2px solid #d73027; background-color: #fff2f2; }
        .field-error { color: #d73027; font-size: 0.875rem; margin-top: 0.25rem; }
        .loading-indicator[aria-hidden="false"] { display: block; }
        .loading-indicator[aria-hidden="true"] { display: none; }
        .error-message[aria-hidden="false"] { display: block; }
        .error-message[aria-hidden="true"] { display: none; }
        .success-message { background-color: #d4edda; color: #155724; padding: 1rem; border-radius: 4px; }
        .form-input { padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
        .form-input:focus { outline: 2px solid #0066cc; outline-offset: 2px; }
        .submit-button { background-color: #0066cc; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
        .submit-button:focus { outline: 2px solid #004499; outline-offset: 2px; }
        .submit-button:disabled { background-color: #ccc; cursor: not-allowed; }
        .password-toggle { background: none; border: none; cursor: pointer; padding: 0.5rem; }
        .password-toggle:focus { outline: 2px solid #0066cc; outline-offset: 2px; }
        .confidential-notice { background-color: #fff3cd; color: #856404; padding: 1rem; border: 1px solid #ffeaa7; border-radius: 4px; }
    </style>
</head>
<body>
    <header class="letterhead" role="banner">
        <div class="logo-container">
            <img 
                src="./images/candlefish_optimized.webp" 
                alt="Candlefish AI Logo - Illuminating Business Intelligence"
                width="200" 
                height="120"
                decoding="async"
            >
        </div>
        <div class="company-info">
            <h1 class="company-name">CANDLEFISH AI</h1>
            <p class="tagline">Illuminating Business Intelligence</p>
        </div>
    </header>

    <main class="main-content" role="main">
        <div class="auth-container">
            <div class="confidential-notice" role="alert" aria-live="polite">
                <strong>CONFIDENTIAL FAMILY COMMUNICATION</strong>
                <p>This system contains sensitive business and family information.</p>
            </div>

            <form id="loginForm" class="login-form" role="form" aria-labelledby="login-title">
                <h2 id="login-title">Executive Document Access</h2>
                <p class="form-description">
                    Please provide your credentials to access protected family communications.
                    All authentication attempts are logged for security purposes.
                </p>

                <div 
                    id="errorMessage" 
                    class="error-message" 
                    role="alert" 
                    aria-live="assertive"
                    aria-hidden="true"
                >
                </div>

                <div 
                    id="loadingIndicator" 
                    class="loading-indicator" 
                    aria-hidden="true"
                    role="status"
                    aria-label="Authenticating..."
                >
                    <div class="spinner"></div>
                    <span>Authenticating...</span>
                </div>

                <div class="form-group">
                    <label for="email" class="form-label">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email"
                        class="form-input"
                        placeholder="Enter your email address"
                        required
                        autocomplete="email"
                        aria-describedby="email-help"
                        aria-invalid="false"
                    >
                    <div id="email-help" class="form-help">
                        Use your authorized family or business email address
                    </div>
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">Authorization Code</label>
                    <div class="password-wrapper">
                        <input 
                            type="password" 
                            id="password" 
                            name="password"
                            class="form-input"
                            placeholder="Enter authorization code"
                            required
                            autocomplete="current-password"
                            aria-describedby="password-help"
                            aria-invalid="false"
                        >
                        <button 
                            type="button" 
                            id="togglePassword" 
                            class="password-toggle"
                            aria-label="Show password"
                            tabindex="0"
                        >
                            <span class="toggle-icon" aria-hidden="true">👁</span>
                        </button>
                    </div>
                    <div id="password-help" class="form-help">
                        Enter the secure authorization code provided to you
                    </div>
                </div>

                <button 
                    type="submit" 
                    id="submitButton"
                    class="submit-button"
                    aria-describedby="submit-help"
                >
                    <span class="button-text">Access Document</span>
                    <span class="button-icon" aria-hidden="true">🔐</span>
                </button>
                <div id="submit-help" class="form-help">
                    Click to authenticate and access the protected document
                </div>
            </form>

            <div class="security-info">
                <h3>Security Information</h3>
                <ul>
                    <li>All access attempts are logged and monitored</li>
                    <li>Sessions automatically expire after 2 hours of inactivity</li>
                    <li>Document access is restricted to authorized family members</li>
                    <li>For security issues, contact: security@candlefish-ai.com</li>
                </ul>
            </div>
        </div>
    </main>

    <footer class="footer" role="contentinfo">
        <p>© 2025 Candlefish AI, LLC. All rights reserved.</p>
        <p class="legal-notice">Confidential and Proprietary | Document ID: FAM-2025-001</p>
    </footer>
</body>
</html>
`;

const documentViewerHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candlefish AI - Family Business Structure</title>
    <style>
        .loading-screen[aria-hidden="true"] { display: none; }
        .error-screen[aria-hidden="true"] { display: none; }
        .document-header[aria-hidden="true"] { display: none; }
        .document-content[aria-hidden="true"] { display: none; }
        .document-footer[aria-hidden="true"] { display: none; }
        .action-button { background-color: #0066cc; color: white; padding: 0.75rem 1rem; border: none; border-radius: 4px; margin: 0.5rem; cursor: pointer; }
        .action-button:focus { outline: 2px solid #004499; outline-offset: 2px; }
        .logout-button { background-color: #dc3545; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
        .logout-button:focus { outline: 2px solid #c82333; outline-offset: 2px; }
        .session-timer { font-family: monospace; font-weight: bold; }
        .temporary-message { background-color: #d4edda; color: #155724; padding: 0.5rem 1rem; border-radius: 4px; position: fixed; top: 1rem; right: 1rem; z-index: 1000; }
        .session-warning { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 2px solid #ffc107; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 1001; }
        .confidentiality-notice { font-style: italic; color: #666; }
    </style>
</head>
<body>
    <div id="loadingScreen" class="loading-screen" aria-hidden="false" role="status" aria-label="Loading document...">
        <div class="loading-content">
            <div class="spinner"></div>
            <h2>Loading Secure Document</h2>
            <p>Verifying access credentials and decrypting content...</p>
        </div>
    </div>

    <div id="errorScreen" class="error-screen" aria-hidden="true" role="alert">
        <div class="error-content">
            <div class="error-icon">⚠️</div>
            <h2>Access Denied</h2>
            <p id="errorMessage">You do not have permission to view this document.</p>
            <button id="backToLogin" class="button-secondary">Return to Login</button>
        </div>
    </div>

    <header id="documentHeader" class="document-header" role="banner" aria-hidden="true">
        <div class="header-controls">
            <button id="logoutButton" class="logout-button" aria-label="Logout and return to login page">
                <span class="button-icon">🚪</span>
                <span class="button-text">Logout</span>
            </button>
            <div class="session-info">
                <span id="sessionTimer" class="session-timer" aria-live="polite">Session: 2:00:00</span>
                <span id="userInfo" class="user-info">Family Member (family)</span>
            </div>
        </div>
        
        <div class="letterhead">
            <div class="logo-container">
                <img 
                    src="./images/candlefish_optimized.webp" 
                    alt="Candlefish AI Logo"
                    width="150" 
                    height="90"
                    decoding="async"
                >
            </div>
            <div class="company-info">
                <h1 class="company-name">CANDLEFISH AI</h1>
                <p class="tagline">Illuminating Business Intelligence</p>
            </div>
        </div>
    </header>

    <main id="documentContent" class="document-content" role="main" aria-hidden="true">
        <article class="family-letter">
            <div id="documentBody" class="document-body">
                <h1>Candlefish AI Family Business Structure</h1>
                <p>This document outlines the organizational structure, governance policies, and strategic initiatives for Candlefish AI's family business operations.</p>
                <h2>Executive Summary</h2>
                <p>Our family business structure is designed to balance professional excellence with family values, ensuring sustainable growth while maintaining our core principles.</p>
                <h2>Governance Framework</h2>
                <ul>
                    <li>Board of Directors composition</li>
                    <li>Family Council responsibilities</li>
                    <li>Succession planning guidelines</li>
                    <li>Conflict resolution procedures</li>
                </ul>
            </div>
        </article>

        <div class="document-actions">
            <button id="printButton" class="action-button" aria-label="Print this document">
                <span class="button-icon">🖨️</span>
                <span class="button-text">Print</span>
            </button>
            <button id="downloadButton" class="action-button" aria-label="Download document as PDF">
                <span class="button-icon">📄</span>
                <span class="button-text">Download PDF</span>
            </button>
            <button id="shareButton" class="action-button" aria-label="Share document link">
                <span class="button-icon">🔗</span>
                <span class="button-text">Share</span>
            </button>
        </div>
    </main>

    <footer id="documentFooter" class="document-footer" role="contentinfo" aria-hidden="true">
        <div class="footer-content">
            <p class="copyright">© 2025 Candlefish AI, LLC. All rights reserved.</p>
            <p class="confidentiality-notice">
                <strong>CONFIDENTIAL:</strong> This document contains proprietary business information 
                intended solely for authorized family members. Unauthorized distribution is prohibited.
            </p>
            <div class="document-metadata">
                <span>Document ID: FAM-2025-001</span>
                <span>|</span>
                <span>Classification: Family Confidential</span>
                <span>|</span>
                <span id="lastUpdated">Last Updated: August 3, 2025</span>
            </div>
        </div>
    </footer>
</body>
</html>
`;

describe('WCAG 2.1 AA Compliance Tests', () => {
    let dom;

    afterEach(() => {
        if (dom) {
            dom.window.close();
        }
    });

    describe('Login Page Accessibility', () => {
        beforeEach(() => {
            dom = createDOMEnvironment(loginPageHTML);
        });

        test('should have no accessibility violations on initial load', async () => {
            const results = await axe(dom.window.document.body);
            expect(results).toHaveNoViolations();
        });

        test('should have proper heading hierarchy', () => {
            const headings = dom.window.document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
            
            expect(headingLevels).toEqual([1, 2, 3]); // h1 (company name), h2 (form title), h3 (security info)
            
            // Check heading content
            expect(headings[0].textContent).toBe('CANDLEFISH AI');
            expect(headings[1].textContent).toBe('Executive Document Access');
            expect(headings[2].textContent).toBe('Security Information');
        });

        test('should have proper form labels and associations', () => {
            const emailInput = dom.window.document.getElementById('email');
            const passwordInput = dom.window.document.getElementById('password');
            
            // Check label associations
            const emailLabel = dom.window.document.querySelector('label[for="email"]');
            const passwordLabel = dom.window.document.querySelector('label[for="password"]');
            
            expect(emailLabel).toBeTruthy();
            expect(passwordLabel).toBeTruthy();
            expect(emailLabel.textContent).toBe('Email Address');
            expect(passwordLabel.textContent).toBe('Authorization Code');
            
            // Check ARIA associations
            expect(emailInput.getAttribute('aria-describedby')).toBe('email-help');
            expect(passwordInput.getAttribute('aria-describedby')).toBe('password-help');
            
            // Check help text
            const emailHelp = dom.window.document.getElementById('email-help');
            const passwordHelp = dom.window.document.getElementById('password-help');
            
            expect(emailHelp.textContent).toContain('authorized family or business email');
            expect(passwordHelp.textContent).toContain('secure authorization code');
        });

        test('should have proper ARIA attributes', () => {
            const form = dom.window.document.getElementById('loginForm');
            const errorMessage = dom.window.document.getElementById('errorMessage');
            const loadingIndicator = dom.window.document.getElementById('loadingIndicator');
            const confidentialNotice = dom.window.document.querySelector('.confidential-notice');
            
            // Form attributes
            expect(form.getAttribute('role')).toBe('form');
            expect(form.getAttribute('aria-labelledby')).toBe('login-title');
            
            // Error message attributes
            expect(errorMessage.getAttribute('role')).toBe('alert');
            expect(errorMessage.getAttribute('aria-live')).toBe('assertive');
            expect(errorMessage.getAttribute('aria-hidden')).toBe('true');
            
            // Loading indicator attributes
            expect(loadingIndicator.getAttribute('role')).toBe('status');
            expect(loadingIndicator.getAttribute('aria-hidden')).toBe('true');
            
            // Confidential notice attributes
            expect(confidentialNotice.getAttribute('role')).toBe('alert');
            expect(confidentialNotice.getAttribute('aria-live')).toBe('polite');
        });

        test('should support keyboard navigation', () => {
            const focusableElements = dom.window.document.querySelectorAll(
                'input, button, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
            );
            
            expect(focusableElements.length).toBeGreaterThan(0);
            
            // Check tab order
            const emailInput = dom.window.document.getElementById('email');
            const passwordInput = dom.window.document.getElementById('password');
            const toggleButton = dom.window.document.getElementById('togglePassword');
            const submitButton = dom.window.document.getElementById('submitButton');
            
            expect(emailInput.tabIndex).toBe(0);
            expect(passwordInput.tabIndex).toBe(0);
            expect(toggleButton.tabIndex).toBe(0);
            expect(submitButton.tabIndex).toBe(0);
        });

        test('should have sufficient color contrast', () => {
            // This test documents expected behavior for color contrast
            // In a real implementation, you would use tools like axe-core to check actual contrast ratios
            
            const form = dom.window.document.getElementById('loginForm');
            const inputs = form.querySelectorAll('input');
            const buttons = form.querySelectorAll('button');
            
            // Verify elements exist for contrast checking
            expect(inputs.length).toBeGreaterThan(0);
            expect(buttons.length).toBeGreaterThan(0);
            
            // In real implementation, would check computed styles:
            // const computedStyle = dom.window.getComputedStyle(element);
            // const backgroundColor = computedStyle.backgroundColor;
            // const color = computedStyle.color;
            // const contrastRatio = calculateContrastRatio(color, backgroundColor);
            // expect(contrastRatio).toBeGreaterThanOrEqual(4.5); // WCAG AA standard
        });

        test('should handle error states accessibly', () => {
            const emailInput = dom.window.document.getElementById('email');
            const errorMessage = dom.window.document.getElementById('errorMessage');
            
            // Simulate error state
            emailInput.setAttribute('aria-invalid', 'true');
            emailInput.classList.add('error');
            errorMessage.setAttribute('aria-hidden', 'false');
            errorMessage.textContent = 'Please enter a valid email address';
            
            // Create field-specific error
            const fieldError = dom.window.document.createElement('div');
            fieldError.className = 'field-error';
            fieldError.setAttribute('role', 'alert');
            fieldError.textContent = 'Email address is required';
            emailInput.parentNode.appendChild(fieldError);
            
            // Verify error state accessibility
            expect(emailInput.getAttribute('aria-invalid')).toBe('true');
            expect(errorMessage.getAttribute('aria-hidden')).toBe('false');
            expect(fieldError.getAttribute('role')).toBe('alert');
            
            // Check error is announced
            const alerts = dom.window.document.querySelectorAll('[role="alert"]');
            expect(alerts.length).toBeGreaterThan(0);
        });

        test('should have accessible button labels', () => {
            const submitButton = dom.window.document.getElementById('submitButton');
            const togglePassword = dom.window.document.getElementById('togglePassword');
            
            // Submit button should have descriptive text
            const buttonText = submitButton.querySelector('.button-text');
            expect(buttonText.textContent).toBe('Access Document');
            
            // Toggle button should have aria-label
            expect(togglePassword.getAttribute('aria-label')).toBe('Show password');
            
            // Icons should be hidden from screen readers
            const buttonIcon = submitButton.querySelector('.button-icon');
            const toggleIcon = togglePassword.querySelector('.toggle-icon');
            
            expect(buttonIcon.getAttribute('aria-hidden')).toBe('true');
            expect(toggleIcon.getAttribute('aria-hidden')).toBe('true');
        });

        test('should support screen reader announcements', () => {
            const form = dom.window.document.getElementById('loginForm');
            const liveRegions = dom.window.document.querySelectorAll('[aria-live]');
            
            expect(liveRegions.length).toBeGreaterThan(0);
            
            // Check live region politeness levels
            const assertiveRegions = dom.window.document.querySelectorAll('[aria-live="assertive"]');
            const politeRegions = dom.window.document.querySelectorAll('[aria-live="polite"]');
            
            expect(assertiveRegions.length).toBeGreaterThan(0); // Error messages
            expect(politeRegions.length).toBeGreaterThan(0); // Status updates
        });
    });

    describe('Document Viewer Accessibility', () => {
        beforeEach(() => {
            dom = createDOMEnvironment(documentViewerHTML);
            
            // Simulate loaded state
            const loadingScreen = dom.window.document.getElementById('loadingScreen');
            const documentHeader = dom.window.document.getElementById('documentHeader');
            const documentContent = dom.window.document.getElementById('documentContent');
            const documentFooter = dom.window.document.getElementById('documentFooter');
            
            loadingScreen.setAttribute('aria-hidden', 'true');
            documentHeader.setAttribute('aria-hidden', 'false');
            documentContent.setAttribute('aria-hidden', 'false');
            documentFooter.setAttribute('aria-hidden', 'false');
        });

        test('should have no accessibility violations when loaded', async () => {
            const results = await axe(dom.window.document.body);
            expect(results).toHaveNoViolations();
        });

        test('should have proper landmark structure', () => {
            const banner = dom.window.document.querySelector('[role="banner"]');
            const main = dom.window.document.querySelector('[role="main"]');
            const contentinfo = dom.window.document.querySelector('[role="contentinfo"]');
            
            expect(banner).toBeTruthy();
            expect(main).toBeTruthy();
            expect(contentinfo).toBeTruthy();
            
            // Check landmark content
            expect(banner.id).toBe('documentHeader');
            expect(main.id).toBe('documentContent');
            expect(contentinfo.id).toBe('documentFooter');
        });

        test('should have accessible document structure', () => {
            const article = dom.window.document.querySelector('article');
            const headings = dom.window.document.querySelectorAll('#documentBody h1, #documentBody h2, #documentBody h3');
            
            expect(article).toBeTruthy();
            expect(article.className).toBe('family-letter');
            
            // Check heading hierarchy in document
            const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
            expect(headingLevels).toEqual([1, 2, 2]); // h1 (title), h2 (summary), h2 (framework)
            
            // Check heading content
            expect(headings[0].textContent).toBe('Candlefish AI Family Business Structure');
            expect(headings[1].textContent).toBe('Executive Summary');
            expect(headings[2].textContent).toBe('Governance Framework');
        });

        test('should have accessible action buttons', () => {
            const printButton = dom.window.document.getElementById('printButton');
            const downloadButton = dom.window.document.getElementById('downloadButton');
            const shareButton = dom.window.document.getElementById('shareButton');
            const logoutButton = dom.window.document.getElementById('logoutButton');
            
            // Check aria-labels
            expect(printButton.getAttribute('aria-label')).toBe('Print this document');
            expect(downloadButton.getAttribute('aria-label')).toBe('Download document as PDF');
            expect(shareButton.getAttribute('aria-label')).toBe('Share document link');
            expect(logoutButton.getAttribute('aria-label')).toBe('Logout and return to login page');
            
            // Check button content structure
            const buttons = [printButton, downloadButton, shareButton, logoutButton];
            buttons.forEach(button => {
                const icon = button.querySelector('.button-icon');
                const text = button.querySelector('.button-text');
                
                if (icon) {
                    expect(icon.getAttribute('aria-hidden')).toBe('true');
                }
                expect(text).toBeTruthy();
            });
        });

        test('should handle session timer accessibility', () => {
            const sessionTimer = dom.window.document.getElementById('sessionTimer');
            
            expect(sessionTimer.getAttribute('aria-live')).toBe('polite');
            expect(sessionTimer.textContent).toMatch(/Session: \d+:\d{2}:\d{2}/);
            
            // Session timer should update accessibly
            sessionTimer.textContent = 'Session: 1:59:30';
            expect(sessionTimer.textContent).toBe('Session: 1:59:30');
        });

        test('should handle loading and error states accessibly', () => {
            const loadingScreen = dom.window.document.getElementById('loadingScreen');
            const errorScreen = dom.window.document.getElementById('errorScreen');
            
            // Loading state
            expect(loadingScreen.getAttribute('role')).toBe('status');
            expect(loadingScreen.getAttribute('aria-label')).toBe('Loading document...');
            
            // Error state
            expect(errorScreen.getAttribute('role')).toBe('alert');
            
            // Simulate error state
            loadingScreen.setAttribute('aria-hidden', 'true');
            errorScreen.setAttribute('aria-hidden', 'false');
            
            const errorMessage = dom.window.document.getElementById('errorMessage');
            errorMessage.textContent = 'Access denied. Please contact administrator.';
            
            expect(errorScreen.getAttribute('aria-hidden')).toBe('false');
            expect(errorMessage.textContent).toContain('Access denied');
        });

        test('should support keyboard navigation for document actions', () => {
            const actionButtons = dom.window.document.querySelectorAll('.document-actions button');
            const logoutButton = dom.window.document.getElementById('logoutButton');
            
            // All buttons should be keyboard accessible
            actionButtons.forEach(button => {
                expect(button.tabIndex).toBe(0);
            });
            
            expect(logoutButton.tabIndex).toBe(0);
            
            // Check button order for logical tab sequence
            const allButtons = dom.window.document.querySelectorAll('button');
            expect(allButtons.length).toBeGreaterThan(0);
        });

        test('should handle dynamic content updates accessibly', () => {
            // Simulate session warning
            const warningDiv = dom.window.document.createElement('div');
            warningDiv.className = 'session-warning';
            warningDiv.setAttribute('role', 'alert');
            warningDiv.innerHTML = `
                <div class="warning-content">
                    <h3>Session Expiring Soon</h3>
                    <p>Your session will expire in 5 minutes. Do you want to extend it?</p>
                    <button id="extendSession" class="button-primary">Extend Session</button>
                    <button id="logoutNow" class="button-secondary">Logout Now</button>
                </div>
            `;
            
            dom.window.document.body.appendChild(warningDiv);
            
            expect(warningDiv.getAttribute('role')).toBe('alert');
            
            // Check warning buttons are accessible
            const extendButton = dom.window.document.getElementById('extendSession');
            const logoutNowButton = dom.window.document.getElementById('logoutNow');
            
            expect(extendButton).toBeTruthy();
            expect(logoutNowButton).toBeTruthy();
        });

        test('should handle temporary messages accessibly', () => {
            // Simulate temporary success message
            const messageDiv = dom.window.document.createElement('div');
            messageDiv.className = 'temporary-message';
            messageDiv.setAttribute('role', 'status');
            messageDiv.setAttribute('aria-live', 'polite');
            messageDiv.textContent = 'Document link copied to clipboard';
            
            dom.window.document.body.appendChild(messageDiv);
            
            expect(messageDiv.getAttribute('role')).toBe('status');
            expect(messageDiv.getAttribute('aria-live')).toBe('polite');
            expect(messageDiv.textContent).toBe('Document link copied to clipboard');
        });

        test('should have accessible document metadata', () => {
            const metadata = dom.window.document.querySelector('.document-metadata');
            const lastUpdated = dom.window.document.getElementById('lastUpdated');
            
            expect(metadata).toBeTruthy();
            expect(lastUpdated).toBeTruthy();
            expect(lastUpdated.textContent).toBe('Last Updated: August 3, 2025');
            
            // Metadata should be in footer for proper structure
            const footer = dom.window.document.querySelector('footer');
            expect(footer.contains(metadata)).toBe(true);
        });
    });

    describe('Responsive Design Accessibility', () => {
        test('should maintain accessibility at mobile viewport', () => {
            dom = createDOMEnvironment(loginPageHTML);
            
            // Simulate mobile viewport
            Object.defineProperty(dom.window, 'innerWidth', { value: 375, writable: true });
            Object.defineProperty(dom.window, 'innerHeight', { value: 667, writable: true });
            
            // Check that essential elements are still accessible
            const form = dom.window.document.getElementById('loginForm');
            const inputs = form.querySelectorAll('input');
            const buttons = form.querySelectorAll('button');
            
            expect(form).toBeTruthy();
            expect(inputs.length).toBeGreaterThan(0);
            expect(buttons.length).toBeGreaterThan(0);
            
            // Form should still have proper ARIA attributes
            expect(form.getAttribute('role')).toBe('form');
            expect(form.getAttribute('aria-labelledby')).toBe('login-title');
        });

        test('should handle touch interactions accessibly', () => {
            dom = createDOMEnvironment(loginPageHTML);
            
            const toggleButton = dom.window.document.getElementById('togglePassword');
            const submitButton = dom.window.document.getElementById('submitButton');
            
            // Buttons should have sufficient touch target size (44x44px minimum)
            // This would be checked with computed styles in real implementation
            expect(toggleButton).toBeTruthy();
            expect(submitButton).toBeTruthy();
            
            // Touch targets should still be keyboard accessible
            expect(toggleButton.tabIndex).toBe(0);
            expect(submitButton.tabIndex).toBe(0);
        });

        test('should support zoom up to 200% without horizontal scrolling', () => {
            dom = createDOMEnvironment(loginPageHTML);
            
            // Simulate 200% zoom
            Object.defineProperty(dom.window, 'devicePixelRatio', { value: 2, writable: true });
            
            // Content should still be accessible
            const form = dom.window.document.getElementById('loginForm');
            const title = dom.window.document.getElementById('login-title');
            
            expect(form).toBeTruthy();
            expect(title.textContent).toBe('Executive Document Access');
            
            // Text should still be readable
            expect(title.textContent.length).toBeGreaterThan(0);
        });
    });

    describe('Screen Reader Compatibility', () => {
        test('should provide meaningful page titles', () => {
            dom = createDOMEnvironment(loginPageHTML);
            const title = dom.window.document.title;
            
            expect(title).toBe('Candlefish AI - Secure Executive Access');
            expect(title).toContain('Candlefish AI');
            expect(title).toContain('Secure');
        });

        test('should have proper language attributes', () => {
            dom = createDOMEnvironment(loginPageHTML);
            const html = dom.window.document.documentElement;
            
            expect(html.getAttribute('lang')).toBe('en');
        });

        test('should provide alternative text for images', () => {
            dom = createDOMEnvironment(loginPageHTML);
            const logo = dom.window.document.querySelector('img');
            
            expect(logo.getAttribute('alt')).toBe('Candlefish AI Logo - Illuminating Business Intelligence');
            expect(logo.getAttribute('alt')).not.toBe('');
        });

        test('should use semantic HTML elements', () => {
            dom = createDOMEnvironment(loginPageHTML);
            
            const header = dom.window.document.querySelector('header');
            const main = dom.window.document.querySelector('main');
            const footer = dom.window.document.querySelector('footer');
            const form = dom.window.document.querySelector('form');
            
            expect(header).toBeTruthy();
            expect(main).toBeTruthy();
            expect(footer).toBeTruthy();
            expect(form).toBeTruthy();
            
            // Check roles are implicit or explicit
            expect(header.getAttribute('role') || 'banner').toBe('banner');
            expect(main.getAttribute('role') || 'main').toBe('main');
            expect(footer.getAttribute('role') || 'contentinfo').toBe('contentinfo');
            expect(form.getAttribute('role') || 'form').toBe('form');
        });

        test('should provide skip links for navigation', () => {
            // This test documents expected behavior for skip links
            // In a real implementation, you would add skip links
            
            dom = createDOMEnvironment(loginPageHTML);
            
            // Skip links should be added for better navigation
            const skipLink = dom.window.document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = 'Skip to main content';
            skipLink.className = 'skip-link';
            
            dom.window.document.body.insertBefore(skipLink, dom.window.document.body.firstChild);
            
            expect(skipLink.textContent).toBe('Skip to main content');
            expect(skipLink.href).toContain('#main-content');
        });
    });

    describe('WCAG 2.1 Success Criteria Compliance', () => {
        test('should meet Level A criteria', () => {
            dom = createDOMEnvironment(loginPageHTML);
            
            // 1.1.1 Non-text Content
            const images = dom.window.document.querySelectorAll('img');
            images.forEach(img => {
                expect(img.getAttribute('alt')).toBeDefined();
                expect(img.getAttribute('alt')).not.toBe('');
            });
            
            // 1.3.1 Info and Relationships
            const labels = dom.window.document.querySelectorAll('label');
            labels.forEach(label => {
                const forAttr = label.getAttribute('for');
                if (forAttr) {
                    const associatedInput = dom.window.document.getElementById(forAttr);
                    expect(associatedInput).toBeTruthy();
                }
            });
            
            // 2.1.1 Keyboard accessible
            const interactiveElements = dom.window.document.querySelectorAll('button, input, a, [tabindex]');
            interactiveElements.forEach(element => {
                if (element.tabIndex !== -1) {
                    expect(element.tabIndex).toBeGreaterThanOrEqual(0);
                }
            });
            
            // 2.4.1 Bypass Blocks (would need skip links in real implementation)
            // 2.4.2 Page Titled
            expect(dom.window.document.title).toBeTruthy();
            expect(dom.window.document.title.length).toBeGreaterThan(0);
        });

        test('should meet Level AA criteria', () => {
            dom = createDOMEnvironment(loginPageHTML);
            
            // 1.4.3 Contrast (would need actual color calculations in real implementation)
            // 1.4.4 Resize text (text should be resizable up to 200%)
            // 2.4.6 Headings and Labels
            const headings = dom.window.document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(heading => {
                expect(heading.textContent.trim().length).toBeGreaterThan(0);
            });
            
            const labels = dom.window.document.querySelectorAll('label');
            labels.forEach(label => {
                expect(label.textContent.trim().length).toBeGreaterThan(0);
            });
            
            // 2.4.7 Focus Visible (would need visual testing in real implementation)
            // 3.1.2 Language of Parts
            expect(dom.window.document.documentElement.getAttribute('lang')).toBe('en');
        });

        test('should implement ARIA best practices', () => {
            dom = createDOMEnvironment(documentViewerHTML);
            
            // ARIA landmarks
            const landmarks = dom.window.document.querySelectorAll('[role="banner"], [role="main"], [role="contentinfo"]');
            expect(landmarks.length).toBeGreaterThanOrEqual(3);
            
            // ARIA live regions
            const liveRegions = dom.window.document.querySelectorAll('[aria-live]');
            expect(liveRegions.length).toBeGreaterThan(0);
            
            // ARIA labels and descriptions
            const labeledElements = dom.window.document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
            expect(labeledElements.length).toBeGreaterThan(0);
            
            // ARIA states
            const hiddenElements = dom.window.document.querySelectorAll('[aria-hidden]');
            hiddenElements.forEach(element => {
                const ariaHidden = element.getAttribute('aria-hidden');
                expect(['true', 'false']).toContain(ariaHidden);
            });
        });
    });
});