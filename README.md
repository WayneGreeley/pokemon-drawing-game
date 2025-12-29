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

4. Deploy infrastructure:
```bash
cd lambda
sam build
sam deploy --guided
```

5. Create `.env` file with Lambda Function URL (from SAM output):
```
VITE_LAMBDA_URL=https://your-lambda-url.lambda-url.region.on.aws/
```

6. Run development server:
```bash
npm run dev
```

## AWS Configuration

This project uses the following AWS services:

- **Lambda Function URL**: Receives drawing images and orchestrates AI recognition
- **Bedrock Agents**: Powered by Claude 3 Haiku for image analysis
- **CloudFront + S3**: Hosts the static frontend with HTTPS
- **CloudWatch**: Monitors usage and costs with alarms

All infrastructure is defined in `lambda/template.yaml` using AWS SAM.

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