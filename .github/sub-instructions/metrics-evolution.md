# AIReady Metrics Evolution Guide

**Last Updated:** February 25, 2026  
**Version:** v0.12+

## Strategic Foundation

AIReady metrics must satisfy three survival criteria:
1. **Technology-agnostic** — valid regardless of model (GPT-4 → GPT-5 → whatever comes next)
2. **Business-justified** — connect to real cost and productivity signals, not vanity measures
3. **Actionable** — every metric must have a clear fix path and estimated impact

This document chronicles the evolution from v0.9 (3 simple scores) to the current comprehensive framework.

---

## The Problem with Naive Metrics

| Naive Metric | Why It Breaks |
|---|---|
| "Token cost" | Context windows went 32k → 128k → 1M+. A 10k-token file went from "critical" to "trivial". |
| "Import depth" | Language-specific. Meaningless in Python or Go. |
| "65% acceptance rate baseline" | Pure fiction. GitHub Copilot reports ~30% industry average. |
| GPT-4 token pricing ($0.01/1K) | Models now range $0.0001–$0.030/1K. A 100x spread renders old estimates meaningless. |
| Fixed 5k-token "ideal" threshold | Calibrated to GPT-4 (8k context). Frontier models have 200k+ windows. |

---

## Current Metric Dimensions (v0.12)

### Tier 1: Active Spoke Tools (Measured Now)

| Tool | Weight | What It Measures |
|---|---|---|
| `pattern-detect` | 40 | Semantic duplication — same logic written differently, wasting token budget |
| `context-analyzer` | 35 | Context efficiency — fragmentation, import depth, budget per file |
| `consistency` | 25 | Naming/pattern consistency — AI intent inference accuracy |

### Tier 2: New Dimensions (Planned Spokes / Core Calculations)

| Dimension | Weight | What It Measures |
|---|---|---|
| `hallucination-risk` | 20 | Code patterns empirically causing AI to generate confidently wrong outputs |
| `agent-grounding` | 18 | How well an autonomous agent can navigate the codebase unaided |
| `testability` | 18 | Whether AI-generated changes can be safely verified |
| `doc-drift` | 15 | Stale documentation actively misleading AI |
| `deps` | 12 | Dependency health affecting AI suggestion accuracy |

---

## Future-Proof Metric Primitives

These are **technology-agnostic abstractions** in `packages/core/src/future-proof-metrics.ts`.
They do not depend on tokenizer or model internals.

### 1. Cognitive Load (`CognitiveLoad`)

Replaces "token cost" with multi-dimensional cognitive assessment.

```typescript
import { calculateCognitiveLoad } from '@aiready/core';

const load = calculateCognitiveLoad({
  linesOfCode: 500,
  exportCount: 10,
  importCount: 15,
  uniqueConcepts: 20,
  cyclomaticComplexity: 8,
});
// { score: 45, rating: 'moderate', factors: [...] }
```

**Factors:** Size Complexity (30%) · Interface Complexity (25%) · Dependency Complexity (25%) · Conceptual Density (20%)

---

### 2. Hallucination Risk (`HallucinationRisk`) — NEW in v0.12

Measures code patterns empirically known to cause AI models to generate **confidently wrong** output.

```typescript
import { calculateHallucinationRisk } from '@aiready/core';

const risk = calculateHallucinationRisk({
  overloadedSymbols: 5,    // Same name, different signatures
  magicLiterals: 12,       // Unnamed constants: 3000, "admin", true
  booleanTraps: 3,         // foo(true, false, null) patterns
  implicitSideEffects: 4,  // Functions that mutate without returning
  deepCallbacks: 2,        // Callback nesting > 3 levels
  ambiguousNames: 8,       // x, tmp, data, obj, misc
  undocumentedExports: 15, // Public functions without JSDoc
  totalSymbols: 200,
  totalExports: 40,
});
// { score: 32, rating: 'moderate', topRisk: '...', signals: [...] }
```

