# AWS Deployment Guide (Free Tier)

Deploy your Next.js landing page to AWS using S3 + CloudFront (serverless, free tier friendly).

## Why AWS over Vercel?

- ✅ **Free tier friendly**: No analytics/speed insights limits
- ✅ **Cost control**: Pay only for what you use (S3 storage + CloudFront bandwidth)
- ✅ **No vendor lock-in**: Full control over infrastructure
- ✅ **Scales automatically**: CloudFront CDN, S3 storage
- ✅ **Lambda APIs**: Add backend functions easily (1M requests/month free)

**Free tier includes:**
- S3: 5GB storage, 20K GET requests, 2K PUT requests/month
- CloudFront: 1TB data transfer out, 10M HTTP/HTTPS requests/month
- **Lambda: 1M requests/month + 400K GB-seconds compute** (perfect for APIs!)
- API Gateway: 1M API calls/month free (first 12 months)

## Multi-Account Setup (Recommended)

**If your existing AWS account exceeds free tier**, create a new account:

### Why separate accounts?
- ✅ Each AWS account gets **its own free tier** (12 months + always-free services)
- ✅ Isolate billing and resources
- ✅ Best practice for separating personal/work/projects

### Setup steps:

1. **Create new AWS account**: https://aws.amazon.com/free/
   - Use different email (or alias: `yourname+aiready@gmail.com`)
   - You'll get fresh free tier limits

2. **Configure AWS CLI with new profile**:
   ```bash
   # Add profile for AIReady project
   aws configure --profile aiready
   
   # Enter new account credentials:
   # AWS Access Key ID: [from new account IAM]
   # AWS Secret Access Key: [from new account IAM]
   # Default region: us-east-1
   # Default output format: json
   ```

3. **Verify it works**:
   ```bash
   aws sts get-caller-identity --profile aiready
   # Should show new account ID
   ```

4. **Use with SST** (see deployment steps below)

## Option 1: SST Ion (Recommended)

**Best for:** Modern DX, infrastructure as code, automatic CloudFront setup.

### Setup

```bash
cd landing

# Install SST
npm install -g sst@ion

# If using separate AWS account, set profile:
export AWS_PROFILE=aiready  # matches your AWS CLI profile

# Initialize (already configured in sst.config.ts)
sst install

# Deploy to dev
sst deploy

# Deploy to production
sst deploy --stage production
```

### Configuration

The `sst.config.ts` is already set up. SST will:
- ✅ Build Next.js as static output
- ✅ Upload to S3 bucket (created automatically)
- ✅ Create CloudFront distribution
- ✅ Set up cache invalidation
- ✅ Handle custom domain (optional)
- ✅ Deploy Lambda functions for APIs (if configured)

### Adding API Routes

SST makes it trivial to add backend APIs with Lambda:

**Lambda: 1M requests free (covers most API usage)
- API Gateway: 1M calls free (first year)
- Data transfer: Free tier covers most small sites

**With APIs (under free tier):**
- 1M Lambda requests/month = covers ~30K users making 30 API calls each
- Each request: ~100ms execution = plenty of free compute time

