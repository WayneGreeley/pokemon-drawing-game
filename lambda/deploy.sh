#!/bin/bash

# Deployment script for Pokémon Drawing Game Lambda function
set -e

echo "🚀 Starting deployment of Pokémon Drawing Game..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "❌ SAM CLI is not installed. Please install it first."
    echo "   macOS: brew install aws-sam-cli"
    echo "   Other: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    exit 1
fi

# Navigate to lambda directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing Lambda dependencies..."
cd src
npm install --production
cd ..

# Build the SAM application
echo "🔨 Building SAM application..."
sam build

# Deploy the application
echo "🚀 Deploying to AWS..."
if [ ! -f samconfig.toml ]; then
    echo "📝 First deployment - running guided setup..."
    sam deploy --guided
else
    echo "📝 Deploying with existing configuration..."
    sam deploy
fi

# Get outputs
echo "📋 Deployment complete! Getting stack outputs..."
STACK_NAME=$(grep -A 10 '\[default.deploy\]' samconfig.toml | grep 'stack_name' | cut -d'"' -f2)

if [ -n "$STACK_NAME" ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📊 Stack Outputs:"
    aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query 'Stacks[0].Outputs' --output table
    
    # Extract Lambda Function URL
    LAMBDA_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query 'Stacks[0].Outputs[?OutputKey==`LambdaFunctionUrl`].OutputValue' --output text)
    CLOUDFRONT_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' --output text)
    S3_BUCKET=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' --output text)
    
    echo ""
    echo "🔗 Important URLs:"
    echo "   Lambda Function URL: $LAMBDA_URL"
    echo "   CloudFront URL: $CLOUDFRONT_URL"
    echo "   S3 Bucket: $S3_BUCKET"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update your frontend .env file with:"
    echo "      VITE_LAMBDA_URL=$LAMBDA_URL"
    echo "   2. Build and deploy your frontend to S3"
    echo "   3. Test the application at: $CLOUDFRONT_URL"
    echo ""
else
    echo "⚠️  Could not determine stack name. Check samconfig.toml"
fi

echo "✅ Deployment script completed!"