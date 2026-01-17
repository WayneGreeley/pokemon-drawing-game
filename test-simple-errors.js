import { chromium } from 'playwright';

async function testSimpleErrors() {
  console.log('🚀 Starting simple error testing...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to CloudFront URL
    console.log('📱 Navigating to CloudFront URL...');
    const cloudFrontUrl = process.env.CLOUDFRONT_URL || 'https://your-distribution.cloudfront.net';
    await page.goto(cloudFrontUrl);
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded successfully');
    
    // Test 1: Check rate limit display
    console.log('\n🧪 Test 1: Check rate limit display');
    
    const rateLimitDisplay = page.locator('text=/remaining|uploads|limit/i');
    if (await rateLimitDisplay.isVisible()) {
      const rateLimitText = await rateLimitDisplay.textContent();
      console.log(`✅ Rate limit display found: ${rateLimitText}`);
    } else {
      console.log('⚠️  Rate limit display not visible');
    }
    
    // Test 2: Test empty canvas submission
    console.log('\n🧪 Test 2: Test empty canvas submission');
    
    const submitButton = await page.locator('button:has-text("Submit Drawing")').first();
    
    // Try to submit without drawing anything
    if (await submitButton.isVisible() && !await submitButton.isDisabled()) {
      console.log('📤 Attempting to submit empty canvas...');
      await submitButton.click();
      
      // Wait a moment to see what happens
      await page.waitForTimeout(3000);
      
      // Check for any error messages or validation
      const errorMessages = await page.locator('text=/error|invalid|empty|required/i').all();
      if (errorMessages.length > 0) {
        for (const msg of errorMessages) {
          if (await msg.isVisible()) {
            const text = await msg.textContent();
            console.log(`✅ Error message found: ${text}`);
          }
        }
      } else {
        console.log('ℹ️  No explicit error message for empty canvas (may be handled differently)');
      }
    } else {
      console.log('ℹ️  Submit button is disabled or not visible');
    }
    
    // Test 3: Draw something and test successful submission
    console.log('\n🧪 Test 3: Test successful submission with drawing');
    
    const canvas = await page.locator('canvas').first();
    const canvasBox = await canvas.boundingBox();
    
    if (canvasBox) {
      // Draw a simple shape
      console.log('🎨 Drawing a simple shape...');
      await page.mouse.move(canvasBox.x + 100, canvasBox.y + 100);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 150, canvasBox.y + 150);
      await page.mouse.up();
      
      // Submit the drawing
      if (await submitButton.isVisible() && !await submitButton.isDisabled()) {
        console.log('📤 Submitting drawing...');
        await submitButton.click();
        
        // Wait for loading indicator
        try {
          await page.waitForSelector('.loading, .spinner, text=loading', { timeout: 3000 });
          console.log('✅ Loading indicator appeared');
        } catch (e) {
          console.log('ℹ️  Loading indicator not detected (may be too fast)');
        }
        
        // Wait for results or error
        try {
          await Promise.race([
            page.waitForSelector('text=Pokémon', { timeout: 20000 }),
            page.waitForSelector('text=error', { timeout: 20000 }),
            page.waitForSelector('.error', { timeout: 20000 })
          ]);
          console.log('✅ Response received (success or error)');
        } catch (e) {
          console.log('⚠️  No response received within timeout');
        }
      }
    }
    
    // Test 4: Check for technical details in error messages
    console.log('\n🧪 Test 4: Check for exposed technical details');
    
    const pageContent = await page.content();
    const sensitiveTerms = [
      'aws-sdk',
      'bedrock',
      'lambda',
      'invokemodel',
      'access key',
      'secret',
      'arn:aws',
      'stack trace',
      'exception'
    ];
    
    let exposedTerms = [];
    for (const term of sensitiveTerms) {
      if (pageContent.toLowerCase().includes(term.toLowerCase())) {
        exposedTerms.push(term);
      }
    }
    
    if (exposedTerms.length > 0) {
      console.log(`⚠️  Potentially sensitive terms found: ${exposedTerms.join(', ')}`);
    } else {
      console.log('✅ No sensitive technical details exposed');
    }
    
    console.log('\n🎉 Simple error testing completed!');
    
  } catch (error) {
    console.error('❌ Simple error test failed:', error.message);
    await page.screenshot({ path: 'test-simple-errors-failure.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testSimpleErrors()
  .then(() => {
    console.log('✅ Simple error tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Simple error test suite failed:', error);
    process.exit(1);
  });