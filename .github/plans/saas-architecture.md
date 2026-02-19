# AIReady SaaS Architecture & Monetization Plan

> **Reference this document for SaaS platform design, data models, and revenue strategy**

## 🎯 Product Vision

**AIReady transforms static code analysis into continuous AI-readiness optimization.**

### Core Value Proposition

**Free CLI (Open Source):** One-time snapshots showing current problems + full local visualization
**Pro SaaS:** Historical trends, benchmarks, automated recommendations
**Enterprise:** CI/CD integration, team analytics, custom rules

### Strategic Approach: Open Source + Hosted SaaS

Core analysis tools and visualization remain open source (MIT). Revenue comes from the hosted platform providing trends, benchmarks, team features, and CI/CD integration. See `docs/monetization-strategy-visualization.md` for full strategic rationale.

## 🏗️ Technical Architecture

### System Components (Serverless)

```
┌─────────────────────────────────────────────────────────────┐
│              Frontend (Next.js on AWS(aiready account))     │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │  Dashboard    │  │ Visualizations│  │  Settings      │   │
│  │  - Trends     │  │ - D3.js graphs│  │  - Thresholds  │   │
│  │  - Benchmarks │  │ - Heatmaps    │  │  - Integrations│   │
│  └───────────────┘  └───────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway + Lambda (Node.js 20)          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Auth      │  │  Analysis  │  │  Webhooks  │             │
│  │  - JWT     │  │  - Upload  │  │  - GitHub  │             │
│  │  - OAuth   │  │  - Process │  │  - Slack   │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              DynamoDB (Single Table Design)                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Users     │  │  Analysis  │  │  Metrics   │             │
│  │  Teams     │  │  Runs      │  │  Timeseries│             │
│  │  Repos     │  │  Results   │  │  Recs      │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│            ↕ DAX (DynamoDB Accelerator)                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           Event-Driven Processing (Async)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │ EventBridge│  │    SQS     │  │  Lambda    │             │
│  │ (routing)  │→ │  (queues)  │→ │ (workers)  │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Storage (S3)                          │
│  - Raw analysis JSON files                                  │
│  - Generated reports (HTML/PDF)                             │
│  - Visualization data (cached)                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
CLI Tool (Local)
    ↓ analyze codebase
    ↓ generate JSON
    ↓ POST /api/analysis/upload
        ↓
    API Gateway → Lambda
        ↓ validate JWT
        ↓ parse JSON
        ↓ store raw JSON in S3
        ↓ write run record to DynamoDB
        ↓ emit event to EventBridge
            ↓
        EventBridge → SQS → Processing Lambda
            ↓ extract metrics
            ↓ calculate trends (query previous runs)
            ↓ compute benchmarks (aggregate across repos)
            ↓ generate recommendations
            ↓ write metrics to DynamoDB
            ↓ send notifications (SES/Slack webhook)
                ↓
            API Gateway WebSocket (v2)
                ↓ push updates to dashboard
                    ↓
                Browser (Real-time)
```

### Why Serverless?

| Aspect | Traditional (Express + PostgreSQL) | Serverless (Lambda + DynamoDB) |
|--------|-----------------------------------|-------------------------------|
| **Cost at 0 users** | ~$30-50/mo (server + DB) | **$0/mo** (pay per request) |
| **Cost at 1K users** | ~$50-100/mo | **~$5-20/mo** |
| **Cost at 10K users** | ~$200-500/mo | **~$30-80/mo** |
| **Scaling** | Manual (add servers) | **Automatic** |
| **Ops burden** | Patching, backups, monitoring | **Near zero** |
| **Cold starts** | N/A | ~200ms (acceptable for API) |
| **Deployment** | Docker/CI/CD pipeline | **SST (already used!)** |

## 📊 DynamoDB Single Table Design

### Design Philosophy

