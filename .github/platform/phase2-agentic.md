# Phase 2: Agentic Remediation Platform

> Human-in-the-Loop AI system that detects AND fixes AI code debt, with expert oversight for complex changes.

See [agents/README.md](./agents/README.md) for agent implementation detail.

---

## Strategic Context

**Phase 1 (done):** OSS tools detect AI code debt. Users must manually fix issues.

**Phase 2 vision:** _"AI Code Debt Remediation as a Service"_ — AI agents fix detected issues, with human experts providing oversight and architectural guidance.

**Pain point:** Teams using Copilot/Cursor/Claude Code accumulate debt 10x faster than they can fix it. No existing tool offers:

1. AI-specific debt detection ✅ (we have this)
2. Automated remediation with human oversight ← Phase 2
3. Continuous monitoring + proactive fixes ← Phase 2
4. Expert guidance for architectural decisions ← Phase 2

---

## Agentic System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AIReady Agentic Platform                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐         │
│  │  DETECTION   │────▶│  ANALYSIS    │────▶│  PRIORITIZE  │         │
│  │  AGENTS ✅   │     │  AGENTS 2a   │     │  AGENT 2a    │         │
│  │              │     │              │     │              │         │
│  │ • Patterns   │     │ • Impact     │     │ • ROI-based  │         │
│  │ • Context    │     │ • Risk       │     │ • Effort est │         │
│  │ • Consistency│     │ • Dependencies│    │ • Auto-sched │         │
│  └──────────────┘     └──────────────┘     └──────────────┘         │
│         │                                           │                │
│         ▼                                           ▼                │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                    HUMAN REVIEW QUEUE                     │       │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │       │
│  │  │ Expert AI   │  │ Customer    │  │ Platform    │        │       │
│  │  │ Consultant  │  │ Team        │  │ Auto-approve│        │       │
│  │  │ $150-300/hr │  │ Self-serve  │  │ (low risk)  │        │       │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │       │
│  └──────────────────────────────────────────────────────────┘       │
│         │                                           │                │
│         ▼                                           ▼                │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐         │
│  │  REMEDIATION │────▶│  VALIDATION  │────▶│  DEPLOYMENT  │         │
│  │  AGENTS 2b   │     │  AGENTS 2b   │     │  2b          │         │
│  │ • Refactor   │     │ • Test run   │     │ • PR create  │         │
│  │ • Consolidate│     │ • Type check │     │ • Auto-merge │         │
│  │ • Rename     │     │ • AI review  │     │ • Schedule   │         │
│  │ • Restructure│     │ • Human sign │     │ • Rollback   │         │
│  └──────────────┘     └──────────────┘     └──────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Agent Types

### 1. Detection Agents — ✅ Built (OSS packages)

| Agent            | Package                     | Detects                            |
| ---------------- | --------------------------- | ---------------------------------- |
| Pattern-Detect   | `@aiready/pattern-detect`   | Semantic duplicates                |
| Context-Analyzer | `@aiready/context-analyzer` | Import chains, context budget      |
| Consistency      | `@aiready/consistency`      | Naming and pattern inconsistencies |

### 2. Analysis Agents — Phase 2a

| Agent                | Input                     | Output                                         |
| -------------------- | ------------------------- | ---------------------------------------------- |
| **Impact Agent**     | Detection results         | Token savings estimate, AI comprehension delta |
| **Risk Agent**       | File list + test coverage | Risk level, breaking change probability        |
| **Dependency Agent** | File graph                | Safe refactoring order, affected files         |

### 3. Prioritization Agent — Phase 2a

- **ROI Calculator:** Ranks issues by impact/effort ratio
- **Effort Estimator:** Predicts time and complexity per fix
- **Auto-Scheduler:** Builds remediation sprint plan

### 4. Remediation Agents — Phase 2b

| Agent                   | Action                             |
| ----------------------- | ---------------------------------- |
| **Refactor Agent**      | Consolidates duplicate code        |
| **Rename Agent**        | Standardizes naming conventions    |
| **Restructure Agent**   | Flattens deep import chains        |
| **Documentation Agent** | Updates docs to match code changes |

### 5. Validation Agents — Phase 2b

| Agent               | Check                                     |
| ------------------- | ----------------------------------------- |
| **Test Agent**      | Runs test suite, reports failures         |
| **Type Agent**      | TypeScript type checking (`tsc --noEmit`) |
| **AI-Review Agent** | LLM reviews change for correctness        |
| **Human Sign-off**  | Queues for human approval                 |

---

## Human-in-the-Loop Review Tiers

| Tier           | Who reviews        | When                    | SLA        | Cost        |
| -------------- | ------------------ | ----------------------- | ---------- | ----------- |
| **Auto**       | Platform rules     | Low risk, < 50 lines    | Instant    | Included    |
| **Team**       | Customer's team    | Medium risk, any size   | Self-serve | Included    |
| **Expert**     | AIReady consultant | High risk, architecture | 24–48h     | $150–300/hr |
| **Enterprise** | Dedicated engineer | Critical systems        | 4h SLA     | Contract    |

### Risk Classification

```typescript
interface RemediationRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    linesChanged: number; // <50: low, 50-200: medium, >200: high
    filesAffected: number; // 1-3: low, 4-10: medium, >10: high
    testCoverage: number; // >80%: low, 50-80%: medium, <50%: high
    hasTypeCheck: boolean; // true: reduces risk
    isPublicAPI: boolean; // true: increases risk
    dependencyDepth: number; // deeper = higher risk
  };
  autoApprovalEligible: boolean; // low risk + all rules met
}
```

---

## Revenue Model: Consulting + SaaS Hybrid

### Tier 1: Self-Service Platform ($49–199/mo)

- AI agents detect issues
- Auto-remediation for low-risk fixes
- Team review queue
- Historical trends
- 5 AI remediation requests/month included

### Tier 2: Expert Review Add-On ($150–300/hr)

- Human AI consultant reviews complex fixes
- Architectural guidance and custom remediation strategies
- Pair programming sessions
- Team training

### Tier 3: Enterprise Managed Service ($2,000–10,000/mo)

- Dedicated AI transformation engineer
- Weekly remediation sprints
- Custom rules and policies
- Quarterly AI readiness reviews
- Priority support

---

## Competitive Positioning

| Feature                      | AIReady | SonarQube | Cursor  | Copilot |
| ---------------------------- | ------- | --------- | ------- | ------- |
| AI-specific debt detection   | ✅      | ❌        | ❌      | ❌      |
| Semantic duplicate detection | ✅      | ❌        | ❌      | ❌      |
| Context budget optimization  | ✅      | ❌        | ❌      | ❌      |
| Automated remediation        | ✅      | ❌        | Partial | ❌      |
| Human expert review          | ✅      | ❌        | ❌      | ❌      |
| Continuous monitoring        | ✅      | ✅        | ❌      | ❌      |
| Team benchmarking            | ✅      | Partial   | ❌      | ❌      |

---

## Phase 2 Go-to-Market

### Months 1–2: MVP Agentic Platform

- [ ] Build remediation agents (consolidate, rename, restructure)
- [ ] Implement human review queue UI
- [ ] Create risk classification system
- [ ] Auto-PR creation for approved fixes

### Months 3–4: Expert Network Launch

- [ ] Recruit 3–5 AI engineering consultants
- [ ] Build consultant dashboard
- [ ] Implement billing/time tracking
- [ ] Launch "AI Code Health Check" service ($499 one-time)

### Months 5–6: Enterprise Features

- [ ] Custom remediation policies
- [ ] Jira/Linear integration
- [ ] Slack/Teams notifications
- [ ] White-label reports
