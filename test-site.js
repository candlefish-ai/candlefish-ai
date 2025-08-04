const puppeteer = require('puppeteer');

async function testSite() {
    console.log('🚀 Starting website test...');
    
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capture console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
            console.log('❌ Console Error:', msg.text());
        } else {
            console.log('📝 Console:', msg.type(), msg.text());
        }
    });
    
    // Capture network failures
    page.on('response', response => {
        if (response.status() >= 400) {
            console.log('🌐 Network Error:', response.status(), response.url());
        }
    });
    
    try {
        console.log('🌐 Loading https://candlefish.ai...');
        await page.goto('https://candlefish.ai', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // Wait for the page to fully load
        await page.waitForTimeout(3000);
        
        // Check if logo is present and large enough
        const logoInfo = await page.evaluate(() => {
            const logo = document.querySelector('.nav__logo-image');
            if (!logo) return { found: false };
            const rect = logo.getBoundingClientRect();
            return {
                found: true,
                width: rect.width,
                height: rect.height,
                src: logo.src,
                visible: rect.width > 0 && rect.height > 0
            };
        });
        
        console.log('🖼️ Logo Info:', logoInfo);
        
        if (logoInfo.found && logoInfo.width >= 160) {
            console.log('✅ Logo size is correct!');
        } else {
            console.log('❌ Logo is too small or missing!');
        }
        
        // Check if animations are working
        const animationsWorking = await page.evaluate(() => {
            // Check if GSAP is loaded
            if (typeof gsap === 'undefined') return { gsap: false };
            
            // Check if Lottie is loaded
            if (typeof LottiePlayer === 'undefined') return { gsap: true, lottie: false };
            
            // Check if particles canvas exists
            const canvas = document.getElementById('particles-canvas');
            const hasCanvas = !!canvas;
            
            return {
                gsap: true,
                lottie: true,
                canvas: hasCanvas,
                loadingComplete: document.querySelector('.loading-overlay').classList.contains('loaded')
            };
        });
        
        console.log('🎬 Animation Status:', animationsWorking);
        
        // Take a screenshot
        await page.screenshot({ 
            path: '/Users/patricksmith/candlefish-ai/test-screenshot.png',
            fullPage: true 
        });
        console.log('📸 Screenshot saved!');
        
        // Check for any JavaScript errors
        if (errors.length === 0) {
            console.log('✅ No JavaScript errors found!');
        } else {
            console.log('❌ JavaScript errors detected:', errors);
        }
        
        console.log('🎉 Test completed successfully!');
        
    } catch (error) {
        console.error('💥 Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testSite();