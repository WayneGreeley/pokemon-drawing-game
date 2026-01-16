#!/bin/bash

# Frontend deployment script for Pokémon Drawing Game
# This script builds and deploys the frontend to S3 and CloudFront

set -e

echo "🎨 Building frontend..."
npm run build

echo "📦 Uploading to S3..."
aws s3 sync dist/ s3://pokemon-drawing-game-***REMOVED***-us-east-1 --delete

echo "🔄 Creating CloudFront invalidation..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id ***REMOVED*** \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "✅ Deployment complete!"
echo "Invalidation ID: $INVALIDATION_ID"
echo "CloudFront URL: https://***REMOVED***.cloudfront.net"
echo ""
echo "Note: CloudFront invalidation may take a few minutes to complete."
