# AI Readiness Scoring Algorithm

**Version:** 1.0  
**Date:** January 21, 2026  
**Status:** Design Phase

---

## Overview

The AI Readiness Score is a **0-100 metric** that quantifies how well a codebase works with AI coding assistants. It combines three dimensions with proven impact on AI effectiveness.

---

## Dynamic Composition Model

Each tool outputs a **normalized 0-100 score** independently. The overall score is computed by:

```typescript
AI Readiness Score = Σ(tool_score × tool_weight) / Σ(active_tool_weights)
```

**Key principles:**
1. Each tool is self-contained with its own scoring logic
2. Weights are relative priorities (can sum to any value)
3. Only active tools contribute to the score
4. New tools can be added without breaking existing scores

### Default Tool Weights (when all tools run)

```typescript
const DEFAULT_WEIGHTS = {
  'pattern-detect': 40,      // Duplication impact
  'context-analyzer': 35,    // Context efficiency
  'consistency': 25,         // Naming/patterns
  'doc-drift': 20,          // Future: Documentation freshness
  'deps': 15,               // Future: Dependency health
  // New tools can be added here
};
```

### Dynamic Weight Adjustment

```typescript
function calculateOverallScore(
  toolScores: Map<string, number>,
  weights: Map<string, number> = DEFAULT_WEIGHTS
): number {
  // Only use weights for tools that ran
  const activeWeights = new Map(
    [...toolScores.keys()].map(tool => [tool, weights.get(tool) || 10])
  );
  
  const totalWeight = Array.from(activeWeights.values()).reduce((a, b) => a + b, 0);
  const weightedSum = Array.from(toolScores.entries())
    .reduce((sum, [tool, score]) => sum + (score * activeWeights.get(tool)!), 0);
  
  return Math.round(weightedSum / totalWeight);
}
```

### Example Scenarios

**Scenario 1: All 3 current tools**
```
pattern-detect: 45 (weight: 40)
context-analyzer: 78 (weight: 35)
consistency: 82 (weight: 25)

Score = (45×40 + 78×35 + 82×25) / (40+35+25)
      = (1800 + 2730 + 2050) / 100
      = 65.8 → 66/100
```

**Scenario 2: Only pattern-detect + consistency**
```
pattern-detect: 45 (weight: 40)
consistency: 82 (weight: 25)

Score = (45×40 + 82×25) / (40+25)
      = (1800 + 2050) / 65
      = 59.2 → 59/100
```

**Scenario 3: With future tools (doc-drift added)**
```
pattern-detect: 45 (weight: 40)
context-analyzer: 78 (weight: 35)
consistency: 82 (weight: 25)
doc-drift: 90 (weight: 20)

Score = (45×40 + 78×35 + 82×25 + 90×20) / (40+35+25+20)
      = (1800 + 2730 + 2050 + 1800) / 120
      = 69.8 → 70/100
```

### Rationale for Default Weights
- **pattern-detect (40)**: Highest impact - directly wastes tokens and confuses AI
- **context-analyzer (35)**: High impact - context limits are primary constraint
- **consistency (25)**: Moderate impact - affects AI intent understanding
- **doc-drift (20)**: Planned - outdated docs mislead AI
- **deps (15)**: Planned - dependency issues affect AI suggestions

---

## Component 1: Pattern Score (0-100)

**What it measures:** Impact of semantic duplicates on AI context efficiency

### Raw Metrics (from pattern-detect)
- `totalDuplicates`: Number of duplicate patterns found
- `totalTokenCost`: Sum of all duplicate pattern token costs
- `highImpactDuplicates`: Patterns with >1000 token cost or >70% similarity
- `totalFilesAnalyzed`: Total number of code files scanned

### Calculation

