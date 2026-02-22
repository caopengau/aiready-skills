# MVP Free Tier Build Plan

> Build priorities for the Free tier MVP launch. Updated as work progresses.

---

## Overview

**Launch Mode:** Free tier only (no billing)
**Goal:** Validate product-market fit before monetizing
**Timeline:** 4 weeks

---

## ✅ Already Built (Core MVP)

- [x] CLI Tools (`scan`, `patterns`, `context`, `consistency`)
- [x] AI Readiness Score (0-100)
- [x] GitHub OAuth authentication
- [x] Repo management (add/delete repos)
- [x] Analysis upload to SaaS
- [x] Dashboard (repo list, run history, score display)
- [x] GitHub Action (aiready-check)
- [x] Plan-gating middleware

---

## 🔨 Week 1-2: Complete Free Tier Limits

### Priority 1A: Run Limit Enforcement
- [ ] Track runs per user per month in DynamoDB
- [ ] Block uploads after 10 runs/month for free users
- [ ] Show "runs remaining" counter in dashboard
- [ ] Return friendly error when limit reached

### Priority 1B: Repo Limit Enforcement
- [ ] Count repos per user
- [ ] Block repo creation after 3 repos for free users
- [ ] Show "repos remaining" in dashboard
- [ ] Return friendly error when limit reached

### Priority 1C: Data Retention (7 days)
- [ ] Add TTL attribute to analysis records
- [ ] Implement cleanup for old analyses
- [ ] Show "expires in X days" in dashboard

### Priority 1D: Analysis History
- [ ] GET /api/repos/:repoId/runs endpoint
- [ ] Display run history on repo detail page
- [ ] Compare scores across runs

---

## 🔨 Week 3-4: Improve User Experience

### Priority 2A: Dashboard Charts
- [ ] Score breakdown pie chart
- [ ] Tool scores bar chart
- [ ] Issue severity distribution

### Priority 2B: Email Notifications
- [ ] Send "Analysis complete" email via SES
- [ ] Include score summary in email
- [ ] Link to dashboard

### Priority 2C: Error Handling
- [ ] Better error messages for common issues
- [ ] Retry logic for transient failures
- [ ] User-friendly error pages

### Priority 2D: Onboarding Flow
- [ ] Welcome message for new users
- [ ] "Run your first analysis" guide
- [ ] CLI command examples in dashboard

---

## ⏸️ Deferred (For Paid Tiers)

| Feature | Tier | Status |
|---------|------|--------|
| Historical trends | Pro | Deferred |
| Team benchmarking | Team | Deferred |
| AI refactoring plans | Pro+ | Deferred |
| CI/CD gatekeeper in SaaS | Team | Deferred |
| Custom rules | Enterprise | Deferred |

---

## Free Tier Limits Summary

| Limit | Value |
|-------|-------|
| Repos | 3 |
| Runs/month | 10 |
| Retention | 7 days |
| Team members | 1 |

---

## When to Enable Paid Tiers

1. 500+ active free users
2. Clear demand signal (users hitting limits)
3. Stripe products/prices configured
4. Payment flow tested

To enable: Set `MVP_FREE_ONLY = false` in `platform/src/lib/plans.ts`

---

*Last updated: 2026-02-22*