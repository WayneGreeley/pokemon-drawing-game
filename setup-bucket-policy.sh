#!/bin/bash

# Setup S3 bucket policy for CloudFront access
# This script creates the bucket policy that allows CloudFront OAC to access S3

set -e

BUCKET_NAME="pokemon-drawing-game-***REMOVED***-us-east-1"
DISTRIBUTION_ID="***REMOVED***"
ACCOUNT_ID="***REMOVED***"

echo "🔐 Creating S3 bucket policy for CloudFront access..."

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
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*",
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
aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json

echo "✅ Bucket policy applied successfully!"
echo ""
echo "Verifying policy..."
aws s3api get-bucket-policy --bucket "$BUCKET_NAME" --query Policy --output text

rm /tmp/bucket-policy.json