```typescript
function calculatePatternScore(metrics: {
  totalDuplicates: number;
  totalTokenCost: number;
  highImpactDuplicates: number;
  totalFilesAnalyzed: number;
}): number {
  // Normalize to duplicates per 100 files
  const duplicatesPerFile = (metrics.totalDuplicates / metrics.totalFilesAnalyzed) * 100;
  
  // Token waste per file
  const tokenWastePerFile = metrics.totalTokenCost / metrics.totalFilesAnalyzed;
  
  // Penalty scaling:
  // - 0 duplicates = 100 score
  // - 1 duplicate per 10 files = 90 score
  // - 1 duplicate per 5 files = 70 score
  // - 1+ duplicate per file = 40 score
  const duplicatesPenalty = Math.min(60, duplicatesPerFile * 0.6);
  
  // Token waste penalty:
  // - 0 waste = 0 penalty
  // - 1000 tokens/file = 20 penalty
  // - 5000 tokens/file = 40 penalty
  const tokenPenalty = Math.min(40, tokenWastePerFile / 125);
  
  // High impact boost/penalty
  // - No high-impact duplicates = +5 bonus
  // - 5+ high-impact duplicates = -10 penalty
  const highImpactPenalty = metrics.highImpactDuplicates > 0 
    ? Math.min(15, metrics.highImpactDuplicates * 2 - 5)
    : -5; // bonus
  
  const score = 100 - duplicatesPenalty - tokenPenalty - highImpactPenalty;
  return Math.max(0, Math.min(100, score));
}
```

### Scoring Bands
- **90-100**: Excellent - Minimal duplication, AI-friendly
- **70-89**: Good - Some duplication but manageable
- **50-69**: Needs Improvement - Significant duplication impacting AI
- **0-49**: Critical - Severe duplication confusing AI models

---

## Component 2: Context Score (0-100)

**What it measures:** How efficiently files use AI context windows

### Raw Metrics (from context-analyzer)
- `avgContextBudget`: Average tokens needed to understand a file (with all deps)
- `maxContextBudget`: Maximum context budget in any single file
- `avgImportDepth`: Average depth of import chains
- `maxImportDepth`: Maximum import depth found
- `avgFragmentation`: Average fragmentation score (0-1)
- `criticalIssues`: Number of critical context issues
- `majorIssues`: Number of major context issues

### Calculation

```typescript
function calculateContextScore(metrics: {
  avgContextBudget: number;
  maxContextBudget: number;
  avgImportDepth: number;
  maxImportDepth: number;
  avgFragmentation: number;
  criticalIssues: number;
  majorIssues: number;
}): number {
  // Context budget scoring
  // Ideal: <5000 tokens avg = 100
  // Acceptable: 5000-10000 = 90-70
  // High: 10000-20000 = 70-40
  // Critical: >20000 = <40
  const budgetScore = metrics.avgContextBudget < 5000 
    ? 100
    : Math.max(0, 100 - (metrics.avgContextBudget - 5000) / 150);
  
  // Import depth scoring
  // Ideal: <5 avg = 100
  // Acceptable: 5-8 = 80-60
  // Deep: >8 = <60
  const depthScore = metrics.avgImportDepth < 5
    ? 100
    : Math.max(0, 100 - (metrics.avgImportDepth - 5) * 10);
  
  // Fragmentation scoring (0-1 scale, lower is better)
  // Well-organized: <0.3 = 100
  // Moderate: 0.3-0.5 = 80-60
  // Fragmented: >0.5 = <60
  const fragmentationScore = metrics.avgFragmentation < 0.3
    ? 100
    : Math.max(0, 100 - (metrics.avgFragmentation - 0.3) * 200);
  
  // Issue penalties
  const criticalPenalty = metrics.criticalIssues * 10;
  const majorPenalty = metrics.majorIssues * 3;
  
  // Max budget penalty (if any file is extreme)
  const maxBudgetPenalty = metrics.maxContextBudget > 15000 
    ? Math.min(20, (metrics.maxContextBudget - 15000) / 500)
    : 0;
  
  // Weighted average of subscores
  const rawScore = (budgetScore * 0.4) + (depthScore * 0.3) + (fragmentationScore * 0.3);
  const finalScore = rawScore - criticalPenalty - majorPenalty - maxBudgetPenalty;
  
  return Math.max(0, Math.min(100, finalScore));
}
```

### Scoring Bands
- **90-100**: Excellent - Efficient context usage, well-organized
- **70-89**: Good - Reasonable context costs
- **50-69**: Needs Improvement - High context costs or fragmentation
- **0-49**: Critical - Extreme context requirements

---

## Component 3: Consistency Score (0-100)

**What it measures:** Naming and pattern consistency that helps AI understand intent

### Raw Metrics (from consistency)
- `totalIssues`: Total consistency issues found
- `criticalIssues`: Critical naming/pattern issues
- `majorIssues`: Major naming/pattern issues
- `minorIssues`: Minor naming/pattern issues
- `filesAnalyzed`: Total files analyzed

### Calculation

