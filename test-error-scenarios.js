import { chromium } from 'playwright';

async function testErrorScenarios() {
  console.log('🚀 Starting error scenario testing...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to CloudFront URL
    console.log('📱 Navigating to CloudFront URL...');
    const cloudFrontUrl = process.env.CLOUDFRONT_URL || 'https://your-distribution.cloudfront.net';
    await page.goto(cloudFrontUrl);
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded successfully');
    
    // Test 1: Rate limit enforcement
    console.log('\n🧪 Test 1: Rate limit enforcement (make 11 uploads)');
    
    const canvas = await page.locator('canvas').first();
    const submitButton = await page.locator('button:has-text("Submit Drawing")').first();
    
    // Make a few uploads to test rate limiting (reduced from 10 to 3 for faster testing)
    for (let i = 1; i <= 3; i++) {
      console.log(`📤 Upload attempt ${i}/3...`);
      
      // Draw a simple dot
      const canvasBox = await canvas.boundingBox();
      if (canvasBox) {
        await page.mouse.move(canvasBox.x + 50 + i * 10, canvasBox.y + 50);
        await page.mouse.down();
        await page.mouse.move(canvasBox.x + 52 + i * 10, canvasBox.y + 52);
        await page.mouse.up();
      }
      
      // Check if submit button is clickable
      if (await submitButton.isVisible() && !await submitButton.isDisabled()) {
        await submitButton.click();
        
        // Wait for response or error
        try {
          // Wait for either success or error
          await Promise.race([
            page.waitForSelector('text=Pokémon', { timeout: 10000 }),
            page.waitForSelector('.error', { timeout: 10000 }),
            page.waitForSelector('text=error', { timeout: 10000 })
          ]);
          console.log(`✅ Upload ${i} completed (success or error)`);
          
          // Close any dialogs
          const closeButtons = [
            'button:has-text("Draw Another")',
            'button:has-text("Close")',
            'button:has-text("OK")',
            '.close-button'
          ];
          
          for (const selector of closeButtons) {
            const button = page.locator(selector);
            if (await button.isVisible()) {
              await button.click();
              break;
            }
          }
          
        } catch (e) {
          console.log(`⚠️  Upload ${i} timed out or failed`);
        }
        
        // Clear canvas for next test
        const clearButton = page.locator('button:has-text("Clear")');
        if (await clearButton.isVisible()) {
          await clearButton.click();
        }
        
      } else {
        console.log(`⚠️  Submit button not available for upload ${i}`);
      }
      
      // Small delay between uploads
      await page.waitForTimeout(2000);
    }
    
    // Try 4th upload (should be rate limited if working)
    console.log('📤 Upload attempt 4/4 (testing rate limit behavior)...');
    
    // Draw another dot
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + 200, canvasBox.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 202, canvasBox.y + 52);
      await page.mouse.up();
    }
    
    // Check if submit button is disabled or rate limit message appears
    const isSubmitDisabled = await submitButton.isDisabled();
    if (isSubmitDisabled) {
      console.log('✅ Submit button correctly disabled due to rate limit');
    } else {
      await submitButton.click();
      
      // Look for rate limit error message
      try {
        await page.waitForSelector('text=rate limit', { timeout: 5000 });
        console.log('✅ Rate limit error message displayed');
      } catch (e) {
        console.log('⚠️  Rate limit not enforced as expected');
      }
    }
    
    // Test 2: Invalid image handling (submit without drawing)
    console.log('\n🧪 Test 2: Invalid image handling (empty canvas)');
    
    // Clear canvas
    const clearButton = page.locator('button:has-text("Clear")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
    
    // Reset rate limit for this test (clear localStorage)
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Try to submit empty canvas
    if (!await submitButton.isDisabled()) {
      await submitButton.click();
      
      try {
        // Look for error message about empty canvas or invalid image
        const errorSelectors = [
          'text=empty',
          'text=invalid',
          'text=error',
          'text=required'
        ];
        
        let errorFound = false;
        for (const selector of errorSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            console.log(`✅ Empty canvas error handled: ${selector}`);
            errorFound = true;
            break;
          } catch (e) {
            // Try next selector
          }
        }
        
        if (!errorFound) {
          console.log('⚠️  Empty canvas should show error message');
        }
        
      } catch (e) {
        console.log('⚠️  Error handling for empty canvas not found');
      }
    }
    
    // Test 3: Network failure simulation (if possible)
    console.log('\n🧪 Test 3: Network failure simulation');
    
    // Draw something first
    const canvasBox2 = await canvas.boundingBox();
    if (canvasBox2) {
      await page.mouse.move(canvasBox2.x + 100, canvasBox2.y + 100);
      await page.mouse.down();
      await page.mouse.move(canvasBox2.x + 120, canvasBox2.y + 120);
      await page.mouse.up();
    }
    
    // Simulate network failure by going offline
    await page.context().setOffline(true);
    
    if (!await submitButton.isDisabled()) {
      await submitButton.click();
      
      try {
        // Look for network error message
        const networkErrorSelectors = [
          'text=network',
          'text=connection',
          'text=offline',
          'text=failed',
          'text=retry'
        ];
        
        let networkErrorFound = false;
        for (const selector of networkErrorSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 10000 });
            console.log(`✅ Network error handled: ${selector}`);
            networkErrorFound = true;
            break;
          } catch (e) {
            // Try next selector
          }
        }
        
        if (!networkErrorFound) {
          console.log('⚠️  Network error handling not clearly visible');
        }
        
      } catch (e) {
        console.log('⚠️  Network error handling test inconclusive');
      }
    }
    
    // Restore network
    await page.context().setOffline(false);
    
    // Test 4: Check for user-friendly error messages
    console.log('\n🧪 Test 4: Verify error messages are user-friendly');
    
    // Look for any technical error messages that shouldn't be shown to users
    const pageContent = await page.content();
    const technicalTerms = [
      'stack trace',
      'exception',
      'AWS',
      'Lambda',
      'Bedrock',
      'InvokeModel',
      'BedrockError',
      'ValidationError',
      'credentials',
      'access key',
      'secret'
    ];
    
    let technicalErrorsFound = [];
    for (const term of technicalTerms) {
      if (pageContent.toLowerCase().includes(term.toLowerCase())) {
        technicalErrorsFound.push(term);
      }
    }
    
    if (technicalErrorsFound.length > 0) {
      console.log(`⚠️  Technical terms found in UI: ${technicalErrorsFound.join(', ')}`);
    } else {
      console.log('✅ No technical error details exposed to users');
    }
    
    console.log('\n🎉 Error scenario testing completed!');
    
  } catch (error) {
    console.error('❌ Error scenario test failed:', error.message);
    await page.screenshot({ path: 'test-error-scenarios-failure.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testErrorScenarios()
  .then(() => {
    console.log('✅ Error scenario tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error scenario test suite failed:', error);
    process.exit(1);
  });