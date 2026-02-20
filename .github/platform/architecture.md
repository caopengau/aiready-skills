# Platform Architecture

> Technical architecture for the AIReady SaaS Platform

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │  Dashboard    │  │ Remediation   │  │  Settings      │   │
│  │  - Repos      │  │ - Review Queue│  │  - Team        │   │
│  │  - Runs       │  │ - Risk Score  │  │  - Billing     │   │
│  │  - Trends     │  │ - Approve/Rej │  │  - Integrations│   │
│  └───────────────┘  └───────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway + Lambda                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Auth      │  │  Analysis  │  │  Remediate │             │
│  │  - GitHub  │  │  - Upload  │  │  - Create  │             │
│  │  - JWT     │  │  - Process │  │  - Approve │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              DynamoDB (Single Table Design)                 │
│  See: .github/plans/saas-architecture.md#dynamodb          │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 (App Router) | Dashboard UI |
| **Styling** | Tailwind CSS + shadcn/ui | Component library |
| **Auth** | NextAuth.js | GitHub OAuth, JWT |
| **API** | API Gateway + Lambda | Serverless REST |
| **Database** | DynamoDB | Single-table design |
| **Storage** | S3 | Analysis JSON files |
| **Queue** | SQS + EventBridge | Async processing |
| **IaC** | SST | Infrastructure as Code |
| **Payments** | Stripe | Subscriptions |

## Key Entities

### Core Entities

```typescript
// User
interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  teams: TeamMembership[];
}

// Team
interface Team {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  members: TeamMember[];
}

// Repository
interface Repository {
  id: string;
  teamId: string;
  name: string;
  gitUrl: string;
  defaultBranch: string;
}

// Analysis Run
interface AnalysisRun {
  id: string;
  repoId: string;
  tool: 'pattern-detect' | 'context-analyzer' | 'consistency';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summary: AnalysisSummary;
  rawDataUrl: string; // S3 URL
}

// Remediation Request
interface RemediationRequest {
  id: string;
  runId: string;
  type: 'consolidation' | 'rename' | 'restructure' | 'refactor';
  risk: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  affectedFiles: string[];
  estimatedSavings: number; // tokens
  assignedTo?: string; // expert ID
}
```

## API Endpoints

### Authentication

- `GET /api/auth/github` - GitHub OAuth redirect
- `GET /api/auth/callback` - OAuth callback
- `POST /api/auth/refresh` - Refresh JWT

### Analysis

- `POST /api/analysis/upload` - Upload CLI results
- `GET /api/repos/:id/runs` - List runs for repo
- `GET /api/runs/:id` - Get run details

### Remediation

- `POST /api/remediation/create` - Create remediation request
- `GET /api/remediation/queue` - Get review queue
- `PATCH /api/remediation/:id/approve` - Approve fix
- `PATCH /api/remediation/:id/reject` - Reject fix

### Billing

- `POST /api/billing/webhook` - Stripe webhook
- `GET /api/billing/portal` - Customer portal URL

## Environment Variables

```bash
# Auth
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# AWS
AWS_REGION=ap-southeast-2
DYNAMODB_TABLE_NAME=aiready-platform

# Stripe
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx

# App
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Deployment

```bash
# Development
pnpm sst deploy --stage development

# Production
pnpm sst deploy --stage production
```

## Related Docs

- [Auth Flow](./auth.md)
- [Billing Integration](./billing.md)
- [API Reference](./api/README.md)
- [Agent System](./agents/README.md)
