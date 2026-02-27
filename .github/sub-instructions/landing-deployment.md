# Landing Page Deployment Guide

## Overview

This guide covers deploying the AIReady landing page to production. The landing page is built with Next.js 16 and can be deployed to either Vercel (simpler) or AWS (more control, free tier friendly).

## Current Status ✅

A professional Next.js 16 landing page for aiready with:

### Features

- ✅ Hero section with value proposition
- ✅ Stats showcase (12K downloads, <1s speed, 91% accuracy)
- ✅ Three tool cards (pattern-detect, context-analyzer, consistency)
- ✅ CTA section with install command
- ✅ Responsive navigation
- ✅ Clean footer with links
- ✅ Tailwind CSS 4 styling
- ✅ TypeScript
- ✅ Gradient branding (blue → cyan)

### Tech Stack

- **Framework**: Next.js 16.1.2 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Icons**: Emoji (native)
- **Deployment**: Vercel or AWS ready

## Local Development

```bash
# From monorepo root
pnpm --filter @aiready/landing dev

# Or from landing directory
cd landing
pnpm dev
```

Visit http://localhost:3000

## Build Commands

```bash
# Build for production
pnpm --filter @aiready/landing build

# Start production server locally
pnpm --filter @aiready/landing start
```

## Deployment Options

### Option 1: Vercel (Recommended for Simplicity)

#### Quick Deploy

1. **Install Vercel CLI** (if not installed):

```bash
npm i -g vercel
```

2. **Login to Vercel**:

```bash
vercel login
```

3. **Deploy from landing directory**:

```bash
cd landing
vercel
```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time) or **Y** (subsequent deploys)
   - What's your project's name? `aiready-landing` (or your choice)
   - In which directory is your code located? **./** (current directory)
   - Want to override settings? **N** (auto-detection works great)

5. **Production deploy**:

```bash
vercel --prod
```

#### Alternative: GitHub Integration

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Set root directory to `landing`
5. Deploy! 🚀

#### Configuration

The project is configured in:

- `vercel.json` - Vercel settings
- `package.json` - Build commands
- Auto-detects Next.js 16

### Option 2: AWS (Free Tier Friendly)

Deploy your Next.js landing page to AWS using S3 + CloudFront (serverless, free tier friendly).

#### Why AWS over Vercel?

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

#### Multi-Account Setup (Recommended)

**If your existing AWS account exceeds free tier**, create a new account:

**Why separate accounts?**

- ✅ Each AWS account gets **its own free tier** (12 months + always-free services)
- ✅ Isolate billing and resources
- ✅ Best practice for separating personal/work/projects

**Setup steps:**

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

#### SST Ion Deployment

Use SST Ion for automated AWS deployment:

1. **Install SST CLI**:

```bash
npm install -g sst
```

2. **Configure AWS credentials** (see above)

3. **Deploy**:

```bash
# From monorepo root
make deploy-landing
```

This will:

- Create S3 bucket for static files
- Set up CloudFront CDN
- Configure SSL certificate
- Deploy Lambda functions (if any)
- Set up custom domain (when ready)

#### Manual AWS Setup

If you prefer manual setup:

1. **Build the app**:

```bash
cd landing
pnpm build
pnpm export  # Creates 'out' directory
```

2. **Upload to S3**:

```bash
aws s3 sync out/ s3://your-bucket-name --profile aiready
```

3. **Configure CloudFront**:
   - Create distribution pointing to S3 bucket
   - Enable SSL
   - Set up custom domain

## Custom Domain Setup

### With Vercel

1. Go to Vercel dashboard
2. Project settings → Domains
3. Add your domain (e.g., `getaiready.dev`)
4. Follow DNS instructions

### With AWS

1. **Purchase domain** on Cloudflare/Namecheap/etc
2. **Update SST config** (`landing/sst.config.ts`):

```typescript
domain: {
  name: "getaiready.dev",
  dns: sst.cloudflare.dns(), // or sst.aws.dns()
}
```

3. **Deploy**:

```bash
make deploy-landing
```

## Environment Variables

Create `landing/.env` with:

```bash
# AWS (optional overrides)
AWS_PROFILE=aiready
AWS_REGION=ap-southeast-2

# Domain
DOMAIN_NAME=getaiready.dev

# Notifications (for lead capture)
SES_TO_EMAIL=your-email@example.com

# Cloudflare DNS (for custom domain)
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ZONE_ID=your_zone_id
```

## File Structure

```
landing/
├── app/
│   ├── layout.tsx        # Root layout with SEO
│   ├── page.tsx          # Homepage with all sections
│   ├── globals.css       # Tailwind imports
│   └── favicon.ico       # Default favicon
├── api/                  # Serverless functions
│   └── request-report.ts # Lead capture endpoint
├── components/           # React components
├── public/               # Static assets
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json          # Dependencies and scripts
├── sst.config.ts         # AWS infrastructure
├── vercel.json          # Vercel deployment config
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS config
└── tsconfig.json         # TypeScript config
```

## Current Live URLs

- **AWS CloudFront**: https://d3dtmlalkpz8rv.cloudfront.net
- **Vercel**: Deploy when ready

## Quick Commands

```bash
# Development
make dev-landing          # Start dev server
make build-landing        # Build for production

# Deployment
make deploy-landing       # Deploy to AWS
make leads-export         # Export captured leads

# Vercel alternative
cd landing && vercel --prod
```

## Troubleshooting

### Build Issues

- Ensure Node.js 18+
- Clear `.next` cache: `rm -rf landing/.next`

### Deployment Issues

- Check AWS credentials: `aws sts get-caller-identity --profile aiready`
- Verify domain DNS propagation (can take 24-48 hours)
- Check Cloudflare zone status

### Performance

- Images are optimized automatically
- Static generation for fast loading
- CDN distribution for global speed

## Next Steps

1. **Deploy to production** (Vercel or AWS)
2. **Add custom domain** (getaiready.dev)
3. **Set up analytics** (optional)
4. **Monitor lead capture** via email/S3
5. **A/B test messaging** based on conversion data</content>
   <parameter name="filePath">/Users/pengcao/projects/aiready/.github/sub-instructions/landing-deployment.md
