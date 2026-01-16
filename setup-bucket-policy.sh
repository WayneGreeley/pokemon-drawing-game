#!/bin/bash

# Setup S3 bucket policy for CloudFront access
# This script creates the bucket policy that allows CloudFront OAC to access S3

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

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Extract CloudFront distribution ID from URL
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?DomainName=='${CLOUDFRONT_URL#https://}'].Id" \
  --output text)

if [ -z "$DISTRIBUTION_ID" ]; then
  echo "Error: Could not find CloudFront distribution for $CLOUDFRONT_URL"
  exit 1
fi

echo "🔐 Creating S3 bucket policy for CloudFront access..."
echo "Bucket: $S3_BUCKET_NAME"
echo "Distribution: $DISTRIBUTION_ID"

cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DISTRIBUTION_ID}"
        }
      }
    }
  ]
}
EOF

echo "📝 Applying bucket policy..."
aws s3api put-bucket-policy --bucket "$S3_BUCKET_NAME" --policy file:///tmp/bucket-policy.json

echo "✅ Bucket policy applied successfully!"
echo ""
echo "Verifying policy..."
aws s3api get-bucket-policy --bucket "$S3_BUCKET_NAME" --query Policy --output text

rm /tmp/bucket-policy.json