**Signals and weights:**
- Symbol Overloading (25%) — AI picks wrong signature
- Magic Literals (20%) — AI invents wrong values
- Boolean Traps (20%) — AI inverts intent
- Implicit Side Effects (15%) — AI misses contracts
- Callback Nesting (10%) — AI loses control flow
- Ambiguous Names (10%) — AI guesses wrong intent
- Undocumented Exports (10%) — AI fabricates behavior

---

### 3. Agent Grounding Score (`AgentGroundingScore`) — NEW in v0.12

Measures how well an AI **agent** can navigate the codebase without human prompting.

```typescript
import { calculateAgentGrounding } from '@aiready/core';

const grounding = calculateAgentGrounding({
  deepDirectories: 3,          // Directories > 4 levels deep
  totalDirectories: 30,
  vagueFileNames: 5,           // utils.ts, helpers.ts, misc.ts
  totalFiles: 120,
  hasRootReadme: true,
  readmeIsFresh: true,         // Updated in last 90 days
  barrelExports: 8,            // index.ts re-exports
  untypedExports: 2,
  totalExports: 45,
  inconsistentDomainTerms: 1,
  domainVocabularySize: 20,
});
// { score: 82, rating: 'good', dimensions: {...}, recommendations: [...] }
```

**Dimensions:**
- Structure Clarity (20%) — Directory depth and organization
- Self-Documentation (25%) — File names reveal purpose
- Entry Points (20%) — README and barrel export quality
- API Clarity (15%) — Typed, discoverable public surface
- Domain Consistency (20%) — One term per concept

---

### 4. Testability Index (`TestabilityIndex`) — NEW in v0.12

Measures whether AI-generated changes can be **safely verified**.

```typescript
import { calculateTestabilityIndex } from '@aiready/core';

const testability = calculateTestabilityIndex({
  testFiles: 35,               // *.test.ts, *.spec.ts, __tests__/*
  sourceFiles: 80,
  pureFunctions: 60,           // No I/O or mutations
  totalFunctions: 100,
  injectionPatterns: 15,       // Constructor DI, factory patterns
  totalClasses: 20,
  bloatedInterfaces: 2,        // Interfaces with > 10 methods
  totalInterfaces: 25,
  externalStateMutations: 5,
  hasTestFramework: true,
});
// { score: 76, rating: 'good', aiChangeSafetyRating: 'safe', dimensions: {...} }
```

**`aiChangeSafetyRating`:** `safe` | `moderate-risk` | `high-risk` | `blind-risk`

Teams with `blind-risk` should treat AI suggestions as **untested code** regardless of score.

---

### 5. Semantic Distance (`SemanticDistance`)

Replaces "import depth" with concept-based distance.

### 6. Pattern Entropy (`PatternEntropy`)

Information-theoretic fragmentation measure using Shannon entropy.

### 7. Concept Cohesion (`ConceptCohesion`)

Domain-based export cohesion score.

---

## Model-Aware Context Tiers

Context budget thresholds are now **calibrated per model tier**, not hardcoded to GPT-4 era values.

```typescript
import { CONTEXT_TIER_THRESHOLDS, getRecommendedThreshold } from '@aiready/core';

// 'compact' | 'standard' | 'extended' | 'frontier'
const thresholds = CONTEXT_TIER_THRESHOLDS['extended'];
// { idealTokens: 15_000, criticalTokens: 50_000, idealDepth: 7 }

const recommended = getRecommendedThreshold(450, 'extended'); // 450 files
// → 68 (medium project, frontier model gives -2 bonus)
```

| Tier | Models | Ideal Tokens | Critical Tokens | Ideal Depth |
|---|---|---|---|---|
| `compact` | GPT-3.5, older Codex | 3,000 | 10,000 | 4 |
| `standard` | GPT-4, Claude 3 Haiku | 5,000 | 15,000 | 5 |
| `extended` | GPT-4o, Claude 3.5 Sonnet | 15,000 | 50,000 | 7 |
| `frontier` | Claude 3.7+, Gemini 2.0+ | 50,000 | 150,000 | 10 |

---

## Model Pricing Presets