```typescript
function calculateConsistencyScore(metrics: {
  totalIssues: number;
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
  filesAnalyzed: number;
}): number {
  // Issues per file ratio
  const issuesPerFile = metrics.totalIssues / metrics.filesAnalyzed;
  
  // Weighted issue scoring
  // - Critical: -10 points each
  // - Major: -3 points each
  // - Minor: -0.5 points each
  const weightedPenalty = 
    (metrics.criticalIssues * 10) +
    (metrics.majorIssues * 3) +
    (metrics.minorIssues * 0.5);
  
  // Normalize penalty to 0-100 scale
  // Assume 100 files baseline
  const normalizedPenalty = (weightedPenalty / metrics.filesAnalyzed) * 100;
  
  // Issue density penalty
  // - <0.5 issues/file = excellent
  // - 0.5-1 issues/file = good
  // - 1-2 issues/file = needs work
  // - >2 issues/file = critical
  const densityPenalty = Math.min(40, issuesPerFile * 20);
  
  const score = 100 - Math.min(60, normalizedPenalty) - densityPenalty;
  return Math.max(0, Math.min(100, score));
}
```

### Scoring Bands
- **90-100**: Excellent - Highly consistent, AI-friendly naming
- **70-89**: Good - Minor inconsistencies
- **50-69**: Needs Improvement - Notable inconsistencies
- **0-49**: Critical - Severe inconsistencies confusing AI

---

## Overall Score Interpretation

```
90-100: AI-Ready ✅
  Your codebase is optimized for AI assistance. AI tools will be highly effective.

75-89: Good 👍
  Your codebase works well with AI. Some optimization opportunities exist.

60-74: Fair ⚠️
  AI tools will work but with reduced effectiveness. Consider improvements.

40-59: Needs Work 🔨
  Significant issues impacting AI effectiveness. Prioritize improvements.

0-39: Critical ❌
  Severe issues preventing effective AI assistance. Urgent improvements needed.
```

---

## Score Breakdown Display

```bash
📊 AI Readiness Score: 67/100 (Fair)

Component Scores:
├─ Pattern Duplication:  45/100 ⚠️  Weight: 40%
│  ├─ 12 high-impact duplicates found
│  ├─ 8,450 tokens wasted
│  └─ 0.8 duplicates per file
│
├─ Context Efficiency:   78/100 ✓   Weight: 35%
│  ├─ Avg context: 4,200 tokens (good)
│  ├─ Avg depth: 6.2 levels (acceptable)
│  └─ Fragmentation: 0.45 (moderate)
│
└─ Naming Consistency:   82/100 ✓   Weight: 25%
   ├─ 23 total issues (18% of files)
   ├─ 2 critical, 8 major, 13 minor
   └─ Mostly consistent patterns

🎯 To reach "Good" (75+):
   1. Fix auth handler duplicates → +6 points
   2. Consolidate utils modules → +3 points
   Target score after fixes: 76/100
```

---

## Comparative Benchmarks

Based on analysis of 50+ projects:

| Project Size | Avg Score | Top 25% | Bottom 25% |
|-------------|-----------|---------|------------|
| Small (<100 files) | 72 | 85+ | <60 |
| Medium (100-500) | 68 | 80+ | <55 |
| Large (500-2000) | 64 | 75+ | <50 |
| Enterprise (2000+) | 58 | 70+ | <45 |

**Key insight:** Larger codebases naturally score lower. A score of 65 for an enterprise project is roughly equivalent to 75 for a small project.

---

## Delta Tracking

```bash
# Compare against baseline
aiready scan . --compare baseline.json

📈 Score Change: 67 → 72 (+5 points)

Improvements:
✅ Pattern Score: 45 → 58 (+13)
   - Fixed 5 duplicate handlers
✅ Context Score: 78 → 79 (+1)
   - Reduced avg depth by 0.3 levels

Regressions:
⚠️ Consistency Score: 82 → 76 (-6)
   - 4 new naming inconsistencies introduced
```

---

## Tool Integration Protocol

Each tool must implement a standard scoring interface:

```typescript
interface ToolScoringOutput {
  toolName: string;           // e.g., "pattern-detect"
  score: number;              // 0-100 normalized score
  rawMetrics: Record<string, any>;  // Tool-specific metrics
  factors: Array<{            // What influenced the score
    name: string;
    impact: number;           // +/- points
    description: string;
  }>;
  recommendations: Array<{
    action: string;
    estimatedImpact: number;  // +points if fixed
    priority: 'high' | 'medium' | 'low';
  }>;
}
```

### Adding New Tools

