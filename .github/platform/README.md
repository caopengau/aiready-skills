# AIReady Platform

> **Hub doc — start here.** Private SaaS platform for AI Code Debt Remediation with Human-in-the-Loop Agentic Collaboration.

## Product Overview

The AIReady Platform extends the open-source CLI tools with a hosted SaaS layer:

| Tier              | What it adds                                      | Price       |
| ----------------- | ------------------------------------------------- | ----------- |
| **Free CLI**      | Open source detection + local visualization       | $0          |
| **Pro SaaS**      | Historical trends, 10 repos, individual use       | $49/mo      |
| **Team SaaS**     | CI/CD gatekeeper, unlimited repos, team analytics | $99/mo      |
| **Enterprise**    | Custom rules, SSO, dedicated support              | $299+/mo    |
| **Expert Review** | Human consultant for complex remediations         | $150-300/hr |

**Strategic approach:** Core analysis tools remain open source (MIT). Revenue comes from the hosted platform.

---

## Spoke Documents

| Doc                                          | What it covers                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [architecture.md](./architecture.md)         | System components, data flow, serverless rationale, cost comparison                           |
| [data-model.md](./data-model.md)             | DynamoDB single-table design, access patterns, entity schemas, TTL, query examples, SST infra |
| [auth.md](./auth.md)                         | OAuth flow, JWT lifecycle, plan-gating middleware                                             |
| [api.md](./api.md)                           | All API endpoints with request/response shapes                                                |
| [pricing.md](./pricing.md)                   | Tier limits, add-ons, value props                                                             |
| [revenue.md](./revenue.md)                   | Target metrics, conversion funnel, acquisition, retention, go-to-market phases                |
| [ui-wireframes.md](./ui-wireframes.md)       | Dashboard, repo detail, and consistency analysis wireframes                                   |
| [phase2-agentic.md](./phase2-agentic.md)     | Agentic remediation platform, human-in-the-loop model, consulting revenue                     |
| [roadmap.md](./roadmap.md)                   | Immediate, short-term, and long-term implementation tasks                                     |
| [agents/](./agents/)                         | Agent system detail (detection, analysis, remediation, validation)                            |
| [components-audit.md](./components-audit.md) | Shared UI component inventory and design system status                                        |

---

## Platform Code Layout

```
platform/
├── app/
│   ├── (auth)/        # GitHub OAuth, session management
│   ├── (dashboard)/   # Main application
│   └── api/           # REST endpoints
├── lib/
│   ├── auth.ts        # NextAuth.js configuration
│   ├── billing.ts     # Stripe integration
│   └── db.ts          # DynamoDB client
└── sst.config.ts      # AWS infrastructure (see data-model.md for full definition)
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Run locally
pnpm --filter platform dev

# Deploy to AWS
cd platform && pnpm sst deploy --stage development
```

## Current Status

- **Phase 1:** ✅ Complete — CLI tools, visualizer, unified scoring, landing site, blog
- **Phase 2:** 🔜 SaaS MVP + agentic remediation platform (see [roadmap.md](./roadmap.md))

## Related Docs

- [OSS Tools](../copilot-instructions.md) — Open source packages
- [Development Workflow](../sub-instructions/development-workflow.md) — Contributing guide
- [Plans](../plans/) — Other planning documents
