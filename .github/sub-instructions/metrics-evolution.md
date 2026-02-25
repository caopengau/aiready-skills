# AIReady Metrics Evolution Guide

## Overview

This document describes the future-proof metrics introduced in v0.11+ that survive technology changes.

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