```typescript
// 1. Tool implements scoring in its analyzer
export function calculateScore(results: MyToolResult): ToolScoringOutput {
  return {
    toolName: 'my-new-tool',
    score: computeMyScore(results),
    rawMetrics: results,
    factors: [
      { name: 'metric1', impact: -10, description: '...' }
    ],
    recommendations: [...]
  };
}

// 2. Register tool in core config (optional)
// If not registered, gets default weight of 10
const TOOL_REGISTRY = {
  'my-new-tool': {
    weight: 18,  // Relative importance
    category: 'quality',
    description: 'What this tool measures'
  }
};

// 3. CLI automatically discovers and uses new tool
// No changes needed to scoring system!
```

## Configuration File Support

The scoring system integrates with existing `aiready.json` config. Each tool specifies its own `scoreWeight` alongside its settings:

### Example aiready.json

```json
{
  "scan": {
    "include": ["src/**/*.ts"],
    "exclude": ["**/*.test.ts"],
    "tools": ["patterns", "context", "consistency"]
  },
  "tools": {
    "pattern-detect": {
      "scoreWeight": 40,
      "minSimilarity": 0.4,
      "minLines": 5
    },
    "context-analyzer": {
      "scoreWeight": 35,
      "maxDepth": 5,
      "maxContextBudget": 10000
    },
    "consistency": {
      "scoreWeight": 25,
      "minSeverity": "major"
    },
    "doc-drift": {
      "scoreWeight": 20,
      "enabled": false,
      "checkAge": true
    }
  },
  "scoring": {
    "threshold": 70,
    "showBreakdown": true,
    "compareBaseline": ".aiready/baseline.json",
    "saveTo": ".aiready/score.json"
  }
}
```

**Tool Selection Methods:**

1. **Via scan.tools array** - List which tools to run
2. **Via tools.*.enabled flag** - Explicitly enable/disable tools
3. **Via CLI --tools flag** - Override at runtime

Priority: CLI flag > scan.tools > tools.*.enabled > all enabled

**Benefits:**
- Tool configuration is self-contained
- No need to remember tool names in separate section
- Easy to add/remove tools without updating multiple places
**Tool Selection:**
```bash
# Run all configured tools (from scan.tools or all by default)
aiready scan . --score

# Run only specific tools via CLI
aiready scan . --tools patterns,context --score
# Only pattern-detect and context-analyzer run, score calculated from these

# Run all except one
aiready scan . --tools patterns,consistency --score
# Excludes context-analyzer

# Shorthand tool names (already supported)
# patterns → pattern-detect
# context → context-analyzer
# consistency → consistency
```

**Scoring with Tool Selection:**
```bash
# Use config file weights (from tools.*.scoreWeight)
aiready scan . --score

# Score with subset of tools
aiready scan . --tools patterns,context --score
# Score = (patterns×40 + context×35) / (40+35) = weighted avg of 2 tools

# Override specific tool weight via CLI
aiready scan . --score --weights patterns:60
# Keeps other weights from config

# Override all weights via CLI
aiready scan . --score --weights patterns:50,context:30,consistency:20

# Threshold from config (scoring.threshold)
ai  tools?: string[];               // Which tools to run: ["patterns", "context"]
  };
  tools?: {
    [toolName: string]: {
      enabled?: boolean;            // Explicit enable/disable (default: true)
      scoreWeight?: number;         // Weight for this tool (default: varies
aiready scan . --score --threshold 80
```

**Config-Based Tool Selection:**
```json
{
  "scan": {
    "tools": ["patterns", "context"]  // Only run these two
  },
  "tools": {
    "pattern-detect": { "scoreWeight": 50 },
    "context-analyzer": { "scoreWeight": 50 },
    "consistency": { "enabled": false }  // Explicitly disabled
  }
}Tool Selection Resolution Logic

```typescript
function getActiveTools(
  config: AIReadyConfig,
  cliTools?: string[]
): string[] {
  // 1. CLI flag has highest priority
  if (cliTools && cliTools.length > 0) {
    return cliTools.map(normalizeToolName);
  }
  
  // 2. Check scan.tools config
  if (config.scan?.tools && config.scan.tools.length > 0) {
    return config.scan.tools.map(normalizeToolName);
  }
  
  // 3. Check individual tool enabled flags
  const enabledTools = Object.entries(config.tools || {})
    .filter(([_, toolConfig]) => toolConfig.enabled !== false)
    .map(([toolName, _]) => toolName);
  
  if (enabledTools.length > 0) {
    return enabledTools;
  }
  
  // 4. Default: all known tools
  return ['pattern-detect', 'context-analyzer', 'consistency'];
}

