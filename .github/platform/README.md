# AIReady Platform Documentation

> Private SaaS platform for AI Code Debt Remediation with Human-in-the-Loop Agentic Collaboration

## Overview

The AIReady Platform extends our open-source detection tools with:
- **Automated Remediation**: AI agents that fix detected issues
- **Human Oversight**: Expert review queue for complex fixes
- **Continuous Monitoring**: Historical trends and proactive alerts
- **Team Collaboration**: Shared dashboards and remediation workflows

## Architecture

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
└── sst.config.ts      # AWS infrastructure
```

## Documentation Index

| Document | Purpose |
|----------|---------|
| [architecture.md](./architecture.md) | Technical architecture, data models, API design |
| [auth.md](./auth.md) | Authentication flow, OAuth, JWT handling |
| [billing.md](./billing.md) | Stripe integration, subscription management |
| [agents/](./agents/) | Agentic system documentation |
| [api/](./api/) | API endpoints and webhooks |

## Quick Start

```bash
# Install dependencies
pnpm install

# Run locally
pnpm --filter platform dev

# Deploy to AWS
cd platform && pnpm sst deploy --stage development
```

## Related Docs

- [OSS Tools](../copilot-instructions.md) - Open source packages
- [Development Workflow](../sub-instructions/development-workflow.md) - Contributing guide
- [SaaS Architecture](../plans/saas-architecture.md) - Full architecture specification