No more hardcoded GPT-4 pricing. Use presets:

```typescript
import { getModelPreset } from '@aiready/core';

const preset = getModelPreset('claude-sonnet-4');
const monthlyCost = calculateMonthlyCost(tokenWaste, {
  pricePer1KTokens: preset.pricePer1KInputTokens,
  queriesPerDevPerDay: preset.typicalQueriesPerDevPerDay,
  developerCount: 10,
});
```

**Available:** `gpt-4` · `gpt-4o` · `gpt-4o-mini` · `claude-3-5-sonnet` · `claude-3-7-sonnet` · `claude-sonnet-4` · `gemini-1-5-pro` · `gemini-2-0-flash` · `copilot` · `cursor-pro`

---

## Size-Adjusted Thresholds

Large codebases structurally accrue more issues. Use `getRecommendedThreshold()`:

| Size | Files | Recommended Threshold |
|---|---|---|
| `xs` | < 50 | 80 |
| `small` | 50–200 | 75 |
| `medium` | 200–500 | 70 |
| `large` | 500–2,000 | 65 |
| `enterprise` | 2,000+ | 58 |

---

## Acceptance Rate Prediction (v0.12 — re-calibrated)

Old baseline `0.65` was fiction. New baseline `0.30` aligns with GitHub Copilot's ~30% industry average.

Confidence ranges: 1 tool → 0.35 · 2 tools → 0.50 · 3 tools → 0.65 · 4+ tools → 0.75

---

## Roadmap: Planned Metric Spokes

| Spoke | Priority | Description |
|---|---|---|
| `doc-drift` | High | Detect stale comments, README drift, outdated JSDoc |
| `testability` | High | Full AST-driven spoke: DI, purity, test ratio |
| `hallucination-risk` | High | Full AST spoke: overloads, magic literals, boolean traps |
| `agent-grounding` | Medium | Full spoke: directory/naming analysis |
| `deps` | Medium | Dependency age, security, API stability |
| `change-blast-radius` | Low | Estimate propagation cost of modifications |


## The Problem with Traditional Metrics

Traditional code metrics are often tied to specific technologies:
- **Token cost** - Changes with model context windows (32k → 100k → 1M)
- **Import depth** - Language-specific (ES6, Python, Java)
- **Jaccard similarity** - May miss semantic equivalence

## Future-Proof Metrics

### 1. Cognitive Load (`CognitiveLoad`)

Replaces "token cost" with a multi-dimensional cognitive assessment.

```typescript
import { calculateCognitiveLoad } from '@aiready/core';

const load = calculateCognitiveLoad({
  linesOfCode: 500,
  exportCount: 10,
  importCount: 15,
  uniqueConcepts: 20,
});

// Returns: { score: 45, rating: 'moderate', factors: [...], rawValues: {...} }
```

**Factors:**
- Size Complexity (30%) - Lines of code
- Interface Complexity (25%) - Number of exports
- Dependency Complexity (25%) - Number of imports  
- Conceptual Density (20%) - Unique concepts per line

### 2. Semantic Distance (`SemanticDistance`)

Replaces "import depth" with concept-based distance measurement.

```typescript
import { calculateSemanticDistance } from '@aiready/core';

const distance = calculateSemanticDistance({
  file1: 'src/users/service.ts',
  file2: 'src/auth/service.ts',
  file1Domain: 'users',
  file2Domain: 'auth',
  file1Imports: ['db', 'utils'],
  file2Imports: ['db', 'utils', 'crypto'],
  sharedDependencies: ['db'],
});

// Returns: { distance: 0.3, relationship: 'cross-domain', ... }
```

### 3. Pattern Entropy (`PatternEntropy`)

Replaces "fragmentation" with information-theoretic measurement (Shannon entropy).

```typescript
import { calculatePatternEntropy } from '@aiready/core';

const entropy = calculatePatternEntropy([
  { path: 'src/users/model.ts', domain: 'users' },
  { path: 'src/users/service.ts', domain: 'users' },
  { path: 'src/auth/model.ts', domain: 'auth' },
]);

// Returns: { entropy: 0.5, rating: 'moderate', giniCoefficient: 0.4, ... }
```

