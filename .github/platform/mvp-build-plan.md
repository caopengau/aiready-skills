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

- [x] Track runs per user per month in DynamoDB
- [x] Block uploads after 10 runs/month for free users
- [x] Show "runs remaining" counter in dashboard
- [x] Return friendly error when limit reached

### Priority 1B: Repo Limit Enforcement

- [x] Count repos per user
- [x] Block repo creation after 3 repos for free users
- [x] Show "repos remaining" in dashboard
- [x] Return friendly error when limit reached

### Priority 1C: Data Retention (7 days)

- [x] Add TTL attribute to analysis records
- [x] Enable TTL on DynamoDB table
- [x] Set 7-day expiration on new analyses
- [ ] Show "expires in X days" in dashboard

### Priority 1D: Analysis History

- [x] GET /api/analysis/upload endpoint with history
- [x] Include expiry info (daysUntilExpiry)
- [x] Return limits info with each response
- [ ] Display run history on repo detail page
- [ ] Compare scores across runs

---

## 🔨 Week 3-4: Improve User Experience

### Priority 2A: Dashboard Charts

- [x] Limits banner showing repos and runs remaining
- [x] Free plan label with upgrade link
- [ ] Score breakdown pie chart (deferred)
- [ ] Tool scores bar chart (deferred)

### Priority 2B: Email Notifications

- [x] Create email.ts with SES integration
- [x] Send "Analysis complete" email via SES
- [x] Include score summary in email
- [x] Link to dashboard
- [x] Welcome email template

### Priority 2C: Error Handling

- [x] Error boundary component (error.tsx)
- [x] 404 page (not-found.tsx)
- [x] Loading state component (loading.tsx)
- [ ] Retry logic for transient failures (deferred)

### Priority 2D: Onboarding Flow

- [x] Onboarding component with step-by-step guide
- [x] Welcome message for new users
- [x] "Run your first analysis" guide
- [x] CLI command examples in onboarding

---

## ⏸️ Deferred (For Paid Tiers)

| Feature                  | Tier       | Status   |
| ------------------------ | ---------- | -------- |
| Historical trends        | Pro        | Deferred |
| Team benchmarking        | Team       | Deferred |
| AI refactoring plans     | Pro+       | Deferred |
| CI/CD gatekeeper in SaaS | Team       | Deferred |
| Custom rules             | Enterprise | Deferred |

---

## Free Tier Limits Summary

| Limit        | Value  |
| ------------ | ------ |
| Repos        | 3      |
| Runs/month   | 10     |
| Retention    | 7 days |
| Team members | 1      |

---

## When to Enable Paid Tiers

1. 500+ active free users
2. Clear demand signal (users hitting limits)
3. Stripe products/prices configured
4. Payment flow tested

To enable: Set `MVP_FREE_ONLY = false` in `platform/src/lib/plans.ts`

---

_Last updated: 2026-02-22_