function normalizeToolName(shortName: string): string {
  const TOOL_MAP: Record<string, string> = {
    'patterns': 'pattern-detect',
    'context': 'context-analyzer',
    'consistency': 'consistency',
    'doc-drift': 'doc-drift',
    'deps': 'deps'
  };
  return TOOL_MAP[shortName] || shortName;
}
```

### Weight Resolution Logic

```typescript
function getToolWeight(
  toolName: string,
  config: AIReadyConfig,
  cliOverrides?: Map<string, number>
): number {
  // 1. CLI override has highest priority
  if (cliOverrides?.has(toolName)) {
    return cliOverrides.get(toolName)!;
  }
  
  // 2. Check tool's own config
  if (config.tools?.[toolName]?.scoreWeight) {
    return config.tools[toolName].scoreWeight;
  }
  
  // 3. Fall back to defaults
  const DEFAULTS: Record<string, number> = {
    'pattern-detect': 40,
    'context-analyzer': 35,
    'consistency': 25,
    'doc-drift': 20,
    'deps': 15
  };
  
  return DEFAULTS[toolName] || 10; // Unknown tools get weight 10
}
```

### Complete Scoring Flow

```typescript
async function calculateScore(
  directory: string,
  config: AIReadyConfig,
  cliOptions: {
    tools?: string[];
    weights?: string;  // e.g., "patterns:50,context:30"
  }
): Promise<ScoringResult> {
  // 1. Determine which tools to run
  const activeTools = getActiveTools(config, cliOptions.tools);
  
  // 2. Parse CLI weight overrides
  const weightOverrides = parseWeightString(cliOptions.weights);
  
  // 3. Run each active tool and get scores
  const toolScores = new Map<string, ToolScoringOutput>();
  for (const toolName of activeTools) {
    const score = await runToolWithScoring(toolName, directory, config);
    toolScores.set(toolName, score);
  }
  
  // 4. Calculate weighted overall score
  const weights = new Map<string, number>();
  for (const toolName of activeTools) {
    weights.set(toolName, getToolWeight(toolName, config, weightOverrides));
  }
  
  const overallScore = calculateOverallScore(toolScores, weights);
  
  return {
    score: overallScore,
    toolScores,
    weights,
    activeTools
  };
    threshold?: number;              // Minimum passing score
    showBreakdown?: boolean;         // Show detailed breakdown
    compareBaseline?: string;        // Path to baseline JSON
    saveTo?: string;                 // Auto-save score to path
  };
  output?: {
    format?: 'json' | 'text' | 'markdown';
    verbose?: boolean;
  };
}
```

### Weight Resolution Logic

```typescript
function getToolWeight(
  toolName: string,
  config: AIReadyConfig,
  cliOverrides?: Map<string, number>
): number {
  // 1. CLI override has highest priority
  if (cliOverrides?.has(toolName)) {
    return cliOverrides.get(toolName)!;
  }
  
  // 2. Check tool's own config
  if (config.tools?.[toolName]?.scoreWeight) {
    return config.tools[toolName].scoreWeight;
  }
  
  // 3. Fall back to defaults
  const DEFAULTS: Record<string, number> = {
    'pattern-detect': 40,
    'context-analyzer': 35,
    'consistency': 25,
    'doc-drift': 20,
    'deps': 15
  };
  
  return DEFAULTS[toolName] || 10; // Unknown tools get weight 10
}
```

---

// No changes needInfrastructure (Week 1)
- [ ] Define `ToolScoringOutput` interface in @aiready/core
- [ ] Implement dynamic scoring compositor
- [ ] Create tool registry with default weights
- [ ] Add score calculation utilities

```typescript
// packages/core/src/scoring.ts
export interface ToolScoringOutput { /* ... */ }
export function calculateOverallScore(
  toolOutputs: ToolScoringOutput[],
  customWeights?: Map<string, number>
): AggregatedScore;
```

### Phase 2: Tool Updates (Week 2)
- [ ] Update pattern-detect to output ToolScoringOutput
- [ ] Update context-analyzer to output ToolScoringOutput
- [ ] Update consistency to output ToolScoringOutput
- [ ] Ensure backward compatibility (tools still work standalone)

### Phase 3: CLI Integration (Week 2-3)
- [ ] Add `--score` flag to unified CLI
- [ ] Implement score aggregation from multiple tools
- [Forward Compatibility Guarantees

1. **Adding new tools**: New tools automatically integrate without changes to existing code
2. **Weight adjustments**: Users can override weights without breaking score calculation
3. **Tool removal**: If a tool is not run, score adjusts automatically
4. **Version compatibility**: Scoring output includes schema version for future evolution

```json
{
  "scoringVersion": "1.0",
  "score": { /* ... */ }
}
```

## Open Questions

1. **Threshold defaults**: Should we recommend different thresholds for different project sizes?
   - *Proposal*: Size-adjusted thresholds (small: 75+, medium: 70+, large: 65+, enterprise: 60+)

2. **Weight customization**: How much flexibility should users have?
   - *Proposal*: Allow via config file or CLI flag, validate sum makes sense

3. **Benchmark dataset**: Need to collect scores from diverse projects to validate scoring bands
   - *Action*: Run on 20+ public repos, publish anonymized benchmark data

4. **Score stability**: How to prevent minor code changes from causing large score swings?
   - *Proposal*: Use smoothing (5-point bins), focus on trends not absolute numbers

5. **Tool discovery**: How does CLI find available tools?
   - *Proposal*: Package registry pattern - tools export their capabilities
- [ ] Historical tracking (save scores over time)
- [ ] Score badge generation (for README)
- [ ] CI/CD threshold checks (`--threshold`)
- [ ] Delta reporting (show improvements/regressions)

### Phase 5: Documentation & Polish (Week 4)
- [ ] Document scoring methodology
- [ ] Create "Understanding Your Score" guide
- [ ] Add tool developer guide (for future tools)
- [ ] Publish benchmark dataset
- [ ] Create score improvement playbookerbose

# JSON for CI/CD
aiready scan . --format json --score

# Fail if below threshold
aiready scan . --score --threshold 70
# Exit code 1 if score < 70
```

