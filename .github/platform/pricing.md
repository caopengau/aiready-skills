# Pricing Tiers

> Plan limits, feature gating, and add-on pricing.

---

## Free — $0/month

**Limits:**
- 1 team
- 3 repositories
- 10 analysis runs/month
- 7-day data retention

**Features:**
- Full open-source CLI tools (pattern-detect, context-analyzer, consistency)
- Local visualization
- JSON/HTML export

**Value prop:** Try before you buy, personal projects and solo devs.

---

## Pro — $49/month

**Includes everything in Free, plus:**
- Unlimited repositories
- Unlimited analysis runs
- 90-day data retention
- Historical trends & charts
- Team benchmarking (compare against similar repos)
- 5 AI-generated refactoring plans/month
- Slack/Discord webhooks
- Email support

**Value prop:** Teams serious about maintaining AI-friendly code quality.

---

## Enterprise — Custom (starts at $499/month)

**Includes everything in Pro, plus:**
- Unlimited teams/users
- Unlimited refactoring plans
- 1-year+ data retention
- CI/CD integration (GitHub Actions, GitLab CI)
- Custom thresholds & rules
- API access for custom integrations
- Dedicated account manager
- Priority support with SLA
- On-premise deployment option

**Value prop:** Large organizations with compliance requirements or strategic AI adoption programs.

---

## Expert Review Add-On — $150–300/hr

Human AI consultant reviews complex remediations:
- Architectural guidance
- Custom remediation strategies
- Pair programming sessions
- Team training

Available to Pro and Enterprise customers.

---

## Add-Ons

| Add-On | Price | Plan |
|--------|-------|------|
| Extra repositories | $5/repo/month | Pro |
| Extended retention (+90 days) | $10/month | Pro |
| White-label reports | $100/month | Enterprise |

---

## Plan Comparison

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Teams | 1 | 1 | Unlimited |
| Repositories | 3 | Unlimited | Unlimited |
| Runs/month | 10 | Unlimited | Unlimited |
| Data retention | 7 days | 90 days | 1 year+ |
| Historical trends | ❌ | ✅ | ✅ |
| Team benchmarking | ❌ | ✅ | ✅ |
| AI refactoring plans | ❌ | 5/mo | Unlimited |
| CI/CD integration | ❌ | ❌ | ✅ |
| Custom rules | ❌ | ❌ | ✅ |
| API access | ❌ | ❌ | ✅ |
| SLA support | ❌ | Email | 4h SLA |
| SSO | ❌ | ❌ | ✅ |

---

## Feature Gating (Code Reference)

Plan hierarchy enforced at the Lambda middleware layer (see [auth.md](./auth.md)):

```typescript
const planHierarchy = { free: 0, pro: 1, enterprise: 2 };

// Usage: require Pro or above
await withAuth(event, 'pro');
```

Limit enforcement happens in individual Lambda handlers by checking JWT `plan` + querying subscription record.
