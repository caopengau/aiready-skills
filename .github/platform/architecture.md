# Platform Architecture

> Technical architecture for the AIReady SaaS Platform

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│         Next.js 16 App (SST v3 → AWS Lambda@Edge)          │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │  Dashboard    │  │ Visualizations│  │  Settings      │   │
│  │  - Repos      │  │ - Score charts│  │  - Team        │   │
│  │  - Analyses   │  │ - Breakdowns  │  │  - Billing     │   │
│  └───────────────┘  └───────────────┘  └────────────────┘   │
│                                                             │
│  App Router API Routes (src/app/api/)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Auth      │  │  Analysis  │  │ Remediation│             │
│  │  NextAuth  │  │  - Upload  │  │  - CRUD    │             │
│  │  v5        │  │  - List    │  │  - Review  │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              DynamoDB (Single Table Design)                 │
│  Table: aiready-platform   Billing: PAY_PER_REQUEST         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Users     │  │  Analyses  │  │Remediations│             │
│  │  Teams     │  │  + S3 keys │  │  Requests  │             │
│  │  Repos     │  │            │  │            │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Storage (S3)                              │
│  Key: analyses/<userId>/<repoId>/<timestamp>.json           │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
CLI Tool (Local)
    ↓ aiready analyze + aiready upload (planned)
    ↓ POST /api/analysis/upload  { repoId, data: AnalysisData }
        ↓
    Next.js API Route (upload/route.ts)
        ↓ verify session (NextAuth)
        ↓ verify repo ownership (DynamoDB)
        ↓ store raw JSON → S3  analyses/<userId>/<repoId>/<ts>.json
        ↓ write Analysis record → DynamoDB  PK: ANALYSIS#<repoId>
        ↓ update repo.aiScore + repo.lastAnalysisAt
            ↓
        Response: { analysisId, aiScore, breakdown, summary }
            ↓
        Dashboard re-fetches via TanStack Query
```

> **Planned (Phase 2):** EventBridge/SQS async processing for trends, benchmarks, notifications.

## Tech Stack (Actual)

| Layer | Technology | Notes |
|-------|------------|-------|
| **Framework** | Next.js 16 (App Router) | Deployed as `sst.aws.Nextjs` |
| **Styling** | Tailwind CSS v4 | No shadcn/ui yet (planned) |
| **Auth** | NextAuth v5 (`next-auth@beta`) | GitHub, Google, Email+Password, Magic Link |
| **State** | TanStack Query + Zustand | In dependencies, dashboard uses server components |
| **API** | Next.js App Router API routes | `src/app/api/` — no separate Lambda functions |
| **Database** | DynamoDB (`sst.aws.Dynamo`) | Single-table, PAY_PER_REQUEST |
| **Storage** | S3 (`sst.aws.Bucket`) | Raw analysis JSON |
| **IaC** | SST v3 | `sst.config.ts` uses `$config`, `sst.aws.*` |
| **DNS** | Cloudflare + CloudFront | Managed via SST Cloudflare provider |
| **Payments** | Stripe v20 | Webhook + portal (portal is a stub currently) |
| **Email** | AWS SES | Magic link emails implemented |

## Deployment URLs

| Stage | URL | Command |
|-------|-----|---------|
| **local** | `http://localhost:8888` | `pnpm run dev` (SST dev mode) |
| **dev** | `https://dev.platform.getaiready.dev` | `pnpm run deploy` |
| **prod** | `https://platform.getaiready.dev` | `pnpm run deploy:prod` |

## Key Entities (Actual Types)

```typescript
// src/lib/db.ts — actual implemented types

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  githubId?: string;
  googleId?: string;
  passwordHash?: string;    // for email/password auth
  emailVerified?: string;
  teamId?: string;
  role?: 'owner' | 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
}

interface Team {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  memberCount: number;
  repoLimit: number;
  createdAt: string;
  updatedAt: string;
}

interface Repository {
  id: string;
  teamId?: string;
  userId: string;          // owner (individuals don't need a team)
  name: string;
  url: string;
  description?: string;
  defaultBranch: string;
  lastAnalysisAt?: string;
  aiScore?: number;        // cached from latest analysis
  createdAt: string;
  updatedAt: string;
}

interface Analysis {
  id: string;
  repoId: string;
  userId: string;
  timestamp: string;
  aiScore: number;
  breakdown: {
    semanticDuplicates: number;     // 0-100
    contextFragmentation: number;
    namingConsistency: number;
    documentationHealth: number;
  };
  rawKey: string;  // S3 object key
  summary: { totalFiles: number; totalIssues: number; criticalIssues: number; warnings: number };
  createdAt: string;
}

interface RemediationRequest {
  id: string;
  repoId: string;
  teamId?: string;
  userId: string;
  type: 'consolidation' | 'rename' | 'restructure' | 'refactor';
  risk: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  title: string;
  description: string;
  affectedFiles: string[];
  estimatedSavings: number; // tokens
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}
```