**After free tier (year 2):**
- Static site: $0.10-0.50/month for typical traffic
- With APIs: +$0.20-1.00/month (depends on usage)
- **Total: $0.30-1.50/month** for 10K visitors + moderate API usage
  handler: "api/contact.handler",
  url: true, // Creates public Lambda URL
});
```

**Option 2: API Gateway (REST API)**
```typescript
// sst.config.ts
const api = new sst.aws.ApiGatewayV2("Api");
api.route("POST /contact", "api/contact.handler");
api.route("POST /newsletter", "api/newsletter.handler");
api.route("GET /stats", "api/stats.handler");
```

**Example Lambda function:**
```typescript
// api/contact.ts
export const handler = async (event: any) => {
  const body = JSON.parse(event.body);
  
  // Send email, save to DB, etc.
  console.log('Contact form:', body);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ success: true }),
  };
};
```

**Use in frontend:**
```typescript
// app/contact/page.tsx
const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/contact', {
  method: 'POST',
  body: JSON.stringify({ email, message }),
});
```

### Cost Estimate

**Expected monthly cost: $0** (under free tier)
- S3 storage: ~10MB website = $0.00023/month
- CloudFront: First 1TB free (covers ~300K page views)
- Data transfer: Free tier covers most small sites

**After free tier (year 2):**
- $0.10-0.50/month for typical traffic (1K-10K visitors/month)

### Custom Domain

After first deploy:

```typescript
// sst.config.ts
domain: {
  name: "aiready.dev",
  dns: sst.cloudflare.dns(), // if using Cloudflare
  // or
  dns: sst.aws.dns(), // if using Route 53
}
```

Then:
```bash
sst deploy --stage production
```

### Commands

```bash
# Deploy to dev
sst deploy

# Deploy to production  
sst deploy --stage production

# Remove dev stack
sst remove

# View infrastructure
sst console
```

---

## Option 2: AWS Amplify Hosting

**Best for:** Easiest setup, managed service, git-based deployments.

### Setup

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure
amplify configure

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### Pros/Cons

✅ Easiest setup (5 minutes)
✅ Automatic deployments from git
✅ Free SSL certificate
❌ Less control over infrastructure
❌ Slightly more expensive than raw S3+CloudFront

### Cost Estimate

**Free tier:** 1000 build minutes/month, 15GB served/month
**After:** ~$1-2/month for small sites

---

## Option 3: AWS CDK + Static Export

**Best for:** Full control, learning AWS, complex infrastructure.

### Setup

```bash
cd landing

# Install CDK
npm install -g aws-cdk

# Create CDK app
mkdir cdk && cd cdk
cdk init app --language typescript

# Add constructs for S3 + CloudFront
npm install @aws-cdk/aws-s3 @aws-cdk/aws-cloudfront @aws-cdk/aws-s3-deployment
```

### Configuration

```typescript
// cdk/lib/landing-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class LandingStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for website
    const bucket = new s3.Bucket(this, 'LandingBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'LandingDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // Deploy Next.js build output
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../out')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, 'DistributionDomain', {
      value: distribution.distributionDomainName,
    });
  }
}
```

### Deploy

```bash
# Build Next.js as static
cd landing
pnpm build
pnpm export  # Generates 'out' folder

# Deploy with CDK
cd cdk
cdk deploy
```

---

## Comparison

| Feature | SST Ion | Amplify | CDK Manual |
|---------|---------|---------|------------|
| **Setup time** | 5 min | 5 min | 30 min |
| **DX** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cost** | ~$0 | ~$1-2/mo | ~$0 |
| **Control** | High | Medium | Full |
| **Auto deploy** | Yes | Yes | Manual |
| **Custom domain** | Easy | Easy | Medium |
| **Learning curve** | Low | Low | High |

## Recommendation

**Start with SST Ion** - it gives you the best of both worlds:
- Easy as Amplify
- Cheap as raw S3+CloudFront
- Full control like CDK
- Excellent Next.js support

Then migrate to CDK later if you need more customization.

## Next Steps

1. Choose your deployment method (SST recommended)
2. Configure AWS credentials: `aws configure`
3. Deploy: `sst deploy`
4. Add custom domain (optional)
5. Set up CI/CD with GitHub Actions (optional)

## Cost Monitoring

```bash
# View current costs
aws ce get-cost-and-usage \
  --time-period Start=2026-01-01,End=2026-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost

# Set billing alerts
aws cloudwatch put-metric-alarm \
  --alarm-name billing-alarm \
  --alarm-description "Notify if costs exceed $5" \
  --metric-name EstimatedCharges \
  --threshold 5
```

## Cleanup

```bash
# SST
sst remove --stage production

# Amplify
amplify delete

# CDK
cdk destroy
```
