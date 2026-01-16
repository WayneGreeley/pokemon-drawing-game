#!/bin/bash

# Frontend deployment script for Pokémon Drawing Game
# This script builds and deploys the frontend to S3 and CloudFront

set -e

# Load environment variables from .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Validate required environment variables
if [ -z "$S3_BUCKET_NAME" ] || [ -z "$CLOUDFRONT_URL" ]; then
  echo "Error: S3_BUCKET_NAME and CLOUDFRONT_URL must be set in .env"
  exit 1
fi

# Extract CloudFront distribution ID from URL
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?DomainName=='${CLOUDFRONT_URL#https://}'].Id" \
  --output text)

if [ -z "$DISTRIBUTION_ID" ]; then
  echo "Error: Could not find CloudFront distribution for $CLOUDFRONT_URL"
  exit 1
fi

echo "🎨 Building frontend..."
npm run build

echo "📦 Uploading to S3..."
aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete

echo "🔄 Creating CloudFront invalidation..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "✅ Deployment complete!"
echo "Invalidation ID: $INVALIDATION_ID"
echo "CloudFront URL: $CLOUDFRONT_URL"
echo ""
echo "Note: CloudFront invalidation may take a few minutes to complete."
