# Implementation Plan

- [x] 1. Initialize GitHub repository and project structure
  - [x] 1.1 Create GitHub repository (public)
    - Create new public repository on GitHub
    - Name: pokemon-drawing-game
    - Add MIT License (OSI approved)
    - Do NOT initialize with README (we'll create it)
    - _Requirements: Contest submission_

  - [x] 1.2 Create .gitignore file
    - Add node_modules/
    - Add dist/
    - Add .env and .env.local (for AWS credentials)
    - Add *.log files
    - Add .DS_Store (macOS)
    - Add coverage/ (test coverage)
    - **IMPORTANT: Do NOT add .kiro/ to .gitignore (required for contest)**
    - _Requirements: Security, Contest submission_

  - [x] 1.3 Create README.md
    - Add project description
    - Add setup instructions
    - Add AWS configuration notes (without credentials)
    - Add license information
    - Document Kiro spec usage
    - _Requirements: Contest submission_

  - [x] 1.4 Initial commit and push
    - Initialize git repository
    - Add .kiro/specs directory
    - Add .gitignore
    - Add README.md
    - Add LICENSE file (MIT)
    - Commit with message: "Initial commit: Project specs and documentation"
    - Push to GitHub
    - _Requirements: Contest submission_

- [x] 2. Set up project structure and dependencies
  - Create new project directory for the Pokémon Drawing Game
  - Initialize package.json with Vite, TypeScript, and Vue 3
  - Install AWS SDK v3 packages (not needed for frontend with Lambda Function URL)
  - Install fast-check for property-based testing
  - Install Vitest for unit testing
  - Configure TypeScript with strict mode
  - Set up Vite configuration for development and production builds
  - Install AWS SAM CLI (brew install aws-sam-cli on macOS)
  - Create .env.example file with placeholder configuration (Lambda URL)
  - Commit and push: "Setup project dependencies and configuration"
  - _Requirements: All_

- [x] 3. Implement drawing canvas component
  - [x] 3.1 Create DrawingCanvas Vue component with HTML5 canvas element
    - Implement canvas initialization with proper dimensions
    - Set up canvas context (2d) with appropriate settings
    - Add canvas element to component template
    - _Requirements: 1.1_

  - [x] 3.2 Implement drawing tool functionality
    - Add brush tool with configurable size and color
    - Add eraser tool functionality
    - Implement mouse event handlers (mousedown, mousemove, mouseup)
    - Implement touch event handlers for mobile support
    - Track drawing state (isDrawing flag)
    - _Requirements: 1.2, 1.4_

  - [ ]* 3.3 Write property test for drawing tools
    - **Property 1: Tool selection enables drawing**
    - **Validates: Requirements 1.2**

  - [x] 3.4 Implement canvas controls UI
    - Add color picker component
    - Add brush size slider
    - Add clear button
    - Add submit button
    - Style controls with clean, accessible UI
    - _Requirements: 1.4, 1.5, 5.1_

  - [x] 3.5 Implement clear functionality
    - Clear canvas content when clear button clicked
    - Reset tool settings to defaults
    - _Requirements: 5.2, 5.3_

  - [ ]* 3.6 Write property tests for canvas operations
    - **Property 8: Clear button empties canvas**
    - **Property 9: Clear resets tool settings**
    - **Validates: Requirements 5.2, 5.3**

  - [x] 3.7 Implement canvas to image export
    - Add exportImage method to convert canvas to Blob
    - Support PNG format
    - Validate image size (max 1MB)
    - _Requirements: 2.1_

  - [ ]* 3.8 Write property test for image export
    - **Property 2: Canvas to image conversion produces valid format**
    - **Validates: Requirements 2.1**

  - [x] 3.9 Implement Halloween/spooky theme
    - Create dark color scheme CSS with purples (#6B46C1, #9333EA), blacks (#0F0F0F, #1A1A1A), eerie greens (#10B981, #34D399)
    - Add Ghost-type Pokémon images (Gengar, Spectrier, Giratina) to page header
    - Implement CSS fog/mist animation effect outside canvas area
    - Style buttons with Halloween theme (glowing effects, spooky borders)
    - Ensure text remains readable on dark background
    - Add subtle purple glow effects to canvas border
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 3.10 Commit and push canvas component
    - Commit with message: "Implement drawing canvas with Halloween theme"
    - Push to GitHub
    - _Requirements: Contest submission_

- [x] 4. Implement rate limiting system
  - [x] 4.1 Create RateLimiter class
    - Implement session-based upload tracking using localStorage
    - Set maximum uploads per session (10)
    - Set session duration (1 hour)
    - Implement checkLimit, incrementCount, getRemainingCount methods
    - _Requirements: 7.3_

  - [x] 4.2 Add rate limit UI feedback
    - Display remaining uploads counter
    - Show rate limit message when limit reached
    - Disable submit button when limit reached
    - _Requirements: 7.4_

  - [ ]* 4.3 Write property tests for rate limiting
    - **Property 14: Rate limit enforced per session**
    - **Property 15: Upload count tracking is accurate**
    - **Validates: Requirements 7.3, 7.4**

  - [x] 4.4 Commit and push rate limiting
    - Commit with message: "Implement rate limiting system"
    - Push to GitHub
    - _Requirements: Contest submission_

- [x] 5. Implement upload service
  - [x] 5.1 Create UploadService class
    - Implement HTTP POST to Lambda Function URL
    - Implement upload progress tracking
    - Integrate with RateLimiter
    - Add canUpload and getRemainingUploads methods
    - Store Lambda Function URL in .env (not committed)
    - _Requirements: 2.2_

  - [x] 5.2 Implement Lambda Function URL communication
    - Use fetch API to POST image blob to Lambda
    - Set proper Content-Type headers
    - Use HTTPS for all communication
    - Add upload progress callbacks
    - Handle upload errors with retry logic
    - _Requirements: 2.2, 6.1_

  - [ ]* 5.3 Write property test for HTTPS usage
    - **Property 10: Lambda communication uses HTTPS**
    - **Validates: Requirements 6.1**

  - [x] 5.4 Add loading indicator during upload
    - Show spinner/progress bar during upload
    - Disable UI interactions while uploading
    - _Requirements: 2.3_

  - [ ]* 5.5 Write property test for loading indicator
    - **Property 4: Upload progress shows loading indicator**
    - **Validates: Requirements 2.3**

  - [x] 5.6 Implement upload error handling
    - Handle network errors with retry mechanism
    - Display user-friendly error messages
    - Provide retry button on failure
    - _Requirements: 2.4_

  - [ ]* 5.7 Write property test for error handling
    - **Property 5: Failed upload provides retry capability**
    - **Validates: Requirements 2.4**

  - [x] 5.8 Parse Lambda response
    - Parse JSON response from Lambda
    - Extract Pokémon name, confidence score, explanation
    - Handle malformed responses
    - _Requirements: 3.5, 4.1_

  - [x] 5.9 Commit and push upload service
    - Commit with message: "Implement upload service with Lambda Function URL"
    - Push to GitHub
    - _Requirements: Contest submission_

- [x] 6. Checkpoint - Ensure frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Commit and push: "Frontend checkpoint - all tests passing"

- [x] 7. Create AWS SAM infrastructure template
  - [x] 7.1 Create SAM template.yaml
    - Define Lambda function resource with Function URL
    - Configure runtime: nodejs20.x, memory: 512MB, timeout: 30s
    - Enable Function URL with CORS configuration
    - Define IAM role with Bedrock invoke permissions
    - Add CloudWatch Logs permissions
    - Define parameters for Bedrock Agent ID and Alias ID
    - _Requirements: All backend_

  - [x] 7.2 Create samconfig.toml
    - Configure deployment settings
    - Set default region
    - Set stack name: pokemon-drawing-game
    - Configure parameter overrides
    - _Requirements: All backend_

  - [x] 7.3 Remove Bedrock Agent from SAM template (Architecture Pivot)
    - Remove AWS::Bedrock::Agent resource (not needed for direct model invocation)
    - Remove AWS::Bedrock::AgentAlias resource (not needed)
    - Remove Bedrock Agent IAM role (not needed)
    - Update Lambda IAM role to use bedrock:InvokeModel permission instead of agent permissions
    - Remove Agent ID and Alias ID parameters and outputs
    - Update Lambda environment variables to remove agent configuration
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 7.4 Add CloudWatch alarms to SAM template
    - Define alarm for high Lambda invocation volume (>1500/day)
    - Define alarm for Bedrock InvokeModel cost protection (>2000/month)
    - Define alarm for Lambda error rate (>10%)
    - Create SNS topic for alarm notifications
    - Add email subscription parameter
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 7.5 Add CloudFront distribution to SAM template
    - Define S3 bucket for static website hosting
    - Define CloudFront distribution with S3 origin
    - Configure HTTPS only
    - Set caching policies
    - Output CloudFront domain URL
    - _Requirements: 8.1_

  - [x] 7.6 Commit SAM template
    - Commit with message: "Add AWS SAM infrastructure template"
    - Push to GitHub
    - _Requirements: Contest submission_

- [x] 8. Implement Lambda function (Architecture Pivot - InvokeModel API)
  - [x] 8.1 Update Lambda function dependencies
    - Replace @aws-sdk/client-bedrock-agent-runtime with @aws-sdk/client-bedrock-runtime
    - Update package.json with new dependency
    - Remove agent-related imports and code
    - _Requirements: 2.5, 3.1_

  - [x] 8.2 Implement request parsing and validation
    - Parse Lambda Function URL event
    - Decode base64 image data from request body
    - Validate Content-Type header
    - Validate image format (PNG/JPEG) and size (max 1MB)
    - Return 400 Bad Request for invalid inputs
    - _Requirements: 2.5_

  - [x] 8.3 Implement Bedrock InvokeModel API integration
    - Configure BedrockRuntimeClient instead of BedrockAgentRuntimeClient
    - Implement invokeModel with Amazon Nova Lite Vision model
    - Use model ID: amazon.nova-lite-v1:0
    - Format image data as base64 in message content
    - Set system prompt for Pokémon identification
    - Configure max_tokens: 1000, temperature: 0.7
    - Set 30-second timeout
    - _Requirements: 3.1, 3.2_

  - [x] 8.4 Parse and format model response
    - Extract JSON response from model output
    - Parse Pokémon name from response
    - Extract confidence score (validate 0-100 range)
    - Extract reasoning/explanation
    - Format response for client
    - Handle malformed JSON responses
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ]* 8.5 Write property test for model response
    - **Property 6: AI service returns complete recognition result**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**

  - [x] 8.6 Implement Lambda error handling (updated for InvokeModel)
    - Handle Bedrock InvokeModel timeout errors
    - Handle invalid image format errors
    - Handle model response parsing errors
    - Log errors securely without exposing credentials
    - Return appropriate HTTP status codes (400, 500, 503)
    - Add CORS headers to all responses
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 6.5_

  - [ ]* 8.7 Write property tests for error handling
    - **Property 12: Error logs exclude credentials**
    - **Property 13: Errors produce user-friendly messages**
    - **Validates: Requirements 6.5, 10.1, 10.2, 10.3, 10.4, 10.5**

  - [x] 8.8 Update and redeploy infrastructure with SAM
    - Update SAM template to remove Bedrock Agent resources
    - Update Lambda IAM permissions for InvokeModel API
    - Run `sam build` to package updated Lambda function
    - Run `sam deploy` to update existing stack
    - Verify Lambda Function URL still works
    - Copy Lambda Function URL from outputs (should be same)
    - Test with sample POST request
    - _Requirements: All backend_

  - [x] 8.9 Test Lambda Function URL with InvokeModel
    - Test with sample POST request using curl or Postman
    - Verify CORS headers in response
    - Verify Bedrock InvokeModel API works correctly
    - Check CloudWatch logs for successful execution
    - Verify JSON response format matches expected structure
    - _Requirements: All backend_

  - [x] 8.10 Commit and push updated Lambda function
    - Commit with message: "Architecture pivot: Replace Bedrock Agent with InvokeModel API"
    - Push to GitHub
    - _Requirements: Contest submission_

- [x] 9. Implement results display component
  - [x] 9.1 Create ResultsDisplay Vue component
    - Design results layout (drawing + guess side by side)
    - Add Pokémon name display
    - Add confidence score display with percentage
    - Add explanation text display
    - Add "Draw Another" button
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.4_

  - [ ]* 9.2 Write property test for results display
    - **Property 7: Results display shows all recognition data**
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [x] 9.3 Integrate results display with upload service
    - Display results immediately when Lambda response received
    - Handle loading state while waiting for response
    - Show error message if request fails
    - _Requirements: 3.5, 4.1_

  - [ ]* 9.4 Write property test for image submission
    - **Property 3: Image submission returns AI recognition result**
    - **Validates: Requirements 2.2, 2.5, 3.2, 3.3, 3.4, 3.5**

  - [x] 9.5 Commit and push results display
    - Commit with message: "Implement results display component"
    - Push to GitHub
    - _Requirements: Contest submission_

- [x] 10. Verify CloudWatch monitoring (already deployed via SAM)
  - [x] 10.1 Verify CloudWatch alarms in AWS Console
    - Check that alarms were created by SAM deployment
    - Verify alarm thresholds are correct
    - Confirm SNS topic subscription (check email for confirmation)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 10.2 Create CloudWatch dashboard (optional - not in SAM)
    - Manually create dashboard in AWS Console
    - Add widgets for Lambda invocations, error rate, duration
    - Add cost tracking metrics for Bedrock
    - _Requirements: 9.1, 9.3_

  - [x] 10.3 Commit and push monitoring documentation
    - Document CloudWatch alarms in README
    - Commit with message: "Document CloudWatch monitoring setup"
    - Push to GitHub
    - _Requirements: Contest submission_

- [x] 11. Deploy frontend to CloudFront (already created via SAM)
  - [x] 11.1 Build frontend for production
    - Run `npm run build` to create production bundle
    - Verify dist/ directory contains built files
    - _Requirements: 8.1_

  - [x] 11.2 Upload frontend to S3 bucket
    - Get S3 bucket name from SAM outputs
    - Run `aws s3 sync dist/ s3://bucket-name --delete`
    - Verify files uploaded successfully
    - _Requirements: 8.1_

  - [x] 11.3 Update Lambda CORS with CloudFront domain
    - Get CloudFront URL from SAM outputs
    - Update SAM template.yaml with CloudFront origin in CORS
    - Redeploy with `sam deploy`
    - Test cross-origin requests from CloudFront URL
    - _Requirements: 8.3, 8.4_

  - [ ]* 11.4 Write property test for CORS restrictions
    - **Property 16: CORS policy restricts unauthorized domains**
    - **Validates: Requirements 8.3, 8.4**

  - [x] 11.5 Invalidate CloudFront cache
    - Run `aws cloudfront create-invalidation` to clear cache
    - Verify new frontend version loads
    - _Requirements: 8.1_

  - [x] 11.6 Commit and push deployment scripts
    - Create deploy.sh script for frontend deployment
    - Document deployment process in README
    - Commit with message: "Add frontend deployment to CloudFront"
    - Push to GitHub
    - _Requirements: Contest submission_

- [ ] 12. Integration and end-to-end testing
  - [x] 12.1 Test complete drawing flow end-to-end
    - Start dev server and navigate to application
    - Draw test Pokémon on canvas using Playwright
    - Submit drawing and verify loading indicator appears
    - Verify Lambda Function URL receives request correctly
    - Verify Bedrock InvokeModel processes image and returns response
    - Verify results display shows Pokémon name, confidence score, and explanation
    - Check CloudWatch logs for successful execution
    - Test from CloudFront deployment URL (not just localhost)
    - _Requirements: All_
    - **Note**: Previous attempts revealed Lambda code issues that have been fixed. Need to verify deployment is complete and test again.

  - [x] 12.2 Test error scenarios
    - Test rate limit enforcement (make 11 uploads to trigger limit)
    - Test network failure handling (disconnect network during upload)
    - Test invalid image handling (submit non-image file)
    - Test timeout handling (if possible with large image)
    - Test Lambda error responses (400, 500, 503)
    - Verify error messages are user-friendly
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 12.3 Test security controls
    - Verify CORS headers are present in Lambda responses
    - Verify CORS allows CloudFront origin
    - Test CORS blocks requests from unauthorized origins (use curl with different Origin header)
    - Verify file size limits are enforced (try uploading >1MB image)
    - Check CloudWatch logs to verify credentials are not logged
    - Verify HTTPS is used for all Lambda communication
    - _Requirements: 6.2, 6.5, 8.3, 8.4_

  - [x] 12.4 Verify Bedrock InvokeModel is working correctly
    - Test InvokeModel API responds with structured JSON (pokemonName, confidenceScore, explanation)
    - Verify Claude 3.5 Haiku Vision model processes images correctly
    - Verify system prompt instructions are being followed
    - Check CloudWatch logs for Bedrock InvokeModel invocation details
    - Test with various drawing styles and Pokémon
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 12.5 Final commit and push
    - Commit with message: "Complete integration testing and final polish"
    - Push to GitHub
    - _Requirements: Contest submission_

  - [ ] 12.6 Update documentation for hackathon submission
    - Update README.md with clear project description and setup instructions
    - Update DEVLOG.md documenting development journey, decisions, and challenges
    - Document Kiro CLI usage and workflow in README
    - Add demo instructions and screenshots/videos if possible
    - Document the Bedrock InvokeModel learning experience and challenges faced
    - Ensure all hackathon submission requirements are met (100 points total):
      * Application Quality (40 points) - functional app
      * Kiro CLI Usage (20 points) - document specs, tasks, systematic development
      * Documentation (20 points) - README.md and DEVLOG.md quality
      * Innovation (15 points) - AI + drawing game concept
      * Presentation (5 points) - clear project presentation
    - _Requirements: Contest submission, Hackathon qualification_

- [ ] 13. Write unit tests for frontend components
  - [ ] 13.1 Write unit tests for RateLimiter service
    - Test checkLimit() with various session states (new session, active session, expired session)
    - Test incrementCount() updates localStorage correctly
    - Test getRemainingCount() returns correct values (10 initially, decrements properly)
    - Test session expiration logic (1 hour timeout)
    - Test reset() clears session data from localStorage
    - Test getCurrentCount() returns accurate upload count
    - Test getTimeRemaining() and getTimeRemainingFormatted()
    - _Requirements: 7.3, 7.4_

  - [ ] 13.2 Write unit tests for UploadService
    - Test analyzeImage() with valid image blob
    - Test image size validation (max 1MB) - should throw error for oversized images
    - Test image type validation - should throw error for non-image files
    - Test blobToBase64() conversion works correctly
    - Test isValidRecognitionResult() validates response structure
    - Test analyzeImageWithRetry() implements exponential backoff
    - Test error handling for various failure scenarios (network error, 400, 500, 503)
    - Test cancelUpload() aborts in-progress requests
    - Test rate limit integration (should throw error when limit reached)
    - _Requirements: 2.1, 2.2, 2.4, 6.1_

  - [ ] 13.3 Write unit tests for DrawingCanvas component
    - Test canvas initialization (context setup, white background)
    - Test setTool() changes drawing tool (brush vs eraser)
    - Test setBrushSize() updates brush size and context lineWidth
    - Test setColor() updates brush color and context strokeStyle
    - Test clear() empties canvas and fills with white
    - Test exportImage() returns valid PNG blob
    - Test mouse event handlers (startDrawing, draw, stopDrawing)
    - Test touch event handlers for mobile support
    - _Requirements: 1.1, 1.2, 1.4, 5.2, 5.3_

  - [ ] 13.4 Write unit tests for ResultsDisplay component
    - Test component renders with valid recognition result
    - Test confidence score display and color coding (high/medium/low)
    - Test explanation text rendering
    - Test "Draw Another" button emits correct event
    - Test close button functionality
    - Test overlay click closes dialog
    - Test drawing image display
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 13.5 Run all unit tests and verify they pass
    - Execute `npm run test:run` to run all tests
    - Fix any failing tests
    - Ensure test coverage is reasonable (aim for >80% on services)
    - Commit with message: "Add comprehensive unit tests for frontend"
    - Push to GitHub
    - _Requirements: All_

- [ ] 14. Write unit tests for Lambda backend
  - [ ] 14.1 Set up Lambda testing environment
    - Install testing dependencies (vitest or jest for Node.js)
    - Configure test environment for Lambda handler
    - Set up mocks for AWS SDK (BedrockAgentRuntimeClient)
    - _Requirements: All backend_

  - [ ] 14.2 Write unit tests for Lambda handler
    - Test handler with valid POST request and image data
    - Test handler rejects non-POST requests (405 Method Not Allowed)
    - Test handler handles OPTIONS requests (CORS preflight)
    - Test parseRequestBody() with valid and invalid JSON
    - Test parseRequestBody() with base64 encoded body
    - _Requirements: 2.5, 6.1_

  - [ ] 14.3 Write unit tests for image validation
    - Test validateImageData() with valid base64 image
    - Test validateImageData() rejects empty string
    - Test validateImageData() rejects non-string input
    - Test validateImageData() rejects images >1MB
    - Test validateImageData() rejects images <100 bytes
    - _Requirements: 2.1_

  - [ ] 14.4 Write unit tests for Bedrock InvokeModel integration
    - Test invokeBedrockModel() with valid image buffer
    - Test invokeBedrockModel() throws error when model ID missing
    - Test invokeBedrockModel() handles Bedrock API errors
    - Test parseModelResponse() with valid JSON response
    - Test parseModelResponse() validates pokemonName field
    - Test parseModelResponse() validates confidenceScore range (0-100)
    - Test parseModelResponse() validates explanation field
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 14.5 Write unit tests for error handling
    - Test ValidationError returns 400 status code
    - Test BedrockError returns 503 status code
    - Test generic errors return 500 status code
    - Test createCorsResponse() includes proper CORS headers
    - Test error responses don't expose credentials
    - _Requirements: 6.5, 10.1, 10.2, 10.3, 10.4_

  - [ ] 14.6 Run all Lambda tests and verify they pass
    - Execute test command to run all Lambda tests
    - Fix any failing tests
    - Ensure test coverage is reasonable (aim for >80%)
    - Commit with message: "Add comprehensive unit tests for Lambda backend"
    - Push to GitHub
    - _Requirements: All backend_

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Run all frontend tests: `npm run test:run`
  - Run all Lambda tests (if implemented)
  - Verify no test failures
  - Verify application works end-to-end
  - Final push to GitHub
  - Verify repository is public and contains .kiro directory
  - _Requirements: All_
