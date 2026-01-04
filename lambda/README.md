# AWS SAM Infrastructure

This directory contains the AWS SAM (Serverless Application Model) template and configuration for the Pokémon Drawing Game backend infrastructure.

## Architecture

The SAM template creates:

- **Lambda Function** with Function URL for image processing
- **Bedrock Agent** powered by Claude 3 Haiku for Pokémon identification
- **S3 Bucket** for frontend hosting
- **CloudFront Distribution** for global CDN
- **CloudWatch Alarms** for monitoring and cost protection
- **SNS Topic** for alert notifications

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS SAM CLI installed
3. Access to AWS Bedrock in your chosen region

## Deployment

1. **Build the application:**
   ```bash
   sam build
   ```

2. **Deploy with guided setup (first time):**
   ```bash
   sam deploy --guided
   ```
   
   You'll be prompted for:
   - Stack name (default: pokemon-drawing-game)
   - AWS Region (default: us-east-1)
   - Admin email for notifications
   - Bedrock region (must support Claude 3 Haiku)

3. **Subsequent deployments:**
   ```bash
   sam deploy
   ```

## Configuration

### Parameters

- `AdminEmail`: Email address for CloudWatch alarm notifications
- `BedrockRegion`: AWS region where Bedrock is available (us-east-1, us-west-2, etc.)

### Outputs

After deployment, the stack outputs:

- `LambdaFunctionUrl`: The Function URL for the API
- `CloudFrontUrl`: The CloudFront distribution URL for the frontend
- `S3BucketName`: S3 bucket name for uploading frontend files
- `BedrockAgentId`: The created Bedrock Agent ID
- `BedrockAgentAliasId`: The Bedrock Agent Alias ID

## Cost Optimization

The template is designed for AWS Free Tier usage:

- Lambda: 512MB memory, 30s timeout
- CloudFront: Free tier includes 1M requests/month
- S3: Free tier includes 5GB storage
- Bedrock: Pay-per-use (~$0.00025 per image)

## Monitoring

CloudWatch alarms monitor:

1. **High Invocation Volume**: >1500 Lambda invocations/day
2. **Cost Protection**: >2000 Bedrock invocations/month
3. **Error Rate**: >10% Lambda error rate

All alarms send notifications to the configured admin email.

## Security

- Lambda Function URL uses CORS for browser access
- S3 bucket uses CloudFront Origin Access Control
- IAM roles follow least privilege principle
- All traffic uses HTTPS

## Local Development

To test locally:

```bash
sam local start-api
```

Note: Local testing requires AWS credentials and Bedrock access.