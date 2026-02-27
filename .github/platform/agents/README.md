# Agentic System

> AI agents for detection, analysis, prioritization, and remediation

## Agent Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AIReady Agentic Platform                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐         │
│  │  DETECTION   │────▶│  ANALYSIS    │────▶│  PRIORITIZE  │         │
│  │  AGENTS      │     │  AGENTS      │     │  AGENT       │         │
│  │  ✅ Built    │     │  🔜 Phase 2a │     │  🔜 Phase 2a │         │
│  └──────────────┘     └──────────────┘     └──────────────┘         │
│         │                                           │                │
│         ▼                                           ▼                │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                    HUMAN REVIEW QUEUE                     │       │
│  └──────────────────────────────────────────────────────────┘       │
│         │                                           │                │
│         ▼                                           ▼                │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐         │
│  │  REMEDIATION │────▶│  VALIDATION  │────▶│  DEPLOYMENT  │         │
│  │  AGENTS      │     │  AGENTS      │     │  OPTIONS     │         │
│  │  🔜 Phase 2b │     │  🔜 Phase 2b │     │  🔜 Phase 2b │         │
│  └──────────────┘     └──────────────┘     └──────────────┘         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Agent Types

### 1. Detection Agents ✅ (Built)

Located in `packages/` - open source tools.

| Agent            | Package                     | Purpose                        |
| ---------------- | --------------------------- | ------------------------------ |
| Pattern-Detect   | `@aiready/pattern-detect`   | Semantic duplicate detection   |
| Context-Analyzer | `@aiready/context-analyzer` | Import chains, context budget  |
| Consistency      | `@aiready/consistency`      | Naming and pattern consistency |

**Output:** `AnalysisResult[]` with issues, severity, file locations

### 2. Analysis Agents 🔜 (Phase 2a)

| Agent                | Purpose                                    | Input                | Output                                |
| -------------------- | ------------------------------------------ | -------------------- | ------------------------------------- |
| **Impact Agent**     | Estimate token savings, AI comprehension   | Detection results    | Impact score (0-100)                  |
| **Risk Agent**       | Assess change complexity, breaking changes | Detection + codebase | Risk level (low/medium/high/critical) |
| **Dependency Agent** | Map affected files, safe refactoring order | Detection + imports  | Dependency graph, execution order     |

### 3. Prioritization Agent 🔜 (Phase 2a)

| Agent                | Purpose                  | Input             | Output            |
| -------------------- | ------------------------ | ----------------- | ----------------- |
| **ROI Calculator**   | Rank by impact/effort    | Analysis results  | Prioritized queue |
| **Effort Estimator** | Predict time/complexity  | Remediation type  | Estimated hours   |
| **Auto-Scheduler**   | Plan remediation sprints | Prioritized queue | Sprint plan       |

### 4. Remediation Agents 🔜 (Phase 2b)

| Agent                   | Purpose                        | Risk Level |
| ----------------------- | ------------------------------ | ---------- |
| **Refactor Agent**      | Consolidate duplicate code     | Medium     |
| **Rename Agent**        | Standardize naming conventions | Low        |
| **Restructure Agent**   | Flatten import chains          | High       |
| **Documentation Agent** | Update docs to match code      | Low        |

### 5. Validation Agents 🔜 (Phase 2b)

| Agent               | Purpose                  | Pass Criteria        |
| ------------------- | ------------------------ | -------------------- |
| **Test Agent**      | Run test suite           | All tests pass       |
| **Type Agent**      | TypeScript type check    | No errors            |
| **AI-Review Agent** | AI reviews changes       | Approves correctness |
| **Human Sign-off**  | Queue for human approval | Human approves       |

## Risk Classification

```typescript
interface RemediationRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    linesChanged: number; // <50: low, 50-200: medium, >200: high
    filesAffected: number; // 1-3: low, 4-10: medium, >10: high
    testCoverage: number; // >80%: low, 50-80%: medium, <50%: high
    hasTypeCheck: boolean; // yes: reduces risk
    isPublicAPI: boolean; // yes: increases risk
    dependencyDepth: number; // deeper = higher risk
  };
  autoApprovalEligible: boolean; // low risk + rules met
}
```

## Human-in-the-Loop Tiers

| Tier           | Who                    | When                    | SLA        | Cost        |
| -------------- | ---------------------- | ----------------------- | ---------- | ----------- |
| **Auto**       | Platform (rules-based) | Low risk, < 50 lines    | Instant    | Included    |
| **Team**       | Customer's team        | Medium risk, any size   | Self-serve | Included    |
| **Expert**     | AIReady consultant     | High risk, architecture | 24-48h     | $150-300/hr |
| **Enterprise** | Dedicated engineer     | Critical systems        | 4h SLA     | Contract    |

## Implementation Order

### Phase 2a (Weeks 1-3)

1. [ ] Impact Agent
2. [ ] Risk Agent
3. [ ] Dependency Agent
4. [ ] ROI Calculator
5. [ ] Effort Estimator

### Phase 2b (Weeks 4-6)

1. [ ] Refactor Agent (consolidation)
2. [ ] Rename Agent (naming standards)
3. [ ] Test Agent (validation)
4. [ ] Type Agent (TypeScript)
5. [ ] Human review queue UI

### Phase 2c (Weeks 7-8)

1 ] Restructure Agent (import chains) 2. [ ] AI-Review Agent 3. [ ] Auto-PR creation 4. [ ] Auto-merge for low risk

## Related Docs

- [Detection Agents](../../sub-instructions/adding-new-tool.md) - How to add new detection
- [Platform Architecture](../architecture.md) - System overview
- [API Reference](../api/README.md) - Agent API endpoints