### 4. Concept Cohesion (`ConceptCohesion`)

More rigorous than "export cohesion" using domain analysis.

```typescript
import { calculateConceptCohesion } from '@aiready/core';

const cohesion = calculateConceptCohesion({
  exports: [
    { name: 'getUser', inferredDomain: 'users' },
    { name: 'createUser', inferredDomain: 'users' },
    { name: 'deleteUser', inferredDomain: 'users' },
  ],
});

// Returns: { score: 0.85, rating: 'excellent', ... }
```

## Business Metrics

### Temporal Tracking

```typescript
import { calculateScoreTrend, calculateRemediationVelocity } from '@aiready/core';

// Load history
const history = loadScoreHistory('./my-project');

// Calculate trend
const trend = calculateScoreTrend(history);
// Returns: { direction: 'improving', change30Days: 5, velocity: 1.2, ... }

// Calculate velocity
const velocity = calculateRemediationVelocity(history, 50);
// Returns: { issuesFixedThisWeek: 3, avgIssuesPerWeek: 2.5, trend: 'stable', ... }
```

### Knowledge Concentration Risk

Measures "bus factor" for AI training continuity.

```typescript
import { calculateKnowledgeConcentration } from '@aiready/core';

const risk = calculateKnowledgeConcentration([
  { path: 'src/core.ts', exports: 50, imports: 5 },
  { path: 'src/utils.ts', exports: 10, imports: 2 },
  // ...
]);

// Returns: { score: 65, rating: 'high', analysis: {...}, recommendations: [...] }
```

### Technical Debt Interest

Models compounding costs over time.

```typescript
import { calculateTechnicalDebtInterest, getDebtBreakdown } from '@aiready/core';

const debt = calculateTechnicalDebtInterest({
  currentMonthlyCost: 100,
  issues: [{ severity: 'critical' }, { severity: 'major' }],
  monthsOpen: 6,
});

// Returns: { monthlyRate: 3.5, annualRate: 51, projections: {...}, monthlyCost: 103.50 }

const breakdown = getDebtBreakdown(500, 300, 100);
// Returns categorized debt by type with priority and fix costs
```

## Migration Guide

### From Token Cost to Cognitive Load

Old:
```typescript
const tokens = file.tokenCost;
const score = tokens > 10000 ? 'high' : 'low';
```

New:
```typescript
const load = calculateCognitiveLoad({
  linesOfCode: file.lines,
  exportCount: file.exports.length,
  importCount: file.imports.length,
  uniqueConcepts: file.concepts.length,
});
// load.rating gives you: trivial, easy, moderate, difficult, expert
```

### From Import Depth to Semantic Distance

Old:
```typescript
const depth = calculateImportDepth(file, graph);
```

New:
```typescript
const distance = calculateSemanticDistance({
  file1: file1Path,
  file2: file2Path,
  file1Domain: file1Domain,
  file2Domain: file2Domain,
  file1Imports: file1.imports,
  file2Imports: file2.imports,
  sharedDependencies: findShared(file1.imports, file2.imports),
});
// distance.relationship: same-file | same-domain | cross-domain | unrelated
```

## Score Calculation

The aggregate score uses future-proof metrics:

```typescript
import { calculateFutureProofScore } from '@aiready/core';

const score = calculateFutureProofScore({
  cognitiveLoad: loadResult,
  patternEntropy: entropyResult,
  conceptCohesion: cohesionResult,
  semanticDistances: [distance1, distance2],
});

// score.toolName = 'future-proof'
// score.score = 0-100
// score.factors shows contribution of each metric
```

## Key Principles

1. **Technology Independence** - Metrics work regardless of AI model architecture
2. **Mathematical Rigor** - Uses information theory (Shannon entropy)
3. **Business Alignment** - Connects technical metrics to ROI
4. **Future-Proof** - Doesn't depend on tokens, context windows, or specific languages
