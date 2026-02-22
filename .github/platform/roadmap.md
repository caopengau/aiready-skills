# Platform Roadmap

> Implementation tasks broken down by timeframe. Update status here as work progresses.

---

## Immediate — Month 1 (MVP SaaS)

### CI/CD Gatekeeper (Strategic Priority)
- [x] Add `--ci` flag to CLI for GitHub Actions integration
- [x] Add `--fail-on` option for granular control (critical, major, any)
- [x] Output GitHub Actions annotations for PR checks
- [x] Block PRs that don't meet threshold with remediation steps
- [ ] Create GitHub Action marketplace action (aiready-action)
- [ ] Add GitLab CI template

### Pricing & Plans (Strategic Update)
- [x] Add Team plan at $99/mo (self-serve, avoids Enterprise procurement)
- [x] Move CI/CD integration from Enterprise to Team plan
- [x] Update plan comparison table
- [ ] Update Stripe products/prices in platform
- [ ] Update billing middleware for `team` plan level

### Infrastructure & Data
- [ ] Create SST project in `platform/` (see [data-model.md](./data-model.md) for full SST definition)
- [ ] Provision DynamoDB single table (`aiready-saas`) with GSI1, GSI2, TTL
- [ ] Provision S3 bucket for raw analysis JSON
- [ ] Set up EventBridge bus + SQS queues
- [ ] Configure CloudWatch monitoring + Sentry
- [ ] Set Lambda reserved concurrency (50) for Enterprise scale

### Auth
- [ ] Implement GitHub OAuth with NextAuth.js (see [auth.md](./auth.md))
- [ ] JWT issuance + refresh Lambda
- [ ] Plan-gating middleware (`withAuth`)

### Analysis Pipeline
- [ ] `POST /analysis/upload` Lambda — validate, store in S3, write DDB run record, emit event
- [ ] Processing Lambda — extract metrics, compute trends, write daily metric records
- [ ] `GET /repos/:repoId/runs` + `GET /runs/:runId` endpoints

### Dashboard UI
- [ ] Basic repo list page (connect to teams + repos APIs)
- [ ] Run history list per repo
- [ ] Single run detail view (JSON summary, file breakdown)

---

## Short-term — Months 2–3

### Metrics & Trends
- [ ] Historical trend charts (query DDB `METRIC#<tool>#<date>` range)
- [ ] `GET /repos/:repoId/metrics` endpoint with tool + date range filters
- [ ] Chart components using D3.js / Chart.js (see [ui-wireframes.md](./ui-wireframes.md))

### Recommendations
- [ ] Recommendation generation Lambda (fires after metrics computed)
- [ ] `GET /repos/:repoId/recommendations` + `PATCH /recommendations/:recId` endpoints
- [ ] Recommendation list UI with severity filtering

### Billing
- [ ] Stripe integration: subscription creation, webhook handler, portal link
- [ ] Plan enforcement in Lambda middleware (Free tier limits)
- [ ] Upgrade prompts in dashboard for locked features

### Growth
- [ ] Beta user onboarding flow
- [ ] Email notifications via Resend / SES
- [ ] `@aiready/visualizer` ship (✅ done)

---

## Medium-term — Months 4–6

### Phase 2a: Analysis Agents
- [ ] Impact Agent — estimate token savings per recommendation
- [ ] Risk Agent — classify remediation risk level
- [ ] Dependency Agent — safe refactoring order
- [ ] Prioritization Agent — ROI-ranked remediation queue

### CI/CD Integration
- [ ] GitHub Actions workflow: `aiready analyze && aiready upload`
- [ ] Status checks: block merge if AI readiness score drops
- [ ] GitLab CI equivalent

### Benchmarking
- [ ] `GET /repos/:repoId/benchmarks` — compare against anonymized repo cohort
- [ ] Aggregate metrics pipeline (aggregate across opted-in repos)

---

## Long-term — Months 7–12

### Phase 2b: Remediation Agents
- [ ] Refactor Agent (consolidate duplicates)
- [ ] Rename Agent (standardize naming)
- [ ] Restructure Agent (flatten import chains)
- [ ] Validation Agents (test + type check + AI review)
- [ ] Auto-PR creation for approved low-risk remediations
- [ ] Human review queue UI (team + expert tiers)

### Enterprise Features
- [ ] SSO (SAML/OIDC)
- [ ] RBAC (owner / admin / member / read-only)
- [ ] Custom rules and thresholds
- [ ] on-premise deployment option
- [ ] Dedicated account manager workflow

### Platform
- [ ] Real-time WebSocket updates (API Gateway v2) for run progress
- [ ] Team collaboration (comments on recommendations, assignment)
- [ ] Jira / Linear integration
- [ ] White-label reports

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01 | Serverless (Lambda + DynamoDB) over Express + PostgreSQL | ~90% cost savings at low user counts, zero ops burden |
| 2026-01 | Single-table DynamoDB design | Eliminates JOINs, serves all 15 access patterns from one table |
| 2026-01 | SST for IaC | Already in use for landing, consistent toolchain |
| 2026-02 | Phase 2 = agentic remediation + consulting hybrid | Closes gap between detection and fix; unique market position |