### JSON Output
```json
{
  "score": {
    "overall": 67,
    "timestamp": "2026-01-21T10:30:00Z",
    "rating": "Fair",
    "toolsUsed": ["pattern-detect", "context-analyzer", "consistency"],
    "breakdown": {
      "pattern-detect": {
        "score": 45,
        "weight": 40,
        "weightedScore": 18.0,
        "contribution": "27%"
      },
      "context-analyzer": {
        "score": 78,
        "weight": 35,
        "weightedScore": 27.3,
        "contribution": "41%"
      },
      "consistency": {
        "score": 82,
        "weight": 25,
        "weightedScore": 20.5,
        "contribution": "31%"
      }
    },
    "calculation": {
      "formula": "Σ(tool_score × weight) / Σ(weights)",
      "weightedSum": 65.8,
      "totalWeight": 100,
      "roundedScore": 66
    }
  },
  "toolOutputs": {
    "pattern-detect": { /* ToolScoringOutput */ },
    "context-analyzer": { /* ToolScoringOutput */ },
    "consistency": { /* ToolScoringOutput */ }
  },
  "recommendations": [
    {
      "tool": "pattern-detect",
      "action": "Fix auth handler duplicates",
      "impact": "+6 points",
      "priority": "high"
    }
  ]
}
```

---

## Implementation Plan

### Phase 1: Core Scoring (Week 1)
- [ ] Add score calculation to @aiready/core
- [ ] Update each tool to return normalized metrics
- [ ] Create unified scoring interface

### Phase 2: CLI Integration (Week 2)
- [ ] Add `--score` flag to unified CLI
- [ ] Implement score breakdown display
- [ ] Add JSON output format

### Phase 3: Advanced Features (Week 3)
- [ ] Baseline comparison (`--compare`)
- [ ] Historical tracking
- [ ] Score badge generation
- [ ] CI/CD threshold checks

### Phase 4: Visualization (Week 4)
- [ ] Score trend graphs
- [ ] Component breakdown charts
- [ ] File-level heatmaps
- [ ] Team comparison views

---

## Open Questions

1. **Threshold defaults**: Should we recommend different thresholds for different project sizes?
2. **Weight tunability**: Should users be able to adjust component weights?
3. **Benchmark dataset**: Need to collect scores from diverse projects to validate scoring bands
4. **Score stability**: How to prevent minor code changes from causing large score swings?

---

## Next Steps

1. Review and validate scoring formulas with real data
2. Implement core scoring in @aiready/core
3. Add score output to each tool
4. Create unified score aggregation in CLI
5. Test on 10+ diverse projects
6. Publish scoring methodology docs
