# Pokémon Drawing Game

A web application where you draw a Pokémon and AI tries to guess what you drew!

## Overview

This interactive game combines HTML5 canvas drawing with AWS AI services to create a fun guessing game. Draw your favorite Pokémon, submit it, and see if Claude 3 Haiku can identify what you drew with a confidence score and explanation.

## Features

- 🎨 Interactive HTML5 canvas with drawing tools
- 🤖 AI-powered Pokémon recognition using AWS Bedrock
- 📊 Confidence scores and explanations for each guess
- 🚀 Serverless architecture with AWS Lambda
- 💰 Cost-optimized using AWS free tier services

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Vite, HTML5 Canvas
- **Backend**: AWS Lambda (Node.js), AWS Bedrock Agents
- **AI Model**: Claude 3 Haiku (vision capabilities)
- **Infrastructure**: AWS SAM, CloudFront, S3
- **Testing**: Vitest (unit tests), fast-check (property-based tests)

## Setup Instructions

### Prerequisites

- Node.js 20+ and npm
- AWS Account with Bedrock access
- AWS CLI configured
- AWS SAM CLI installed

### Installation

1. Clone the repository:
```bash
git clone https://github.com/WayneGreeley/pokemon-drawing-game.git
cd pokemon-drawing-game
```

2. Install dependencies:
```bash
npm install
```

3. Configure AWS credentials (do NOT commit these):
```bash
# Set up AWS CLI with your credentials
aws configure
```

4. Deploy backend infrastructure:
```bash
cd lambda
sam build
sam deploy --guided
```

5. Set up S3 bucket policy for CloudFront (required after first deployment):
```bash
./setup-bucket-policy.sh
```

6. Create `.env` file with deployment URLs (from SAM output):
```
VITE_LAMBDA_URL=https://your-lambda-url.lambda-url.region.on.aws/
CLOUDFRONT_URL=https://your-distribution.cloudfront.net
S3_BUCKET_NAME=your-bucket-name
```

7. Build and deploy frontend:
```bash
./deploy-frontend.sh
```

8. Run development server locally:
```bash
npm run dev
```

## Deployment

### Production Deployment

The application is deployed at: **https://***REMOVED***.cloudfront.net**

### Deployment Process

1. **Backend (Lambda + Bedrock)**:
   ```bash
   cd lambda
   sam build
   sam deploy
   ```

2. **S3 Bucket Policy** (one-time setup):
   ```bash
   ./setup-bucket-policy.sh
   ```

3. **Frontend (CloudFront + S3)**:
   ```bash
   ./deploy-frontend.sh
   ```

The deployment scripts handle:
- Building the production frontend bundle
- Uploading files to S3
- Invalidating CloudFront cache
- Ensuring proper CORS configuration

## AWS Configuration

This project uses the following AWS services:

- **Lambda Function URL**: Receives drawing images and orchestrates AI recognition
- **Bedrock Agents**: Powered by Claude 3 Haiku for image analysis
- **CloudFront + S3**: Hosts the static frontend with HTTPS
- **CloudWatch**: Monitors usage and costs with alarms

All infrastructure is defined in `lambda/template.yaml` using AWS SAM.

### CloudWatch Monitoring

The application includes comprehensive monitoring and cost protection through CloudWatch alarms:

#### Configured Alarms

1. **High Invocation Volume Alarm**
   - **Threshold**: 100 Lambda invocations per day
   - **Purpose**: Detect unusual traffic patterns
   - **Action**: Sends SNS notification to admin email

2. **Bedrock Cost Protection Alarm**
   - **Threshold**: 233 invocations per week (~1000 per month)
   - **Purpose**: Prevent unexpected AI service costs
   - **Action**: Sends SNS notification to admin email

3. **Lambda Error Rate Alarm**
   - **Threshold**: 5 errors within 15 minutes (3 evaluation periods of 5 minutes)
   - **Purpose**: Detect application issues quickly
   - **Action**: Sends SNS notification to admin email

#### Viewing Alarms

To check alarm status:
```bash
aws cloudwatch describe-alarms --alarm-name-prefix "pokemon-drawing-game"
```

#### SNS Notifications

- Alarm notifications are sent to the email address specified during SAM deployment
- **Important**: Check your email for the SNS subscription confirmation after first deployment
- Click the confirmation link to start receiving alarm notifications

#### Cost Controls

Additional cost protection measures:
- **Rate limiting**: 10 uploads per hour per user (client-side)
- **Image size limit**: Maximum 1MB per upload
- **Efficient AI model**: Claude 3 Haiku (cost-optimized)
- **Serverless architecture**: Pay only for actual usage

## Development with Kiro

This project was developed using Kiro's spec-driven development workflow. The complete specification including requirements, design, and implementation tasks can be found in `.kiro/specs/pokemon-drawing-game/`.

### Spec Files

- `requirements.md` - User stories and acceptance criteria
- `design.md` - Architecture, components, and correctness properties
- `tasks.md` - Implementation plan with checkboxes

## Testing

Run unit tests:
```bash
npm test
```

Run property-based tests:
```bash
npm test -- --grep "Property"
```

## License

MIT License - see LICENSE file for details

## Development Notes

This project uses the `.kiro/` directory for development specifications and must remain in the repository for development workflow tracking.