Single table design stores all entities in one DynamoDB table using composite keys. This eliminates JOINs (which DynamoDB doesn't support), keeps infrastructure simple, and allows all access patterns to be served efficiently.

### Access Patterns (Define First)

| # | Access Pattern | PK | SK | Index |
|---|---------------|----|----|-------|
| 1 | Get user by ID | `USER#<id>` | `PROFILE` | Table |
| 2 | Get user by email | `<email>` | `USER` | GSI1 |
| 3 | Get team by ID | `TEAM#<id>` | `META` | Table |
| 4 | Get team by slug | `<slug>` | `TEAM` | GSI1 |
| 5 | List team members | `TEAM#<id>` | `MEMBER#` (begins_with) | Table |
| 6 | List teams for user | `USER#<id>` | `TEAM#` (begins_with) | Table |
| 7 | List repos for team | `TEAM#<id>` | `REPO#` (begins_with) | Table |
| 8 | Get repo by ID | `REPO#<id>` | `META` | Table |
| 9 | List runs for repo (newest first) | `REPO#<id>` | `RUN#` (begins_with, ScanIndexForward=false) | Table |
| 10 | List runs by status | `<status>` | `RUN#<timestamp>` | GSI2 |
| 11 | Get daily metrics for repo+tool | `REPO#<id>` | `METRIC#<tool>#<date>` (between) | Table |
| 12 | List recommendations for repo | `REPO#<id>` | `REC#` (begins_with) | Table |
| 13 | Get subscription for team | `TEAM#<id>` | `SUB` | Table |
| 14 | Get auth token by hash | `TOKEN#<hash>` | `AUTH` | Table |
| 15 | List file metrics for a run | `RUN#<id>` | `FILE#` (begins_with) | Table |

### Table Schema

```
Table Name: aiready-saas
Billing Mode: PAY_PER_REQUEST (on-demand)

Primary Key:
  PK (String) - Partition Key
  SK (String) - Sort Key

GSI1: (for inverse lookups)
  GSI1PK (String) - Partition Key
  GSI1SK (String) - Sort Key

GSI2: (for status/type queries)
  GSI2PK (String) - Partition Key
  GSI2SK (String) - Sort Key
```

### Entity Definitions

#### User

```json
{
  "PK": "USER#01JXYZ",
  "SK": "PROFILE",
  "GSI1PK": "user@example.com",
  "GSI1SK": "USER",
  "entityType": "User",
  "id": "01JXYZ",
  "email": "user@example.com",
  "name": "Jane Developer",
  "avatarUrl": "https://...",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

#### Auth Token

```json
{
  "PK": "TOKEN#a1b2c3d4e5f6",
  "SK": "AUTH",
  "entityType": "AuthToken",
  "userId": "01JXYZ",
  "tokenHash": "a1b2c3d4e5f6",
  "expiresAt": "2026-02-15T10:00:00Z",
  "createdAt": "2026-01-15T10:00:00Z",
  "ttl": 1739613600
}
```

#### Team

```json
{
  "PK": "TEAM#01TABC",
  "SK": "META",
  "GSI1PK": "my-team-slug",
  "GSI1SK": "TEAM",
  "entityType": "Team",
  "id": "01TABC",
  "name": "Acme Engineering",
  "slug": "my-team-slug",
  "plan": "pro",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

#### Team Membership (bidirectional)

```json
// Query: List members of team
{
  "PK": "TEAM#01TABC",
  "SK": "MEMBER#01JXYZ",
  "entityType": "TeamMember",
  "teamId": "01TABC",
  "userId": "01JXYZ",
  "role": "owner",
  "joinedAt": "2026-01-15T10:00:00Z"
}

// Query: List teams for user
{
  "PK": "USER#01JXYZ",
  "SK": "TEAM#01TABC",
  "entityType": "UserTeam",
  "teamId": "01TABC",
  "userId": "01JXYZ",
  "role": "owner",
  "teamName": "Acme Engineering",
  "plan": "pro"
}
```

#### Repository

```json
{
  "PK": "TEAM#01TABC",
  "SK": "REPO#my-project",
  "GSI1PK": "REPO#01RABC",
  "GSI1SK": "META",
  "entityType": "Repository",
  "id": "01RABC",
  "teamId": "01TABC",
  "name": "my-project",
  "gitUrl": "https://github.com/acme/my-project.git",
  "defaultBranch": "main",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

#### Analysis Run

```json
{
  "PK": "REPO#01RABC",
  "SK": "RUN#2026-01-15T10:30:00Z",
  "GSI2PK": "completed",
  "GSI2SK": "RUN#2026-01-15T10:30:00Z",
  "entityType": "AnalysisRun",
  "id": "01RUNXYZ",
  "repoId": "01RABC",
  "tool": "pattern-detect",
  "version": "0.8.1",
  "commitSha": "abc123def",
  "branch": "main",
  "triggeredBy": "01JXYZ",
  "status": "completed",
  "rawDataUrl": "s3://aiready-saas/runs/01RUNXYZ/raw.json",
  "summary": {
    "totalFiles": 42,
    "totalPatterns": 23,
    "totalTokenCost": 8500,
    "criticalCount": 3,
    "majorCount": 8,
    "minorCount": 12
  },
  "createdAt": "2026-01-15T10:30:00Z",
  "completedAt": "2026-01-15T10:30:45Z",
  "ttl": 1747353600
}
```

#### Daily Metrics (Time-Series)

```json
// Pattern metrics for a specific day
{
  "PK": "REPO#01RABC",
  "SK": "METRIC#pattern-detect#2026-01-15",
  "entityType": "DailyMetric",
  "repoId": "01RABC",
  "tool": "pattern-detect",
  "date": "2026-01-15",
  "totalFiles": 42,
  "totalPatterns": 23,
  "totalTokenCost": 8500,
  "patternsByType": {
    "api-handler": 12,
    "validator": 8,
    "utility": 3
  },
  "topDuplicates": [...],
  "createdAt": "2026-01-15T10:30:45Z",
  "ttl": 1747353600
}

// Context metrics for a specific day
{
  "PK": "REPO#01RABC",
  "SK": "METRIC#context-analyzer#2026-01-15",
  "entityType": "DailyMetric",
  "repoId": "01RABC",
  "tool": "context-analyzer",
  "date": "2026-01-15",
  "totalFiles": 42,
  "avgImportDepth": 3.2,
  "maxImportDepth": 8,
  "avgContextBudget": 5200,
  "maxContextBudget": 18000,
  "avgFragmentation": 0.35,
  "avgCohesion": 0.72,
  "circularDependencyCount": 2,
  "fragmentedDomains": [...],
  "createdAt": "2026-01-15T10:30:45Z",
  "ttl": 1747353600
}

// Consistency metrics for a specific day
{
  "PK": "REPO#01RABC",
  "SK": "METRIC#consistency#2026-01-15",
  "entityType": "DailyMetric",
  "repoId": "01RABC",
  "tool": "consistency",
  "date": "2026-01-15",
  "totalFiles": 42,
  "totalIssues": 45,
  "consistencyScore": 0.82,
  "namingIssues": 26,
  "patternIssues": 15,
  "architectureIssues": 4,
  "bySeverity": {
    "critical": 2,
    "major": 8,
    "minor": 20,
    "info": 15
  },
  "topIssueTypes": {
    "snake_case_violations": 12,
    "poor_naming": 8,
    "error_handling_mix": 5,
    "async_pattern_mix": 3
  },
  "topIssues": [...],
  "createdAt": "2026-01-15T10:30:45Z",
  "ttl": 1747353600
}
```

#### File-Level Metrics (Per Run)

```json
{
  "PK": "RUN#01RUNXYZ",
  "SK": "FILE#src/api/users.ts",
  "entityType": "FileMetric",
  "runId": "01RUNXYZ",
  "filePath": "src/api/users.ts",
  "tool": "pattern-detect",
  "tokenCost": 450,
  "linesOfCode": 120,
  "patternType": "api-handler",
  "similarityScore": 0.87,
  "importDepth": 4,
  "contextBudget": 3200,
  "cohesionScore": 0.65,
  "fragmentationScore": 0.42,
  "metrics": { ... },
  "ttl": 1747353600
}
```

#### Recommendation

```json
{
  "PK": "REPO#01RABC",
  "SK": "REC#01RECXYZ",
  "GSI2PK": "open",
  "GSI2SK": "REC#2026-01-15T10:30:45Z",
  "entityType": "Recommendation",
  "id": "01RECXYZ",
  "repoId": "01RABC",
  "runId": "01RUNXYZ",
  "type": "consolidation",
  "severity": "critical",
  "title": "Consolidate 12 scattered user management files",
  "description": "...",
  "affectedFiles": ["src/user/get.ts", "..."],
  "estimatedSavings": 3200,
  "status": "open",
  "createdAt": "2026-01-15T10:30:45Z",
  "updatedAt": "2026-01-15T10:30:45Z"
}
```

#### Subscription

```json
{
  "PK": "TEAM#01TABC",
  "SK": "SUB",
  "entityType": "Subscription",
  "teamId": "01TABC",
  "plan": "pro",
  "stripeSubscriptionId": "sub_xyz123",
  "status": "active",
  "currentPeriodStart": "2026-01-15T00:00:00Z",
  "currentPeriodEnd": "2026-02-15T00:00:00Z",
  "cancelAt": null,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

### Data Retention via TTL

DynamoDB TTL automatically deletes expired items at no cost. This replaces TimescaleDB retention policies.

| Plan | Retention | TTL Strategy |
|------|-----------|-------------|
| **Free** | 7 days | `ttl = createdAt + 7 days` |
| **Pro** | 90 days | `ttl = createdAt + 90 days` |
| **Enterprise** | 1 year+ | `ttl = createdAt + 365 days` (or no TTL) |

```typescript
// Calculate TTL based on plan
function calculateTTL(plan: 'free' | 'pro' | 'enterprise', createdAt: Date): number | undefined {
  const retentionDays = {
    free: 7,
    pro: 90,
    enterprise: 365,
  };
  
  const days = retentionDays[plan];
  const ttlDate = new Date(createdAt.getTime() + days * 24 * 60 * 60 * 1000);
  return Math.floor(ttlDate.getTime() / 1000); // Unix epoch seconds
}
```

### Query Examples

```typescript
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// 1. Get user by email
const userByEmail = new QueryCommand({
  TableName: 'aiready-saas',
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :email AND GSI1SK = :sk',
  ExpressionAttributeValues: {
    ':email': 'user@example.com',
    ':sk': 'USER',
  },
});

// 2. List analysis runs for repo (newest first, last 30)
const recentRuns = new QueryCommand({
  TableName: 'aiready-saas',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': 'REPO#01RABC',
    ':sk': 'RUN#',
  },
  ScanIndexForward: false, // newest first
  Limit: 30,
});

// 3. Get metrics trend for last 30 days (pattern-detect)
const metricsTrend = new QueryCommand({
  TableName: 'aiready-saas',
  KeyConditionExpression: 'PK = :pk AND SK BETWEEN :start AND :end',
  ExpressionAttributeValues: {
    ':pk': 'REPO#01RABC',
    ':start': 'METRIC#pattern-detect#2025-12-15',
    ':end': 'METRIC#pattern-detect#2026-01-15',
  },
});

// 4. List open recommendations for repo
const openRecs = new QueryCommand({
  TableName: 'aiready-saas',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  FilterExpression: '#status = :status',
  ExpressionAttributeNames: { '#status': 'status' },
  ExpressionAttributeValues: {
    ':pk': 'REPO#01RABC',
    ':sk': 'REC#',
    ':status': 'open',
  },
});

// 5. List all teams for a user
const userTeams = new QueryCommand({
  TableName: 'aiready-saas',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': 'USER#01JXYZ',
    ':sk': 'TEAM#',
  },
});
```

### SST Infrastructure Definition

```typescript
// sst.config.ts (SaaS platform)
import { SSTConfig } from 'sst';
import { Api, Table, Bucket, EventBus, NextjsSite } from 'sst/constructs';

export default {
  config() {
    return { name: 'aiready-saas', region: 'ap-southeast-2' };
  },
  stacks(app) {
    app.stack(function SaaSStack({ stack }) {
      // Single DynamoDB table
      const table = new Table(stack, 'MainTable', {
        fields: {
          PK: 'string',
          SK: 'string',
          GSI1PK: 'string',
          GSI1SK: 'string',
          GSI2PK: 'string',
          GSI2SK: 'string',
        },
        primaryIndex: { partitionKey: 'PK', sortKey: 'SK' },
        globalIndexes: {
          GSI1: { partitionKey: 'GSI1PK', sortKey: 'GSI1SK' },
          GSI2: { partitionKey: 'GSI2PK', sortKey: 'GSI2SK' },
        },
        timeToLiveAttribute: 'ttl',
      });

      // S3 bucket for raw analysis data
      const bucket = new Bucket(stack, 'AnalysisBucket');

      // Event bus for async processing
      const bus = new EventBus(stack, 'AnalysisBus', {
        rules: {
          analysisUploaded: {
            pattern: { source: ['aiready.analysis'], detailType: ['uploaded'] },
            targets: { processor: 'functions/process-analysis.handler' },
          },
          metricsComputed: {
            pattern: { source: ['aiready.metrics'], detailType: ['computed'] },
            targets: { notifier: 'functions/send-notifications.handler' },
          },
        },
      });

      // API
      const api = new Api(stack, 'Api', {
        defaults: {
          function: {
            bind: [table, bucket, bus],
            environment: {
              TABLE_NAME: table.tableName,
              BUCKET_NAME: bucket.bucketName,
              BUS_NAME: bus.eventBusName,
            },
          },
        },
        routes: {
          // Auth
          'POST /auth/login': 'functions/auth/login.handler',
          'POST /auth/callback': 'functions/auth/callback.handler',
          'POST /auth/refresh': 'functions/auth/refresh.handler',

          // Analysis
          'POST /analysis/upload': 'functions/analysis/upload.handler',
          'GET /repos/{repoId}/runs': 'functions/analysis/list-runs.handler',
          'GET /runs/{runId}': 'functions/analysis/get-run.handler',

          // Metrics
          'GET /repos/{repoId}/metrics': 'functions/metrics/get-trends.handler',
          'GET /repos/{repoId}/benchmarks': 'functions/metrics/get-benchmarks.handler',

          // Recommendations
          'GET /repos/{repoId}/recommendations': 'functions/recommendations/list.handler',
          'PATCH /recommendations/{recId}': 'functions/recommendations/update.handler',

          // Teams & Repos
          'GET /teams': 'functions/teams/list.handler',
          'POST /teams': 'functions/teams/create.handler',
          'GET /teams/{teamId}/repos': 'functions/repos/list.handler',
          'POST /teams/{teamId}/repos': 'functions/repos/create.handler',

          // Billing
          'POST /billing/webhook': 'functions/billing/stripe-webhook.handler',
          'GET /billing/portal': 'functions/billing/create-portal.handler',
        },
      });

      // Frontend
      const site = new NextjsSite(stack, 'Dashboard', {
        path: 'apps/dashboard',
        environment: {
          NEXT_PUBLIC_API_URL: api.url,
        },
      });

      stack.addOutputs({
        ApiUrl: api.url,
        SiteUrl: site.url,
        TableName: table.tableName,
      });
    });
  },
} satisfies SSTConfig;
```

## 🔐 Authentication & Authorization

### JWT-Based Auth

```typescript
// Token payload
interface JWTPayload {
  userId: string;
  email: string;
  teams: Array<{
    teamId: string;
    role: 'owner' | 'admin' | 'member';
  }>;
  plan: 'free' | 'pro' | 'enterprise';
  iat: number;
  exp: number;
}

// Lambda middleware (lightweight, no Express)
async function withAuth(event: APIGatewayProxyEventV2, requiredPlan?: string) {
  const token = event.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new AuthError('Unauthorized', 401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (requiredPlan && !hasAccessToPlan(payload.plan, requiredPlan)) {
      throw new AuthError('Upgrade required', 403);
    }

    return payload;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError('Invalid token', 401);
  }
}

function hasAccessToPlan(userPlan: string, requiredPlan: string): boolean {
  const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
  return (planHierarchy[userPlan] || 0) >= (planHierarchy[requiredPlan] || 0);
}
```

### OAuth Integration

**Supported Providers:**

- GitHub (primary — repo access)
- Google (email-based)
- Microsoft (enterprise customers)

## 📡 API Endpoints

### Analysis Upload

```typescript
POST /analysis/upload
Authorization: Bearer <jwt>
Content-Type: application/json

Request Body:
{
  "tool": "pattern-detect" | "context-analyzer" | "consistency",
  "version": "0.8.1",
  "repository": "owner/repo",
  "commit": "abc123",
  "branch": "main",
  "results": {
    // Full analysis JSON from CLI
  }
}

Response:
{
  "analysisId": "01RUNXYZ",
  "status": "processing",
  "estimatedTime": 30,
  "dashboardUrl": "https://app.getaiready.dev/repos/:id/analysis/:analysisId"
}
```

### Metrics Query

```typescript
GET /repos/:repoId/metrics?tool=pattern-detect&from=2026-01-01&to=2026-01-14
Authorization: Bearer <jwt>

Response:
{
  "data": [
    {
      "date": "2026-01-01",
      "totalPatterns": 23,
      "totalTokenCost": 8500,
      "byType": {
        "api-handler": 12,
        "validator": 8,
        "utility": 3
      }
    }
  ],
  "summary": {
    "avgPatterns": 21.5,
    "trend": "decreasing",
    "changePercent": -8.5
  }
}

GET /repos/:repoId/metrics?tool=consistency&from=2026-01-01&to=2026-01-14
Authorization: Bearer <jwt>

Response:
{
  "data": [
    {
      "date": "2026-01-01",
      "totalIssues": 45,
      "consistencyScore": 0.82,
      "namingIssues": 26,
      "patternIssues": 15,
      "architectureIssues": 4,
      "bySeverity": {
        "critical": 2,
        "major": 8,
        "minor": 20,
        "info": 15
      },
      "topIssueTypes": {
        "snake_case_violations": 12,
        "poor_naming": 8,
        "error_handling_mix": 5,
        "async_pattern_mix": 3
      }
    }
  ],
  "summary": {
    "avgIssues": 42.5,
    "avgConsistencyScore": 0.84,
    "trend": "improving",
    "changePercent": -6.7
  }
}
```

### Recommendations

```typescript
GET /repos/:repoId/recommendations?status=open&severity=critical
Authorization: Bearer <jwt>

Response:
{
  "recommendations": [
    {
      "id": "01RECXYZ",
      "type": "consolidation",
      "severity": "critical",
      "title": "Consolidate 12 scattered user management files",
      "description": "...",
      "affectedFiles": ["src/user/get.ts", "..."],
      "estimatedSavings": 3200,
      "status": "open",
      "createdAt": "2026-01-14T10:00:00Z"
    }
  ]
}
```

## 💰 Pricing Tiers

### Free Tier

**Price:** $0/month
**Limits:**

- 1 team
- 3 repositories
- 10 analysis runs/month
- 7-day data retention
- CLI access (full open source tools + visualization)
- JSON/HTML export

**Value Prop:** Try before you buy, personal projects

### Pro Tier

**Price:** $49/month
**Includes:**

- Everything in Free
- Unlimited repositories
- Unlimited analysis runs
- 90-day data retention
- Historical trends & charts
- Team benchmarking (compare against similar repos)
- 5 AI-generated refactoring plans/month
- Slack/Discord webhooks
- Email support

**Value Prop:** Teams serious about code quality

### Enterprise Tier

**Price:** Custom (starts at $499/month)
**Includes:**

- Everything in Pro
- Unlimited teams/users
- Unlimited refactoring plans
- 1-year+ data retention
- CI/CD integration (GitHub Actions, GitLab CI)
- Custom thresholds & rules
- API access for custom integrations
- Dedicated account manager
- Priority support (SLA)
- On-premise deployment option

**Value Prop:** Large organizations, compliance requirements

### Add-Ons

- **Extra repositories** (Pro): $5/repo/month
- **Extended retention** (Pro): $10/month per 90 days
- **White-label reports** (Enterprise): $100/month

## 📈 Revenue Model

### Target Metrics (Year 1)

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Free users | 500 | 2,000 | 10,000 |
| Pro subscribers | 15 | 50 | 200 |
| Enterprise deals | 0 | 2 | 10 |
| MRR | $735 | $3,450 | $14,800 |
| ARR | $8,820 | $41,400 | $177,600 |

### Conversion Funnel

```
10,000 Free Users (100%)
    ↓ 3% convert to Pro
300 Pro Trials
    ↓ 67% retain after trial
200 Pro Subscribers ($9,800 MRR)
    ↓ 5% upgrade to Enterprise
10 Enterprise Deals ($5,000+ MRR)
    ↓
Total: $14,800 MRR = $177,600 ARR
```

### Customer Acquisition

**Organic:**

- npm package downloads → website
- GitHub stars/trending
- Dev.to / Hacker News posts
- Technical blog (SEO)

**Paid:**

- Google Ads (keywords: "code quality", "AI code tools")
- LinkedIn sponsored content (targeting CTOs, engineering managers)
- Conference sponsorships (React Summit, Node Congress)

**Partnerships:**

- GitHub Marketplace listing
- Copilot plugin marketplace
- VS Code extension recommendations

### Retention Strategy

**Prevent Churn:**

- Weekly email: "Your code quality improved 12% this week"
- In-app notifications: "New fragmentation detected"
- Quarterly business reviews (Enterprise)

**Expansion Revenue:**

- Usage-based pricing for extra repos
- Upsell: Free → Pro (show locked features)
- Cross-sell: Pro → Enterprise (team growth triggers)

## 🚀 Go-to-Market Strategy

### Phase 1: Launch (Months 1-3) - ✅ COMPLETED

- ✅ Launch pattern-detect CLI (done)
- ✅ Launch context-analyzer CLI (done)
- ✅ Launch consistency CLI (done) - v0.8.22
- ✅ Build open-source visualizer (done)
- ✅ Unified CLI with scoring (done) - v0.9.23
- ✅ Public website with live demo (done)
- ✅ Blog series on AI Code Debt (done - 5 parts)
- 🔜 Build MVP SaaS platform (serverless)
- 🔜 Onboard 50 beta users
- 🔜 Product Hunt launch
- 🔜 First paid customer

### Phase 2: Growth (Months 4-6)

- Launch refactoring plan generator (AI-powered)
- Add CI/CD integrations
- 50 Pro subscribers
- 2 Enterprise pilots
- Content marketing (case studies, blog posts)

### Phase 3: Scale (Months 7-12)

- Launch team collaboration features
- Add real-time monitoring
- 200 Pro subscribers
- 10 Enterprise customers
- Conference talks & sponsorships
- Partner with AI coding tool vendors

## 🎨 UI/UX Wireframes

### Dashboard Home

```
┌────────────────────────────────────────────────────────────┐
│ AIReady                    [Search]   [Repos ▾]  [Profile] │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  My Repositories                        [+ Add Repository]  │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  owner/repo-a    │  │  owner/repo-b    │               │
│  │  ▶ 23 patterns   │  │  ▶ 15 patterns   │               │
│  │  ▼ 8.5% (↓ good) │  │  ▲ 12% (↑ bad)   │               │
│  │  Last: 2h ago    │  │  Last: 1d ago    │               │
│  │  [View →]        │  │  [View →]        │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
│  Quick Insights                                              │
│  • 3 critical issues need attention                         │
│  • Your average duplication decreased 15% this month 🎉     │
│  • Recommendation: Consolidate user management module       │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

### Repository Detail

```
┌────────────────────────────────────────────────────────────┐
│ ← Back to Repos     owner/repo-name     [Settings]  [Share]│
├────────────────────────────────────────────────────────────┤
│  [Overview] [Patterns] [Context] [Consistency] [Recs] [CI] │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  Pattern Detection                          Last run: 2h ago│
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 Trend Chart (30 days)                           │   │
│  │     │                                                │   │
│  │  30 │     •                                          │   │
│  │  25 │   •   •   •                                    │   │
│  │  20 │ •           •     •                            │   │
│  │  15 │                 •   •   •                      │   │
│  │     └────────────────────────────────────────        │   │
│  │      Jan 1      Jan 7      Jan 14                    │   │
│  │                                                       │   │
│  │  Current: 23 patterns (-8.5% vs last week)           │   │
│  │  Token cost: 8,500 (-12% vs last week)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Breakdown by Type                                           │
│  ┌────────────┬───────┬───────────┬──────────┐             │
│  │ Type       │ Count │ Avg Sim   │ Tokens   │             │
│  ├────────────┼───────┼───────────┼──────────┤             │
│  │ API Handler│  12   │ 87%  🔴  │  3,200   │             │
│  │ Validator  │   8   │ 78%  🟠  │  2,100   │             │
│  │ Utility    │   3   │ 65%  🟡  │    900   │             │
│  └────────────┴───────┴───────────┴──────────┘             │
│                                                              │
│  [View Detailed Report →]  [Run New Analysis]               │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

### Consistency Analysis View

```
┌────────────────────────────────────────────────────────────┐
│ ← Back to Repos     owner/repo-name     [Settings]  [Share]│
├────────────────────────────────────────────────────────────┤
│  [Overview] [Patterns] [Context] [Consistency] [Recs] [CI] │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  Consistency Score: 87%                    Last run: 3h ago │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📈 Score Trend (30 days)                           │   │
│  │     │                                                │   │
│  │ 100 │                       • • •                    │   │
│  │  90 │             • • •   •                          │   │
│  │  80 │       • •                                      │   │
│  │  70 │   • •                                          │   │
│  │     └────────────────────────────────────────        │   │
│  │      Jan 1      Jan 7      Jan 14     Jan 21        │   │
│  │                                                       │   │
│  │  Current: 87% (+9% vs last week) ✅                  │   │
│  │  Total issues: 42 (-15 vs last week)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Issue Breakdown by Category                                │
│  ┌──────────────────┬───────┬─────────┬──────────┐         │
│  │ Category         │ Count │ Trend   │ Severity │         │
│  ├──────────────────┼───────┼─────────┼──────────┤         │
│  │ Naming Quality   │  24   │ ↓ -8    │ 🔴3 🟠21 │         │
│  │ Pattern Inconsist│  15   │ ↓ -5    │ 🔴0 🟠12 │         │
│  │ Architecture     │   3   │ ↓ -2    │ 🔴1 🟠2  │         │
│  └──────────────────┴───────┴─────────┴──────────┘         │
│                                                              │
│  Top Issues Needing Attention                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 Critical: Mixed error handling patterns          │   │
│  │    src/api/auth.ts, src/api/users.ts (8 files)     │   │
│  │    [View Details →]                                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🟠 Major: Single-letter variable names             │   │
│  │    src/utils/parser.ts:42, 58, 91 (12 instances)   │   │
│  │    [View Details →]                                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🟠 Major: Unclear boolean names                     │   │
│  │    src/models/user.ts:15 (7 instances)             │   │
│  │    [View Details →]                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Consistency Patterns Detected                              │
│  ✅ Error handling: try-catch used in 85% of async code    │
│  ✅ Import style: ES modules used consistently              │
│  ⚠️  Naming: Mixed camelCase/snake_case in 12% of files    │
│  ⚠️  Async patterns: Callbacks still used in legacy code   │
│                                                              │
│  [View Detailed Report →]  [Run New Analysis]               │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Charts:** D3.js, Chart.js, Plotly.js
- **State:** Zustand + TanStack Query
- **Auth:** NextAuth.js (with JWT)
- **Hosting:** AWS(aiready)

### Backend (Serverless)

- **Runtime:** Node.js 20+ (Lambda)
- **API:** API Gateway (REST + WebSocket)
- **Database:** DynamoDB (single table design)
- **Cache:** DAX (DynamoDB Accelerator)
- **Storage:** AWS S3
- **Queue:** SQS + EventBridge
- **IaC:** SST (Serverless Stack Toolkit)

### Infrastructure

- **Hosting:** AWS(aiready) (frontend) + AWS (backend via SST)
- **CDN:** CloudFront (automatic with S3)
- **Monitoring:** Sentry (errors) + CloudWatch (metrics) + Plausible (analytics)
- **Email:** Resend or AWS SES
- **Payments:** Stripe

### Cost Comparison (Monthly)

| Service | 0 Users | 1K Users | 10K Users |
|---------|---------|----------|-----------|
| **Traditional Stack** | | | |
| Express (Railway) | $5 | $20 | $100 |
| PostgreSQL (Railway) | $10 | $30 | $150 |
| Redis (Upstash) | $10 | $20 | $50 |
| **Subtotal** | **$25** | **$70** | **$300** |
| | | | |
| **Serverless Stack** | | | |
| Lambda (requests) | $0 | $2 | $15 |
| DynamoDB (on-demand) | $0 | $3 | $20 |
| API Gateway | $0 | $1 | $10 |
| S3 | $1 | $2 | $5 |
| EventBridge/SQS | $0 | $1 | $5 |
| **Subtotal** | **$1** | **$9** | **$55** |

**Savings:** ~96% at 0 users, ~87% at 1K users, ~82% at 10K users

## 📝 Next Steps

### Immediate (Month 1)

- [ ] Set up Next.js dashboard project with authentication
- [ ] Design DynamoDB single table schema (done ✅)
- [ ] Create SST infrastructure stack
- [ ] Build analysis upload Lambda + API endpoint
- [ ] Implement JWT auth flow with GitHub OAuth
- [ ] Create basic dashboard UI (repo list, run history)

### Short-term (Months 2-3)

- [ ] Add historical trend charts (query DDB time-series)
- [ ] Build recommendation system (Lambda processor)
- [ ] Stripe integration for billing (webhook handler)
- [ ] Email notifications (SES)
- [ ] Beta user onboarding flow
- [ ] Ship open-source visualizer (@aiready/visualizer) (done ✅)

### Long-term (Months 4-12)

- [ ] CI/CD integrations (GitHub Actions, GitLab CI)
- [ ] Real-time WebSocket updates (API Gateway v2)
- [ ] Team collaboration features
- [ ] AI-powered refactoring plans (GPT-4 integration)
- [ ] Enterprise features (SSO, RBAC, custom rules)
- [ ] Benchmarking engine (aggregate metrics across repos)

---

## 🤖 Phase 2: AI Consulting SaaS with Human-in-the-Loop Agentic Collaboration

### Strategic Pivot: From Detection to Remediation

**Current State (Phase 1 Complete):**
- ✅ OSS tools detect AI code debt (patterns, context, consistency)
- ✅ Unified CLI with AI Readiness scoring
- ✅ Visualization for understanding problems
- ❌ Gap: Users must manually fix detected issues

**Phase 2 Vision:**
> **"AI Code Debt Remediation as a Service"** — A platform where AI agents detect AND fix code debt, with human experts providing oversight, quality assurance, and strategic guidance.

### The Problem We're Solving

**Pain Point:** Teams adopting AI coding tools (Copilot, Cursor, Claude Code) accumulate technical debt faster than they can fix it:
- 3-5x productivity gains → 10x debt accumulation
- AI generates semantically similar code with different syntax
- Context fragmentation makes AI suggestions worse over time
- Traditional tools (linters, SonarQube) don't detect AI-specific issues

**Market Gap:** No existing solution offers:
1. AI-specific code debt detection (we have this ✅)
2. Automated remediation with human oversight
3. Continuous monitoring + proactive fixes
4. Expert guidance for architectural decisions

### Product Architecture: Human-in-the-Loop Agentic System

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AIReady Agentic Platform                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐         │
│  │  DETECTION   │────▶│  ANALYSIS    │────▶│  PRIORITIZE  │         │
│  │  AGENTS      │     │  AGENTS      │     │  AGENT       │         │
│  │              │     │              │     │              │         │
│  │ • Patterns   │     │ • Impact     │     │ • ROI-based  │         │
│  │ • Context    │     │ • Risk       │     │ • Effort est │         │
│  │ • Consistency│     │ • Dependencies│    │ • Auto-sched │         │
│  └──────────────┘     └──────────────┘     └──────────────┘         │
│         │                                           │                │
│         ▼                                           ▼                │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                    HUMAN REVIEW QUEUE                     │       │
│  │                                                            │       │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │       │
│  │  │ Expert AI   │  │ Customer    │  │ Platform    │        │       │
│  │  │ Consultant  │  │ Team        │  │ Auto-approve│        │       │
│  │  │             │  │             │  │ (low risk)  │        │       │
│  │  │ $150-300/hr │  │ Self-serve  │  │ Rules-based │        │       │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │       │
│  └──────────────────────────────────────────────────────────┘       │
│         │                                           │                │
│         ▼                                           ▼                │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐         │
│  │  REMEDIATION │────▶│  VALIDATION  │────▶│  DEPLOYMENT  │         │
│  │  AGENTS      │     │  AGENTS      │     │  OPTIONS     │         │
│  │              │     │              │     │              │         │
│  │ • Refactor   │     │ • Test run   │     │ • PR create  │         │
│  │ • Consolidate│     │ • Type check │     │ • Auto-merge │         │
│  │ • Rename     │     │ • AI review  │     │ • Schedule   │         │
│  │ • Restructure│     │ • Human sign │     │ • Rollback   │         │
│  └──────────────┘     └──────────────┘     └──────────────┘         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Agent Types & Responsibilities

#### 1. Detection Agents (Already Built ✅)
- **Pattern-Detect Agent:** Finds semantic duplicates
- **Context-Analyzer Agent:** Identifies import chain issues
- **Consistency Agent:** Detects naming/pattern inconsistencies

#### 2. Analysis Agents (New - Phase 2a)
- **Impact Agent:** Estimates token savings, AI comprehension improvement
- **Risk Agent:** Assesses change complexity, potential breaking changes
- **Dependency Agent:** Maps affected files, suggests safe refactoring order

#### 3. Prioritization Agent (New - Phase 2a)
- **ROI Calculator:** Ranks issues by impact/effort ratio
- **Effort Estimator:** Predicts time/complexity for each fix
- **Auto-Scheduler:** Plans remediation sprints

#### 4. Remediation Agents (New - Phase 2b)
- **Refactor Agent:** Consolidates duplicate code
- **Rename Agent:** Standardizes naming conventions
- **Restructure Agent:** Flattens import chains
- **Documentation Agent:** Updates docs to match code changes

#### 5. Validation Agents (New - Phase 2b)
- **Test Agent:** Runs test suite, reports failures
- **Type Agent:** TypeScript type checking
- **AI-Review Agent:** Asks AI to review changes for correctness
- **Human Sign-off:** Queues for human approval

### Human-in-the-Loop Model

#### Review Tiers

| Tier | Who | When | SLA | Cost |
|------|-----|------|-----|------|
| **Auto** | Platform (rules-based) | Low risk, < 50 lines | Instant | Included |
| **Team** | Customer's team | Medium risk, any size | Self-serve | Included |
| **Expert** | AIReady consultant | High risk, architecture | 24-48h | $150-300/hr |
| **Enterprise** | Dedicated engineer | Critical systems | 4h SLA | Contract |

#### Risk Classification

```typescript
interface RemediationRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    linesChanged: number;        // <50: low, 50-200: medium, >200: high
    filesAffected: number;       // 1-3: low, 4-10: medium, >10: high
    testCoverage: number;        // >80%: low, 50-80%: medium, <50%: high
    hasTypeCheck: boolean;       // yes: reduces risk
    isPublicAPI: boolean;        // yes: increases risk
    dependencyDepth: number;     // deeper = higher risk
  };
  autoApprovalEligible: boolean; // low risk + rules met
}
```

### Revenue Model: Consulting + SaaS Hybrid

#### Tier 1: Self-Service Platform ($49-199/mo)
- AI agents detect issues
- Auto-remediation for low-risk fixes
- Team review queue
- Historical trends
- 5 AI remediation requests/mo included

#### Tier 2: Expert Review Add-On ($150-300/hr)
- Human AI consultant reviews complex fixes
- Architectural guidance
- Custom remediation strategies
- Pair programming sessions
- Training for team

#### Tier 3: Enterprise Managed Service ($2,000-10,000/mo)
- Dedicated AI transformation engineer
- Weekly remediation sprints
- Custom rules and policies
- Quarterly AI readiness reviews
- Priority support

### Competitive Differentiation

| Feature | AIReady | SonarQube | Cursor | Copilot |
|---------|---------|-----------|--------|---------|
| AI-specific debt detection | ✅ | ❌ | ❌ | ❌ |
| Semantic duplicate detection | ✅ | ❌ | ❌ | ❌ |
| Context budget optimization | ✅ | ❌ | ❌ | ❌ |
| Automated remediation | ✅ | ❌ | Partial | ❌ |
| Human expert review | ✅ | ❌ | ❌ | ❌ |
| Continuous monitoring | ✅ | ✅ | ❌ | ❌ |
| Team benchmarking | ✅ | Partial | ❌ | ❌ |

### Go-to-Market: Phase 2

#### Month 1-2: MVP Agentic Platform
- [ ] Build remediation agents (consolidate, rename, restructure)
- [ ] Implement human review queue
- [ ] Create risk classification system
- [ ] Auto-PR creation for approved fixes

#### Month 3-4: Expert Network Launch
- [ ] Recruit 3-5 AI engineering consultants
- [ ] Build consultant dashboard
- [ ] Implement billing/time tracking
- [ ] Launch "AI Code Health Check" service ($499 one-time)

#### Month 5-6: Enterprise Features
- [ ] Custom remediation policies
- [ ] Integration with Jira/Linear
- [ ] Slack/Teams notifications
- [ ] White-label reports

### Success Metrics

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Platform MRR | $2,000 | $8,000 | $25,000 |
| Consulting revenue | $5,000 | $20,000 | $50,000 |
| Auto-remediations/mo | 100 | 500 | 2,000 |
| Expert reviews/mo | 10 | 50 | 150 |
| NPS score | >40 | >50 | >60 |

### Pricing Summary

| Plan | Price | Includes |
|------|-------|----------|
| **Developer** | $49/mo | Detection + 5 auto-remediations + trends |
| **Team** | $199/mo | Above + unlimited auto-remediations + team features |
| **Expert Review** | $150-300/hr | Human consultant for complex fixes |
| **Enterprise** | $2,000+/mo | Dedicated engineer + custom policies + SLA |

---

**Status:** Phase 1 complete. Phase 2 planning ready for implementation.
**Strategic Approach:** Open Source Detection + SaaS Remediation + Expert Consulting
**Architecture:** Serverless (Lambda + DynamoDB + SST) + Agentic AI
**Target:** $177K ARR Year 1 (Phase 1), $500K ARR Year 2 (Phase 2), $2M+ ARR Year 3
