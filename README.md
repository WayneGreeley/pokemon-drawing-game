# Pokémon Drawing Game

🎨 **An AI-powered drawing game where you sketch Pokémon and Amazon Nova Lite tries to guess what you drew!**

## Overview

This interactive web application combines HTML5 canvas drawing with AWS AI services to create an engaging guessing game. Users draw their favorite Pokémon on a digital canvas, and the application uses Amazon Nova Lite (via AWS Bedrock) to analyze the drawing and provide:

- **Pokémon identification** with confidence scoring
- **Detailed explanations** of the AI's reasoning
- **Real-time feedback** with beautiful UI animations
- **Rate limiting** to prevent abuse and control costs

Perfect for Pokémon fans, AI enthusiasts, and anyone interested in creative AI applications!

## Features

- 🎨 **Interactive Drawing Canvas**: HTML5 canvas with brush and eraser tools, color picker, and adjustable brush sizes
- 🤖 **AI-Powered Recognition**: Amazon Nova Lite analyzes drawings with confidence scores and detailed explanations
- 📊 **Smart Results Display**: Beautiful UI showing Pokémon name, confidence percentage, and AI reasoning
- 🚀 **Serverless Architecture**: AWS Lambda with Function URLs for scalable, cost-effective deployment
- 🛡️ **Security & Rate Limiting**: Client-side rate limiting (10 uploads/hour) with CORS protection
- 💰 **Cost-Optimized**: Uses AWS free tier services with CloudWatch alarms for cost protection
- 🎯 **Property-Based Testing**: Comprehensive test suite using fast-check for reliability
- 🌙 **Dark Theme**: Modern purple-themed UI with glow effects and smooth animations

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Vite, HTML5 Canvas
- **Backend**: AWS Lambda (Node.js), AWS Bedrock InvokeModel API
- **AI Model**: Amazon Nova Lite (multimodal vision model)
- **Infrastructure**: AWS SAM, CloudFront, S3, CloudWatch
- **Testing**: Vitest (unit tests), fast-check (property-based tests)
- **Development**: Kiro CLI for spec-driven development workflow

## Quick Start Demo

Want to try the application? Here's how to get started quickly:

### Option 1: Try the Live Demo
🎮 **[Try the Live Demo](https://d1mi77qn6jcpqo.cloudfront.net/)** - Draw a Pokémon and see AI recognition in action!

### Option 2: Local Development
```bash
# Clone and install
git clone https://github.com/WayneGreeley/pokemon-drawing-game.git
cd pokemon-drawing-game
npm install

# Start development server (frontend only)
npm run dev
```

**Note**: For full functionality including AI recognition, you'll need to deploy the AWS backend (see Setup Instructions below).

## How to Use

1. **Draw**: Use the brush tool to draw your favorite Pokémon on the canvas
2. **Customize**: Choose colors, adjust brush size, or use the eraser
3. **Submit**: Click "Submit Drawing" to send your artwork to the AI
4. **Results**: View the AI's guess with confidence score and explanation
5. **Repeat**: Click "Draw Another" to try again!

**Drawing Tips**:
- Keep drawings simple and recognizable
- Focus on distinctive features (ears, tail, body shape)
- Use clear, bold strokes
- Popular Pokémon tend to get better recognition

## Setup Instructions

### Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** and npm installed
- **AWS Account** with the following:
  - AWS CLI configured with appropriate credentials
  - Permissions for Lambda, S3, CloudFront, CloudWatch, and IAM
- **AWS SAM CLI** installed ([Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))

### Installation & Deployment

#### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/WayneGreeley/pokemon-drawing-game.git
cd pokemon-drawing-game

# Install frontend dependencies
npm install

# Install Lambda dependencies
cd lambda/src
npm install
cd ../..
```

#### Step 2: Configure AWS Credentials

```bash
# Configure AWS CLI (do NOT commit these credentials)
aws configure

# Verify your configuration
aws sts get-caller-identity
```

#### Step 3: Deploy Backend Infrastructure

```bash
cd lambda

# Build the SAM application
sam build

# Deploy with guided setup (first time only)
sam deploy --guided

# For subsequent deployments, use:
# sam deploy --no-confirm-changeset
```

**During guided setup, you'll be prompted for**:
- Stack name (e.g., `pokemon-drawing-game`)
- AWS region (e.g., `us-east-1`)
- Admin email for CloudWatch alarms
- Confirm changes and IAM role creation

#### Step 4: Configure S3 Bucket Policy

After first deployment, set up the S3 bucket policy for CloudFront:

```bash
# Return to project root
cd ..

# Run the bucket policy setup script
chmod +x setup-bucket-policy.sh
./setup-bucket-policy.sh
```

#### Step 5: Configure Environment Variables

Create a `.env` file in the project root with the deployment URLs from SAM output:

```bash
# Copy from SAM deployment output
VITE_LAMBDA_URL=https://your-lambda-url.lambda-url.region.on.aws/
```

**To find your Lambda URL**:
```bash
# Check SAM outputs
sam list stack-outputs --stack-name pokemon-drawing-game
```

#### Step 6: Deploy Frontend

```bash
# Build and deploy frontend to S3/CloudFront
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

#### Step 7: Verify Deployment

1. **Check CloudFront URL**: Find your distribution URL in AWS Console → CloudFront
2. **Test the application**: Visit the CloudFront URL and try drawing a Pokémon
3. **Monitor CloudWatch**: Check that alarms are configured properly

### Local Development

For local development with hot reload:

```bash
# Start development server
npm run dev

# Run tests
npm run test:run

# Run only property-based tests
npm run test:run -- --reporter=verbose src/**/*.pbt.test.ts
```

**Note**: Local development will show the drawing interface, but AI recognition requires the deployed AWS backend.

## Deployment

The application uses a serverless architecture deployed entirely on AWS. The deployment process handles:
- Building the production frontend bundle
- Uploading files to S3
- Invalidating CloudFront cache
- Ensuring proper CORS configuration

### Production Deployment Steps

1. **Backend (Lambda + Bedrock)**:
   ```bash
   cd lambda
   sam build
   sam deploy --no-confirm-changeset
   ```

2. **S3 Bucket Policy** (one-time setup):
   ```bash
   ./setup-bucket-policy.sh
   ```

3. **Frontend (CloudFront + S3)**:
   ```bash
   ./deploy-frontend.sh
   ```

## AWS Configuration & Architecture

This application uses a serverless architecture with the following AWS services:

### Core Services

- **AWS Lambda with Function URLs**: Handles image processing and AI requests
- **Amazon Bedrock (Nova Lite)**: Provides multimodal AI for Pokémon recognition
- **Amazon S3**: Stores static frontend assets
- **Amazon CloudFront**: CDN for global content delivery with HTTPS
- **Amazon CloudWatch**: Monitoring, logging, and cost protection alarms

### Architecture Diagram

```
User Browser → CloudFront → S3 (Static Assets)
     ↓
Lambda Function URL → Bedrock (Nova Lite) → AI Response
```

### Infrastructure as Code

All AWS resources are defined in `lambda/template.yaml` using AWS SAM (Serverless Application Model). This ensures:

- **Reproducible deployments** across environments
- **Version-controlled infrastructure** changes
- **Automatic IAM role creation** with least-privilege permissions
- **Built-in monitoring** and cost protection

### CloudWatch Monitoring & Cost Protection

The application includes comprehensive monitoring and cost protection through CloudWatch alarms:

#### Configured Alarms

1. **High Invocation Volume Alarm**
   - **Threshold**: 100 Lambda invocations per day
   - **Purpose**: Detect unusual traffic patterns or potential abuse
   - **Action**: Sends SNS notification to admin email

2. **Bedrock Cost Protection Alarm**
   - **Threshold**: 233 invocations per week (~1000 per month)
   - **Purpose**: Prevent unexpected AI service costs (stays within free tier)
   - **Action**: Sends SNS notification to admin email

3. **Lambda Error Rate Alarm**
   - **Threshold**: 5 errors within 15 minutes (3 evaluation periods of 5 minutes)
   - **Purpose**: Detect application issues quickly for rapid response
   - **Action**: Sends SNS notification to admin email

#### Managing Alarms

View alarm status:
```bash
aws cloudwatch describe-alarms --alarm-name-prefix "pokemon-drawing-game"
```

Test alarm notifications:
```bash
aws cloudwatch set-alarm-state --alarm-name "pokemon-drawing-game-high-invocations" --state-value ALARM --state-reason "Testing alarm notification"
```

#### SNS Notifications Setup

1. **Email Subscription**: During SAM deployment, provide your email address
2. **Confirmation**: Check your email for SNS subscription confirmation
3. **Activate**: Click the confirmation link to start receiving notifications
4. **Test**: Use the test command above to verify notifications work

#### Cost Controls

Multiple layers of cost protection:

- **Client-side rate limiting**: 10 uploads per hour per user (localStorage-based)
- **Image size limits**: Maximum 1MB per upload to control processing costs
- **Efficient AI model**: Amazon Nova Lite (cost-optimized multimodal model)
- **Serverless architecture**: Pay only for actual usage, no idle costs
- **CloudWatch alarms**: Proactive monitoring before costs escalate

**Estimated Monthly Costs** (within AWS free tier):
- Lambda: ~$0 (1M free requests/month)
- Bedrock Nova Lite: ~$0 (limited free tier usage)
- S3: ~$0 (5GB free storage)
- CloudFront: ~$0 (1TB free data transfer)
- CloudWatch: ~$0 (10 alarms free)

## Development with Kiro CLI

This project was developed using **Kiro's spec-driven development workflow**, demonstrating modern AI-assisted development practices. The complete development journey is documented in the `.kiro/specs/pokemon-drawing-game/` directory.

### Kiro Workflow Benefits

- **Requirements-First Approach**: Started with clear user stories and acceptance criteria
- **Design-Driven Development**: Comprehensive architecture and component design before coding
- **Property-Based Testing**: Formal correctness properties validated with fast-check
- **Iterative Refinement**: Continuous feedback loop between requirements, design, and implementation
- **Documentation Integration**: Living documentation that evolves with the codebase

### Spec Files Structure

```
.kiro/specs/pokemon-drawing-game/
├── requirements.md    # User stories and acceptance criteria
├── design.md         # Architecture, components, and correctness properties  
└── tasks.md          # Implementation plan with progress tracking
```

#### Key Spec Components

1. **Requirements** (`requirements.md`):
   - 8 user stories covering drawing, AI recognition, results display, and system reliability
   - 47 detailed acceptance criteria with measurable outcomes
   - Security and performance requirements

2. **Design** (`design.md`):
   - Component architecture with Vue 3 composition API
   - AWS serverless infrastructure design
   - 16 formal correctness properties for property-based testing
   - Error handling and user experience specifications

3. **Tasks** (`tasks.md`):
   - 13 major implementation tasks with 65+ subtasks
   - Progress tracking with checkboxes
   - Requirements traceability for each task
   - Property-based testing integration

### Kiro Development Process

The development followed this systematic approach:

1. **Requirements Gathering**: Defined user needs and system constraints
2. **Architecture Design**: Planned components, APIs, and infrastructure
3. **Property Definition**: Established formal correctness criteria
4. **Implementation**: Built features following the task plan
5. **Testing**: Validated with both unit tests and property-based tests
6. **Documentation**: Maintained living documentation throughout

### Using Kiro for Your Projects

To leverage Kiro's spec-driven approach:

```bash
# Install Kiro CLI (if available)
npm install -g kiro-cli

# Create a new spec
kiro spec create my-feature

# Follow the requirements → design → tasks workflow
kiro spec requirements
kiro spec design  
kiro spec tasks

# Execute tasks with progress tracking
kiro task run 1.1
```

**Benefits of Spec-Driven Development**:
- **Reduced Rework**: Clear requirements prevent scope creep
- **Better Testing**: Property-based tests catch edge cases
- **Team Alignment**: Shared understanding through documentation
- **Quality Assurance**: Formal verification of correctness properties

## Testing

The application includes comprehensive testing with both traditional unit tests and property-based tests.

### Running Tests

```bash
# Run all tests
npm run test:run

# Run with verbose output
npm run test:run -- --reporter=verbose

# Run only unit tests
npm run test:run -- src/**/*.test.ts

# Run only property-based tests
npm run test:run -- --reporter=verbose src/**/*.pbt.test.ts

# Run specific test file
npm run test:run -- src/components/DrawingCanvas.test.ts
```

### Test Coverage

- **Unit Tests**: 16 test files covering core functionality
- **Property-Based Tests**: 4 test files with 14 correctness properties
- **Total Tests**: 20+ passing tests across all components

### Property-Based Testing

This project uses [fast-check](https://fast-check.dev/) for property-based testing, validating correctness properties like:

- **Drawing Tools**: Tool selection enables drawing operations
- **Canvas Operations**: Clear button empties canvas, image export produces valid PNG
- **Upload Service**: Image submission returns AI results, progress tracking works
- **Security**: Error logs exclude credentials, CORS restrictions enforced
- **Results Display**: All recognition data displayed correctly

### Test Architecture

```
src/
├── components/
│   ├── DrawingCanvas.test.ts      # Unit tests
│   ├── DrawingCanvas.pbt.test.ts  # Property-based tests
│   └── ...
├── services/
│   ├── UploadService.test.ts      # Unit tests  
│   ├── UploadService.pbt.test.ts  # Property-based tests
│   └── ...
```

## Troubleshooting

### Common Issues

#### 1. Bedrock Model Availability
```
Error: AccessDeniedException: User is not authorized to perform: bedrock:InvokeModel
```
**Solution**: Ensure Amazon Nova Lite model is available in your AWS deployment region (us-east-1 recommended).

#### 2. CORS Errors
```
Error: CORS policy: No 'Access-Control-Allow-Origin' header
```
**Solution**: Ensure Lambda CORS is configured and S3 bucket policy is set up correctly.

#### 3. Lambda Function Not Found
```
Error: The resource you requested does not exist
```
**Solution**: Verify Lambda Function URL is correctly set in `.env` file.

#### 4. CloudFront Cache Issues
```
Old version of app still showing after deployment
```
**Solution**: Run `./deploy-frontend.sh` which includes cache invalidation.

### Debug Commands

```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify Bedrock model access
aws bedrock list-foundation-models --region us-east-1

# Check Lambda function
aws lambda get-function --function-name pokemon-drawing-game-function

# View CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/pokemon"
```

### Getting Help

1. **Check CloudWatch Logs**: AWS Console → CloudWatch → Log Groups
2. **Review SAM Outputs**: `sam list stack-outputs --stack-name pokemon-drawing-game`
3. **Validate Configuration**: Ensure all environment variables are set correctly
4. **Test Components**: Use browser developer tools to debug frontend issues

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- **AWS Bedrock Team** for Amazon Nova Lite model
- **Vue.js Community** for excellent framework and ecosystem
- **fast-check** for property-based testing capabilities
- **Kiro** for spec-driven development workflow

## Project Status

✅ **Production Ready**: Fully functional with comprehensive testing
🚀 **Deployed**: Available on AWS with monitoring and cost controls
📚 **Well Documented**: Complete specs and setup instructions
🧪 **Thoroughly Tested**: Unit tests and property-based tests passing

---

**Built with ❤️ using Kiro's spec-driven development workflow**