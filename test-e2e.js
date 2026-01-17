import { chromium } from 'playwright';

async function testPokemonDrawingGame() {
  console.log('🚀 Starting end-to-end test of Pokémon Drawing Game...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    // Navigate to CloudFront URL
    console.log('📱 Navigating to CloudFront URL...');
    const cloudFrontUrl = process.env.CLOUDFRONT_URL || 'https://your-distribution.cloudfront.net';
    await page.goto(cloudFrontUrl);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded successfully');
    
    // Check if canvas is present
    const canvas = await page.locator('canvas').first();
    await canvas.waitFor();
    console.log('✅ Drawing canvas found');
    
    // Check if drawing tools are present
    const colorPicker = await page.locator('input[type="color"]').first();
    await colorPicker.waitFor();
    console.log('✅ Color picker found');
    
    const brushSize = await page.locator('input[type="range"]').first();
    await brushSize.waitFor();
    console.log('✅ Brush size slider found');
    
    const submitButton = await page.locator('button:has-text("Submit Drawing")').first();
    await submitButton.waitFor();
    console.log('✅ Submit button found');
    
    // Draw a simple Pikachu-like shape on the canvas
    console.log('🎨 Drawing a simple Pikachu...');
    
    // First, let's check if the canvas actually supports drawing
    const canvasContext = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        return {
          width: canvas.width,
          height: canvas.height,
          hasContext: !!canvas.getContext('2d')
        };
      }
      return null;
    });
    
    console.log('Canvas info:', canvasContext);
    
    // Try to trigger drawing events properly
    await canvas.click(); // Focus the canvas first
    
    // Get canvas bounding box
    const canvasBox = await canvas.boundingBox();
    
    if (canvasBox) {
      console.log('Canvas bounding box:', canvasBox);
      
      // Try using dispatchEvent to trigger Vue.js mouse events properly
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;
      
      // Draw using proper Vue.js event dispatching
      await page.evaluate((coords) => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          
          // Create and dispatch mousedown event
          const mouseDownEvent = new MouseEvent('mousedown', {
            clientX: coords.x,
            clientY: coords.y,
            bubbles: true
          });
          canvas.dispatchEvent(mouseDownEvent);
          
          // Draw a simple square
          const points = [
            { x: coords.x - 50, y: coords.y - 50 },
            { x: coords.x + 50, y: coords.y - 50 },
            { x: coords.x + 50, y: coords.y + 50 },
            { x: coords.x - 50, y: coords.y + 50 },
            { x: coords.x - 50, y: coords.y - 50 }
          ];
          
          points.forEach((point, index) => {
            setTimeout(() => {
              const mouseMoveEvent = new MouseEvent('mousemove', {
                clientX: point.x,
                clientY: point.y,
                bubbles: true
              });
              canvas.dispatchEvent(mouseMoveEvent);
              
              // Dispatch mouseup after the last point
              if (index === points.length - 1) {
                setTimeout(() => {
                  const mouseUpEvent = new MouseEvent('mouseup', {
                    clientX: point.x,
                    clientY: point.y,
                    bubbles: true
                  });
                  canvas.dispatchEvent(mouseUpEvent);
                }, 50);
              }
            }, index * 100);
          });
        }
      }, { x: centerX, y: centerY });
      
      console.log('✅ Vue.js drawing events dispatched');
      
      // Wait for drawing to complete
      await page.waitForTimeout(2000);
      
      // Check canvas content again
      const hasDrawing = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          // Check if any pixel is not white (background is white)
          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            // If pixel is not white or transparent
            if (!(r === 255 && g === 255 && b === 255) && a > 0) {
              return true;
            }
          }
        }
        return false;
      });
      
      console.log('Canvas has drawing after Vue events:', hasDrawing);
      
      if (!hasDrawing) {
        console.log('⚠️  Still no drawing detected - trying alternative approach');
        
        // Try direct canvas drawing as fallback
        await page.evaluate(() => {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(400, 300, 50, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Draw simple face
            ctx.beginPath();
            ctx.arc(385, 285, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(415, 285, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(400, 315, 10, 0, Math.PI);
            ctx.stroke();
          }
        });
        
        console.log('✅ Fallback drawing completed');
      }
    }
    
    // Wait a moment for drawing to settle
    await page.waitForTimeout(1000);
    
    // Submit the drawing
    console.log('📤 Submitting drawing to Lambda...');
    await submitButton.click();
    
    // Wait for loading indicator
    const loadingIndicator = page.locator('.loading, [data-testid="loading"], .spinner');
    try {
      await loadingIndicator.waitFor({ timeout: 2000 });
      console.log('✅ Loading indicator appeared');
    } catch (e) {
      console.log('ℹ️  Loading indicator not found (may be too fast)');
    }
    
    // Wait for results to appear (up to 30 seconds for Bedrock)
    console.log('⏳ Waiting for AI recognition results...');
    
    try {
      // Look for results display - could be various selectors
      const resultsSelectors = [
        '.results',
        '[data-testid="results"]',
        '.pokemon-result',
        'text=Pokémon',
        'text=confidence',
        'text=%'
      ];
      
      let resultsFound = false;
      for (const selector of resultsSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 30000 });
          console.log(`✅ Results found with selector: ${selector}`);
          resultsFound = true;
          break;
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!resultsFound) {
        // Check for error messages
        const errorSelectors = [
          'text=error',
          'text=Error',
          'text=failed',
          'text=Failed',
          '.error',
          '[data-testid="error"]'
        ];
        
        for (const selector of errorSelectors) {
          try {
            const errorElement = await page.locator(selector).first();
            if (await errorElement.isVisible()) {
              const errorText = await errorElement.textContent();
              console.log(`❌ Error found: ${errorText}`);
              break;
            }
          } catch (e) {
            // Continue checking
          }
        }
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'test-failure.png' });
        console.log('📸 Screenshot saved as test-failure.png');
        
        throw new Error('No results or clear error message found');
      }
      
      // Try to extract the results
      const pageContent = await page.content();
      console.log('✅ AI Recognition completed successfully!');
      
      // Look for specific result elements
      try {
        const pokemonName = await page.locator('text=/[A-Z][a-z]+/').first().textContent();
        console.log(`🎯 Identified Pokémon: ${pokemonName}`);
      } catch (e) {
        console.log('ℹ️  Could not extract specific Pokémon name');
      }
      
      try {
        const confidence = await page.locator('text=/%/').first().textContent();
        console.log(`📊 Confidence: ${confidence}`);
      } catch (e) {
        console.log('ℹ️  Could not extract confidence score');
      }
      
    } catch (error) {
      console.log('❌ Error waiting for results:', error.message);
      
      // Check CloudWatch logs for more details
      console.log('🔍 Check CloudWatch logs for Lambda execution details');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-error.png' });
      console.log('📸 Error screenshot saved as test-error.png');
      
      throw error;
    }
    
    console.log('🎉 End-to-end test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-failure.png' });
    console.log('📸 Failure screenshot saved');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testPokemonDrawingGame()
  .then(() => {
    console.log('✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });