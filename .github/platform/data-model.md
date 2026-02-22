# Data Model — DynamoDB Single Table Design

> Source of truth: `platform/src/lib/db.ts`

## Table Configuration

```
Table Name: aiready-platform (env: DYNAMO_TABLE)
Billing Mode: PAY_PER_REQUEST (on-demand)
Region: ap-southeast-2

Primary Key:
  PK (String) — Partition Key
  SK (String) — Sort Key

GSI1: (owner/membership lookups)
  GSI1PK (String)
  GSI1SK (String)

GSI2: (entity-scoped list queries)
  GSI2PK (String)
  GSI2SK (String)

Note: TTL not yet configured — all records persist until manually deleted.
```

---

## Key Patterns

| Entity | PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK |
|--------|----|----|--------|--------|--------|--------|
| User | `USER#<id>` | `#METADATA` | `USERS` | `<email>` | — | — |
| Team | `TEAM#<id>` | `#METADATA` | `TEAMS` | `<slug>` | — | — |
| Team Member | `TEAM#<teamId>` | `#MEMBER#<userId>` | `TEAM#<teamId>` | `MEMBER#<userId>` | — | — |
| Repository | `REPO#<id>` | `#METADATA` | `USER#<userId>` or `TEAM#<teamId>` | `REPO#<id>` | — | — |
| Analysis | `ANALYSIS#<repoId>` | `<timestamp>` | `USER#<userId>` | `ANALYSIS#<ts>` | `ANALYSIS#<repoId>` | `<timestamp>` |
| Remediation | `REMEDIATION#<id>` | `#METADATA` | `USER#<userId>` or `TEAM#<teamId>` | `REMEDIATION#<id>` | `REMEDIATION#<repoId>` | `<createdAt>` |
| Magic Link | `MAGICLINK#<token>` | `#METADATA` | — | — | — | — |

---

## Access Patterns

| # | Pattern | Query |
|---|---------|-------|
| 1 | Get user by ID | Table `PK=USER#<id>` `SK=#METADATA` |
| 2 | Get user by email | GSI1 `GSI1PK=USERS` `GSI1SK=<email>` |
| 3 | Get team by ID | Table `PK=TEAM#<id>` `SK=#METADATA` |
| 4 | Get team by slug | GSI1 `GSI1PK=TEAMS` `GSI1SK=<slug>` |
| 5 | List team members | Table `PK=TEAM#<id>` `SK begins_with #MEMBER#` |
| 6 | Get repo by ID | Table `PK=REPO#<id>` `SK=#METADATA` |
| 7 | List repos for user | GSI1 `GSI1PK=USER#<id>` `GSI1SK begins_with REPO#` |
| 8 | List repos for team | GSI1 `GSI1PK=TEAM#<id>` `GSI1SK begins_with REPO#` |
| 9 | List analyses for repo (newest first) | Table `PK=ANALYSIS#<repoId>` `ScanIndexForward=false` |
| 10 | Get latest analysis for repo | Table `PK=ANALYSIS#<repoId>` `Limit=1` `ScanIndexForward=false` |
| 11 | List user's analyses (all repos) | GSI1 `GSI1PK=USER#<id>` `GSI1SK begins_with ANALYSIS#` |
| 12 | List remediations for repo | GSI2 `GSI2PK=REMEDIATION#<repoId>` `ScanIndexForward=false` |
| 13 | List remediations for team | GSI1 `GSI1PK=TEAM#<id>` `GSI1SK begins_with REMEDIATION#` |
| 14 | Get magic link token | Table `PK=MAGICLINK#<token>` `SK=#METADATA` |

---

## Entity Record Examples

### User

```json
{
  "PK": "USER#a1b2c3d4",
  "SK": "#METADATA",
  "GSI1PK": "USERS",
  "GSI1SK": "jane@example.com",
  "id": "a1b2c3d4",
  "email": "jane@example.com",
  "name": "Jane Developer",
  "image": "https://avatars.githubusercontent.com/...",
  "githubId": "12345",
  "teamId": "t1e2a3m4",
  "role": "owner",
  "createdAt": "2026-02-22T10:00:00Z",
  "updatedAt": "2026-02-22T10:00:00Z"
}
```

### Team

```json
{
  "PK": "TEAM#t1e2a3m4",
  "SK": "#METADATA",
  "GSI1PK": "TEAMS",
  "GSI1SK": "acme-engineering",
  "id": "t1e2a3m4",
  "name": "Acme Engineering",
  "slug": "acme-engineering",
  "plan": "pro",
  "stripeCustomerId": "cus_xyz",
  "stripeSubscriptionId": "sub_xyz",
  "memberCount": 3,
  "repoLimit": 20,
  "createdAt": "2026-02-22T10:00:00Z",
  "updatedAt": "2026-02-22T10:00:00Z"
}
```

### Team Member

```json
{
  "PK": "TEAM#t1e2a3m4",
  "SK": "#MEMBER#a1b2c3d4",
  "GSI1PK": "TEAM#t1e2a3m4",
  "GSI1SK": "MEMBER#a1b2c3d4",
  "teamId": "t1e2a3m4",
  "userId": "a1b2c3d4",
  "role": "owner",
  "joinedAt": "2026-02-22T10:00:00Z"
}
```

### Repository

```json
{
  "PK": "REPO#r1e2p3o4",
  "SK": "#METADATA",
  "GSI1PK": "USER#a1b2c3d4",
  "GSI1SK": "REPO#r1e2p3o4",
  "id": "r1e2p3o4",
  "userId": "a1b2c3d4",
  "teamId": "t1e2a3m4",
  "name": "my-project",
  "url": "https://github.com/acme/my-project",
  "defaultBranch": "main",
  "lastAnalysisAt": "2026-02-22T10:30:00Z",
  "aiScore": 72,
  "createdAt": "2026-02-22T10:00:00Z",
  "updatedAt": "2026-02-22T10:30:00Z"
}
```

### Analysis

```json
{
  "PK": "ANALYSIS#r1e2p3o4",
  "SK": "2026-02-22T10:30:00.000Z",
  "GSI1PK": "USER#a1b2c3d4",
  "GSI1SK": "ANALYSIS#2026-02-22T10:30:00.000Z",
  "GSI2PK": "ANALYSIS#r1e2p3o4",
  "GSI2SK": "2026-02-22T10:30:00.000Z",
  "id": "an1a2l3y4",
  "repoId": "r1e2p3o4",
  "userId": "a1b2c3d4",
  "timestamp": "2026-02-22T10:30:00.000Z",
  "aiScore": 72,
  "breakdown": {
    "semanticDuplicates": 65,
    "contextFragmentation": 78,
    "namingConsistency": 80,
    "documentationHealth": 55
  },
  "rawKey": "analyses/a1b2c3d4/r1e2p3o4/2026-02-22T10:30:00.000Z.json",
  "summary": {
    "totalFiles": 42,
    "totalIssues": 18,
    "criticalIssues": 3,
    "warnings": 15
  },
  "createdAt": "2026-02-22T10:30:00Z"
}
```

### Remediation Request

```json
{
  "PK": "REMEDIATION#re1m2e3d4",
  "SK": "#METADATA",
  "GSI1PK": "USER#a1b2c3d4",
  "GSI1SK": "REMEDIATION#re1m2e3d4",
  "GSI2PK": "REMEDIATION#r1e2p3o4",
  "GSI2SK": "2026-02-22T10:35:00Z",
  "id": "re1m2e3d4",
  "repoId": "r1e2p3o4",
  "userId": "a1b2c3d4",
  "type": "consolidation",
  "risk": "medium",
  "status": "pending",
  "title": "Consolidate duplicate API handlers",
  "description": "...",
  "affectedFiles": ["src/api/users.ts", "src/api/auth.ts"],
  "estimatedSavings": 3200,
  "createdAt": "2026-02-22T10:35:00Z",
  "updatedAt": "2026-02-22T10:35:00Z"
}
```

### Magic Link Token

```json
{
  "PK": "MAGICLINK#abc123xyz",
  "SK": "#METADATA",
  "token": "abc123xyz",
  "email": "jane@example.com",
  "expiresAt": "2026-02-22T10:30:00Z",
  "used": false,
  "createdAt": "2026-02-22T10:00:00Z"
}
```

---

## S3 Storage Layout

```
Bucket: aiready-platform-<stage>-AnalysisBucket-xxx  (env: S3_BUCKET)

analyses/
  <userId>/
    <repoId>/
      <timestamp>.json    ← raw AnalysisData from CLI
```

The `rawKey` field on Analysis records contains the full S3 object key.

---

## SST v3 Infrastructure

```typescript
// platform/sst.config.ts
const bucket = new sst.aws.Bucket("AnalysisBucket");

const table = new sst.aws.Dynamo("MainTable", {
  fields: {
    PK: "string", SK: "string",
    GSI1PK: "string", GSI1SK: "string",
    GSI2PK: "string", GSI2SK: "string",
  },
  primaryIndex: { hashKey: "PK", rangeKey: "SK" },
  globalIndexes: {
    GSI1: { hashKey: "GSI1PK", rangeKey: "GSI1SK" },
    GSI2: { hashKey: "GSI2PK", rangeKey: "GSI2SK" },
  },
  // Note: TTL not yet configured
});
```

> **Gap:** TTL attribute is not configured — records accumulate indefinitely. Add plan-based TTL before launch.

---

## Query Examples

```typescript
import { doc, TABLE_NAME } from '@/lib/db';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

// List repos for a user (newest first)
new QueryCommand({
  TableName: TABLE_NAME,
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :prefix)',
  ExpressionAttributeValues: { ':pk': 'USER#a1b2c3d4', ':prefix': 'REPO#' },
  ScanIndexForward: false,
});

// Get latest analysis for a repo
new QueryCommand({
  TableName: TABLE_NAME,
  KeyConditionExpression: 'PK = :pk',
  ExpressionAttributeValues: { ':pk': 'ANALYSIS#r1e2p3o4' },
  Limit: 1,
  ScanIndexForward: false,
});

// List remediations for a repo (newest first)
new QueryCommand({
  TableName: TABLE_NAME,
  IndexName: 'GSI2',
  KeyConditionExpression: 'GSI2PK = :pk',
  ExpressionAttributeValues: { ':pk': 'REMEDIATION#r1e2p3o4' },
  ScanIndexForward: false,
});
