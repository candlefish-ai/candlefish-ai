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
        } else if (msg.type() === 'warning') {
            console.log('⚠️ Console Warning:', msg.text());
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
        await new Promise(resolve => setTimeout(resolve, 3000));
        
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
            const results = {};
            
            // Check if GSAP is loaded
            results.gsap = typeof gsap !== 'undefined';
            
            // Check if Lottie is loaded
            results.lottie = typeof LottiePlayer !== 'undefined';
            
            // Check if particles canvas exists
            const canvas = document.getElementById('particles-canvas');
            results.canvas = !!canvas;
            
            // Check loading overlay
            const loadingOverlay = document.querySelector('.loading-overlay');
            results.loadingComplete = loadingOverlay && loadingOverlay.classList.contains('loaded');
            
            return results;
        });
        
        console.log('🎬 Animation Status:', animationsWorking);
        
        // Take a screenshot
        await page.screenshot({ 
            path: '/Users/patricksmith/candlefish-ai/test-screenshot.png',
            fullPage: true 
        });
        console.log('📸 Screenshot saved!');
        
        // Summarize results
        console.log('\n=== TEST RESULTS ===');
        console.log(`Logo found: ${logoInfo.found ? '✅' : '❌'}`);
        console.log(`Logo size OK: ${logoInfo.width >= 160 ? '✅' : '❌'} (${logoInfo.width}px)`);
        console.log(`GSAP loaded: ${animationsWorking.gsap ? '✅' : '❌'}`);
        console.log(`Lottie loaded: ${animationsWorking.lottie ? '✅' : '❌'}`);
        console.log(`Canvas exists: ${animationsWorking.canvas ? '✅' : '❌'}`);
        console.log(`JavaScript errors: ${errors.length === 0 ? '✅ None' : '❌ ' + errors.length}`);
        
        if (errors.length > 0) {
            console.log('\nErrors found:');
            errors.forEach((error, i) => console.log(`${i+1}. ${error}`));
        }
        
        console.log('\n🎉 Test completed!');
        
    } catch (error) {
        console.error('💥 Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testSite();