## API Routes (Actual)

All routes are Next.js App Router handlers in `platform/src/app/api/`.

| Route | Methods | Status |
|-------|---------|--------|
| `/api/auth/[...nextauth]` | GET, POST | ✅ NextAuth v5 |
| `/api/auth/register` | POST | ✅ Email/password registration |
| `/api/auth/magic-link` | POST | ✅ Send magic link |
| `/api/auth/verify` | POST | ✅ Verify magic link token |
| `/api/repos` | GET, POST, DELETE | ✅ List / create / delete repos |
| `/api/analysis/upload` | POST | ✅ Upload + store analysis |
| `/api/remediation` | GET, POST | ✅ List / create remediations |
| `/api/remediation/[id]` | PATCH | ✅ Update remediation status |
| `/api/billing/webhook` | POST | ✅ Stripe webhook |
| `/api/billing/portal` | GET | ⚠️ Stub (returns "not configured") |

## Environment Variables

```bash
# .env.local (see .env.example)

# NextAuth v5
AUTH_URL=http://localhost:8888
AUTH_SECRET=xxx

# OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# AWS (injected by SST in deployed stages)
AWS_REGION=ap-southeast-2
DYNAMO_TABLE=aiready-platform-<stage>-MainTable-xxx
S3_BUCKET=aiready-platform-<stage>-AnalysisBucket-xxx

# Stripe
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
STRIPE_PRICE_ID_PRO=xxx
STRIPE_PRICE_ID_ENTERPRISE=xxx

# SES
SES_DOMAIN=dev.getaiready.dev         # dev
SES_FROM_EMAIL=noreply@dev.getaiready.dev

# App
NEXT_PUBLIC_APP_URL=http://localhost:8888

# Cloudflare (for SST deployment)
CLOUDFLARE_API_TOKEN=xxx
CLOUDFLARE_ZONE_ID=50eb7dcadc84c58ab34583742db0b671
```

## Deployment

```bash
# Local dev (SST tunnel + Next.js on :8888)
pnpm run dev

# Next.js only (no SST, needs manual env vars)
pnpm run dev:next

# Deploy to dev stage
pnpm run deploy           # → sst deploy --stage dev

# Deploy to production
pnpm run deploy:prod      # → sst deploy --stage prod

# Tear down dev
pnpm run remove
```

---

## Strategic Architecture Decisions

### ❌ No DAX (DynamoDB Accelerator) — Yet

**Decision:** Do not start with DAX. DynamoDB's sub-10ms latency is sufficient for dashboard use cases.

**Rationale:**
- DAX adds ~$40/mo minimum cost
- Significant operational complexity
- Dashboard use case doesn't require microsecond latency
- Wait until thousands of concurrent users before considering

**When to reconsider:**
- User base exceeds 5,000 daily active users
- Latency complaints from Enterprise customers
- Real-time collaboration features require faster reads

### ⚠️ Lambda Concurrency Planning

**Risk:** Enterprise client suddenly uploads 500 repos at once → throttling

**Mitigation:**
1. Set reserved concurrency on processing Lambda (e.g., 50)
2. Use SQS queue for repo processing (built-in backpressure)
3. Implement batch processing (max 10 repos per invocation)
4. Add throttling alerts to CloudWatch

**Implementation:**
```typescript
// sst.config.ts
const processingLambda = sst.aws.Function('ProcessRepos', {
  handler: 'src/handlers/process-repos.handler',
  timeout: 300,
  memory: 1024,
  reservedConcurrency: 50, // Prevent cascade failures
});
```

### ✅ Serverless as Competitive Advantage

**Strategic Insight:** "Cost at 0 users" being $0 allows survival through the "Trough of Sorrow" (Month 7 plateau).

**Cost Projection (Monthly):**

| Users | DynamoDB | Lambda | S3 | CloudFront | Total |
|-------|----------|--------|-----|------------|-------|
| 0 | $0 | $0 | $0 | $1 | ~$1 |
| 100 | $5 | $10 | $2 | $5 | ~$22 |
| 1,000 | $25 | $50 | $10 | $20 | ~$105 |
| 10,000 | $150 | $300 | $50 | $100 | ~$600 |

**Compare to:** Traditional server (~$200-500/mo regardless of usage)

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01 | Serverless (Lambda + DynamoDB) over Express + PostgreSQL | ~90% cost savings at low user counts, zero ops burden |
| 2026-01 | Single-table DynamoDB design | Eliminates JOINs, serves all 15 access patterns from one table |
| 2026-01 | SST for IaC | Already in use for landing, consistent toolchain |
| 2026-02 | Phase 2 = agentic remediation + consulting hybrid | Closes gap between detection and fix; unique market position |
| 2026-02 | No DAX at launch | Adds $40/mo minimum; DynamoDB latency sufficient for dashboards |
| 2026-02 | Lambda reserved concurrency = 50 | Prevent cascade failures when Enterprise uploads many repos |
```
