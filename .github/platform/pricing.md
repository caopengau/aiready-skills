# Pricing Tiers

> Plan limits, feature gating, and add-on pricing.

---

## Free — $0/month ✅ AVAILABLE NOW

**Limits:**
- 1 team
- 3 repositories
- 10 analysis runs/month
- 7-day data retention

**Features:**
- Full open-source CLI tools (pattern-detect, context-analyzer, consistency)
- Local visualization
- JSON/HTML export
- GitHub OAuth signup

**Value prop:** Get started immediately — no credit card required. Perfect for personal projects and trying out AIReady.

---

## Pro — $49/month 🚧 COMING SOON

**Includes everything in Free, plus:**
- 10 repositories
- Unlimited analysis runs
- 90-day data retention
- Historical trends & charts
- 5 AI-generated refactoring plans/month
- Slack/Discord webhooks
- Email support

**Value prop:** Individual developers and small projects serious about AI-friendly code quality.

*Join the waitlist: team@getaiready.dev*

---

## Team — $99/month 🚧 COMING SOON

**Includes everything in Pro, plus:**
- Unlimited repositories
- Unlimited team members
- Team benchmarking (compare against similar repos)
- 20 AI-generated refactoring plans/month
- CI/CD integration (GitHub Actions, GitLab CI)
- **PR Gatekeeper Mode** — Block merges that break your AI context budget
- Team dashboard with aggregated metrics
- Priority email support

**Value prop:** Self-serve team plan with CI/CD gatekeeper — avoid the procurement nightmare while getting enterprise-grade protection.

*Join the waitlist: team@getaiready.dev*

---

## Enterprise — Custom (starts at $299/month) 🚧 COMING SOON

**Includes everything in Team, plus:**
- Unlimited teams/users
- Unlimited refactoring plans
- 1-year+ data retention
- Custom thresholds & rules
- API access for custom integrations
- Dedicated account manager
- Priority support with SLA
- On-premise deployment option

**Value prop:** Large organizations with compliance requirements or strategic AI adoption programs.

*Contact us: enterprise@getaiready.dev*

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

| Feature | Free | Pro | Team | Enterprise |
|---------|------|-----|------|------------|
| Price | $0 | $49/mo | $99/mo | $299+/mo |
| Teams | 1 | 1 | 1 | Unlimited |
| Team members | 1 | 1 | Unlimited | Unlimited |
| Repositories | 3 | 10 | Unlimited | Unlimited |
| Runs/month | 10 | Unlimited | Unlimited | Unlimited |
| Data retention | 7 days | 90 days | 90 days | 1 year+ |
| Historical trends | ❌ | ✅ | ✅ | ✅ |
| Team benchmarking | ❌ | ❌ | ✅ | ✅ |
| AI refactoring plans | ❌ | 5/mo | 20/mo | Unlimited |
| CI/CD integration | ❌ | ❌ | ✅ | ✅ |
| **PR Gatekeeper** | ❌ | ❌ | ✅ | ✅ |
| Custom rules | ❌ | ❌ | ❌ | ✅ |
| API access | ❌ | ❌ | ❌ | ✅ |
| SLA support | ❌ | Email | 24h | 4h |
| SSO | ❌ | ❌ | ❌ | ✅ |
| Dedicated account manager | ❌ | ❌ | ❌ | ✅ |

---

## Feature Gating (Code Reference)

Plan hierarchy enforced at the Lambda middleware layer (see [auth.md](./auth.md)):

```typescript
const planHierarchy = { free: 0, pro: 1, team: 2, enterprise: 3 };

// Usage: require Team or above for CI/CD gatekeeper
await withAuth(event, 'team');
```

Limit enforcement happens in individual Lambda handlers by checking JWT `plan` + querying subscription record.
