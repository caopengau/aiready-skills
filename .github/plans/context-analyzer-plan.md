# @aiready/context-analyzer - Implementation Plan

> **Reference this document when implementing the context-analyzer spoke tool**

## 🎯 Problem Statement

**The AI Context Window Cost Problem:**

AI coding assistants are limited by context windows, but teams unknowingly structure code in ways that maximize context consumption:

- **Scattered implementations** - Related logic fragmented across many files
- **Deep import chains** - Need to load dozens of files to understand one function
- **Bloated files** - Individual files that consume excessive tokens
- **Poor cohesion** - Files mixing unrelated concerns, wasting context budget

### Impact

Every time an AI tool needs to help with a module, it must load all related files. Fragmented code means:

- Higher token costs ($)
- Context limit failures
- Incomplete AI responses
- Slower development velocity

### Example Scenario

```
Before: User validation spread across 8 files = 12,450 tokens (context limit hit)
After: Consolidated into 2 cohesive files = 2,100 tokens (complete AI assistance)

Result: 83% reduction in context cost, faster AI responses, better code understanding
```

## 📊 Core Metrics

### File-Level Metrics

- **Token Cost** - Total tokens in this file (~4 chars per token)
- **Import Depth** - Longest chain of transitive dependencies
- **Dependency Count** - Total files needed to understand this one

### Module-Level Metrics

- **Fragmentation Score** (0-100%) - How scattered related code is
- **Cohesion Score** (0-100%) - How well grouped related logic is
- **Context Budget** - Total tokens AI needs to load for this module

### Actionable Insights

- **Hot Paths** - Files frequently needed together
- **Context Hogs** - Individual files consuming excessive tokens
- **Refactoring Opportunities** - Specific consolidation recommendations

## 🔧 Technical Implementation

### Phase 1: Core Analysis Engine

```typescript
// packages/context-analyzer/src/types.ts
export interface ContextAnalysisResult {
  file: string;

  // Basic metrics
  tokenCost: number;
  linesOfCode: number;

  // Dependency analysis
  importDepth: number; // Max depth of import tree
  dependencyCount: number; // Total transitive deps
  dependencyList: string[]; // All files in dep tree

  // Cohesion analysis
  cohesionScore: number; // 0-1, how related are exports
  domains: string[]; // Detected domain categories
  exportCount: number;

  // AI context impact
  contextBudget: number; // Total tokens to understand this file
  fragmentationScore: number; // 0-1, how scattered is this domain
  relatedFiles: string[]; // Files that should be loaded together

  // Recommendations
  severity: 'critical' | 'major' | 'minor' | 'info';
  recommendations: string[];
  potentialSavings: number; // Estimated token savings
}

export interface ModuleCluster {
  domain: string; // e.g., "user-management", "auth"
  files: string[];
  totalTokens: number;
  fragmentationScore: number;
  suggestedStructure: {
    targetFiles: number;
    consolidationPlan: string[];
  };
}
```

### Key Algorithms

#### 1. Dependency Graph Construction (DFS-based)

**Algorithm:** Recursive depth-first traversal with cycle detection

```typescript
// Build transitive dependency tree
function buildDependencyGraph(files: FileContent[]): DependencyGraph {
  const nodes = new Map<string, DependencyNode>();
  const edges = new Map<string, Set<string>>();

  // First pass: create nodes
  for (const { file, content } of files) {
    const imports = extractImportsFromContent(content);
    const exports = extractExports(content);
    nodes.set(file, {
      file,
      imports,
      exports,
      tokenCost: estimateTokens(content),
      linesOfCode: content.split('\n').length,
    });
    edges.set(file, new Set(imports));
  }

  return { nodes, edges };
}
```

**Complexity:** O(n) where n = number of files

#### 2. Import Depth Analysis (Recursive DFS)

**Algorithm:** Calculate maximum depth of import tree

```typescript
function calculateImportDepth(
  file: string,
  graph: DependencyGraph,
  visited = new Set<string>(),
  depth = 0
): number {
  if (visited.has(file)) return depth; // Cycle detection

  const dependencies = graph.edges.get(file);
  if (!dependencies || dependencies.size === 0) {
    return depth; // Leaf node
  }

  visited.add(file);
  let maxDepth = depth;

  for (const dep of dependencies) {
    const depDepth = calculateImportDepth(dep, graph, visited, depth + 1);
    maxDepth = Math.max(maxDepth, depDepth);
  }

  visited.delete(file); // Backtrack for other paths
  return maxDepth;
}
```

**Formula:**

```
depth(file) = 1 + max(depth(dependencies))
where base case: depth(leaf) = 0
```

**Complexity:** O(V + E) where V = files, E = import edges

#### 3. Context Budget Calculation (Transitive Sum)

**Algorithm:** Sum token costs across entire dependency tree

```typescript
function calculateContextBudget(file: string, graph: DependencyGraph): number {
  const node = graph.nodes.get(file);
  if (!node) return 0;

  let totalTokens = node.tokenCost;
  const deps = getTransitiveDependencies(file, graph);

  for (const dep of deps) {
    const depNode = graph.nodes.get(dep);
    if (depNode) {
      totalTokens += depNode.tokenCost;
    }
  }

  return totalTokens;
}
```

**Formula:**

```
budget(file) = tokens(file) + Σ tokens(transitive_deps)
```

**Complexity:** O(V + E) - traverses entire subgraph

#### 4. Cohesion Score (Shannon Entropy)

**Algorithm:** Measure how related exports are within a file

```typescript
function calculateCohesion(exports: ExportInfo[]): number {
  if (exports.length <= 1) return 1; // Perfect cohesion

  // Group by inferred domain
  const domains = exports.map((e) => e.inferredDomain || 'unknown');
  const domainCounts = new Map<string, number>();

  for (const domain of domains) {
    domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
  }

  // Calculate Shannon entropy
  const total = domains.length;
  let entropy = 0;

  for (const count of domainCounts.values()) {
    const p = count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  // Normalize to 0-1 (higher = better cohesion)
  const maxEntropy = Math.log2(total);
  return maxEntropy > 0 ? 1 - entropy / maxEntropy : 1;
}
```

**Shannon Entropy Formula:**

```
H(X) = -Σ p(x_i) × log₂(p(x_i))

where:
- p(x_i) = domain_count_i / total_exports
- Low entropy → single domain → high cohesion
- High entropy → mixed domains → low cohesion

Cohesion score = 1 - (H / H_max)
```

**Example:**

```typescript
// File with mixed concerns (low cohesion)
export function getUserById(id) { ... }     // domain: user
export function validateEmail(email) { ... } // domain: validation
export function logError(err) { ... }       // domain: logging

// domains = [user, validation, logging]
// All different → High entropy → Low cohesion ≈ 0.33

// File with single concern (high cohesion)
export function getUserById(id) { ... }     // domain: user
export function updateUser(data) { ... }    // domain: user
export function deleteUser(id) { ... }      // domain: user

// domains = [user, user, user]
// All same → Zero entropy → Perfect cohesion = 1.0
```

#### 5. Fragmentation Score (Directory Scatter)

**Algorithm:** Measure how scattered a domain is across directories

```typescript
function calculateFragmentation(files: string[], domain: string): number {
  if (files.length <= 1) return 0; // Single file = no fragmentation

  // Extract unique directories
  const directories = new Set(
    files.map((f) => f.split('/').slice(0, -1).join('/'))
  );

  // Fragmentation ratio
  return (directories.size - 1) / (files.length - 1);
}
```

**Formula:**

```
fragmentation = (unique_directories - 1) / (total_files - 1)

where:
- 0 = all files in same directory (good)
- 1 = all files in different directories (fragmented)
```

**Example:**

```typescript
// Low fragmentation (good)
files = [
  'src/user/get.ts',
  'src/user/create.ts',
  'src/user/update.ts'
]
directories = ['src/user'] = 1 unique
fragmentation = (1 - 1) / (3 - 1) = 0 / 2 = 0.0

// High fragmentation (bad)
files = [
  'src/api/user.ts',
  'src/services/user.ts',
  'src/models/user.ts',
  'src/utils/user-helpers.ts'
]
directories = ['src/api', 'src/services', 'src/models', 'src/utils'] = 4 unique
fragmentation = (4 - 1) / (4 - 1) = 3 / 3 = 1.0
```

#### 6. Circular Dependency Detection (Tarjan's Algorithm)

**Algorithm:** DFS with recursion stack

```typescript
function detectCircularDependencies(graph: DependencyGraph): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(file: string, path: string[]): void {
    if (recursionStack.has(file)) {
      // Found a cycle
      const cycleStart = path.indexOf(file);
      if (cycleStart !== -1) {
        cycles.push([...path.slice(cycleStart), file]);
      }
      return;
    }

    if (visited.has(file)) return;

    visited.add(file);
    recursionStack.add(file);
    path.push(file);

    const dependencies = graph.edges.get(file);
    if (dependencies) {
      for (const dep of dependencies) {
        dfs(dep, [...path]);
      }
    }

    recursionStack.delete(file); // Backtrack
  }

  for (const file of graph.nodes.keys()) {
    if (!visited.has(file)) {
      dfs(file, []);
    }
  }

  return cycles;
}
```

**Complexity:** O(V + E) - visits each node/edge once

#### 7. Module Clustering (Domain Grouping)

**Algorithm:** Group files by inferred domain, calculate aggregate metrics

```typescript
function buildDependencyGraph(entryFile: string): DependencyGraph {
  const graph = new Map<string, Set<string>>();
  const visited = new Set<string>();

  function traverse(file: string, depth: number) {
    if (visited.has(file)) return;
    visited.add(file);

    const imports = extractImports(file);
    graph.set(file, new Set(imports));

    for (const imp of imports) {
      traverse(imp, depth + 1);
    }
  }

  traverse(entryFile, 0);
  return graph;
}
```

#### 2. Fragmentation Detection

```typescript
// Identify scattered domain implementations
function analyzeFragmentation(files: string[]): ModuleCluster[] {
  // 1. Categorize files by domain using AST analysis
  const domainMap = categorizeDomains(files);

  // 2. For each domain, calculate scatter
  return Object.entries(domainMap).map(([domain, files]) => {
    const locations = files.map((f) => path.dirname(f));
    const uniqueDirs = new Set(locations);

    // Fragmentation = how many different directories
    const fragmentationScore = uniqueDirs.size / files.length;
    const totalTokens = sumTokens(files);

    return {
      domain,
      files,
      totalTokens,
      fragmentationScore,
      suggestedStructure: generateConsolidationPlan(files),
    };
  });
}
```

#### 3. Cohesion Analysis

```typescript
// Measure how related exports are within a file
function analyzeCohesion(file: string): number {
  const exports = extractExports(file);
  const domains = exports.map((e) => inferDomain(e.name, e.usage));

  // Calculate entropy - low entropy = high cohesion
  const domainCounts = countBy(domains);
  const total = domains.length;

  const entropy = Object.values(domainCounts)
    .map((count) => {
      const p = count / total;
      return -p * Math.log2(p);
    })
    .reduce((sum, val) => sum + val, 0);

  // Normalize to 0-1 (higher = better cohesion)
  const maxEntropy = Math.log2(domains.length);
  return 1 - entropy / maxEntropy;
}
```

#### 4. Context Budget Calculation

```typescript
// Calculate total tokens AI needs to understand this file
function calculateContextBudget(file: string): number {
  const depGraph = buildDependencyGraph(file);
  const allDeps = Array.from(depGraph.keys());

  // Sum tokens across entire dependency tree
  return allDeps.reduce((sum, f) => {
    return sum + estimateTokens(readFileSync(f, 'utf-8'));
  }, 0);
}
```

### Phase 2: CLI Interface

```bash
# Basic usage
aiready-context ./src

# Focus on specific concerns
aiready-context ./src --focus fragmentation
aiready-context ./src --focus cohesion
aiready-context ./src --focus depth

# Set thresholds
aiready-context ./src --max-depth 5 --max-context 10000

# Export formats
aiready-context ./src --output json
aiready-context ./src --output html --output-file report.html
```

### Phase 3: Programmatic API

```typescript
import { analyzeContext, generateClusters } from '@aiready/context-analyzer';

// Analyze entire project
const results = await analyzeContext({
  rootDir: './src',
  maxDepth: 5,
  maxContextBudget: 10000,
});

// Find fragmented modules
const clusters = generateClusters(results);
const fragmented = clusters.filter((c) => c.fragmentationScore > 0.6);

// Generate refactoring plan
const plan = generateRefactoringPlan(fragmented);
```

## 📊 Visualization Opportunities (SaaS)

### Dashboard Views

#### 1. **Dependency Graph Visualization**

```
Interactive force-directed graph:
- Nodes = files (sized by token cost)
- Edges = imports (directed arrows)
- Color = import depth (green=0, yellow=3, red=5+)
- Clusters = modules with high internal coupling

Interaction:
- Click node → show file details + metrics
- Hover edge → import statement
- Path highlighting: select 2 nodes → show dependency path
- Filter: hide node_modules, show only cycles

Library: Cytoscape.js or D3.js force layout
```

#### 2. **Context Budget Sunburst**

```
Hierarchical view of token costs:
- Center = root directory
- Rings = subdirectories
- Segment size = token cost
- Color intensity = context budget

Interaction:
- Click segment → zoom into directory
- Tooltip: file name, token cost, depth
- Compare mode: before/after refactoring

Library: D3.js sunburst
```

#### 3. **Fragmentation Heatmap**

```
Matrix showing domain scatter:
- Rows = domains (user, auth, order, etc.)
- Columns = directories
- Cell color = file count (white=0, red=many)
- Ideal: single red cell per row (no scatter)

Interaction:
- Click cell → list files in domain+directory
- Sort by: fragmentation score, token cost
- Export consolidation plan

Library: Plotly.js heatmap
```

#### 4. **Import Depth Histogram**

```
Distribution of import depths:
- X-axis = depth (0, 1, 2, ... 10+)
- Y-axis = file count
- Bars = color-coded by severity
- Overlay: threshold line

Interaction:
- Click bar → show files at that depth
- Adjust threshold → highlight violations
- Show: deepest import chains

Library: Chart.js bar chart
```

#### 5. **Cohesion Scatter Plot**

```
Cohesion vs Fragmentation:
- X-axis = cohesion score (0-1)
- Y-axis = fragmentation score (0-1)
- Points = domains/modules
- Size = token cost
- Quadrants: good (high cohesion, low frag), bad (low cohesion, high frag)

Interaction:
- Click point → domain details + refactoring plan
- Lasso select → bulk action (consolidate these)
- Time slider → show evolution

Library: D3.js scatter plot
```

#### 6. **Circular Dependency Diagram**

```
Chord diagram for cycles:
- Arc segments = files
- Ribbons = circular dependencies
- Thickness = dependency weight
- Color = cycle group

Interaction:
- Hover ribbon → show import chain
- Click segment → highlight all cycles involving file
- Export: cycle-breaking suggestions

Library: D3.js chord diagram
```

#### 7. **Time-Series Trends (Pro)**

```
Context cost over time:
- X-axis = commit dates
- Y-axis = total context budget / avg depth / fragmentation
- Multiple lines = different metrics
- Annotations = refactoring events, releases

Interaction:
- Zoom to date range
- Compare branches (feature vs main)
- Forecast: projected cost if trend continues

Library: Chart.js time series
```

### Real-Time Analytics

**Live Monitoring (Pro/Enterprise):**

- WebSocket updates on git push
- Real-time context budget calculator (type in editor → see impact)
- Team dashboard: current metrics per repo
- Alerts: "Context budget increased 15% this week"

### Export Formats

**Interactive Exports:**

- HTML with embedded visualizations (works offline)
- PDF reports with static charts (for stakeholders)
- Mermaid diagrams for documentation
- CSV/JSON for data analysis
- GitHub/Notion integration (embed dashboards)

### Comparative Views

**Before/After Refactoring:**

- Side-by-side comparison
- Animated transitions (watch fragmentation decrease)
- ROI calculator: "Consolidated 12 files → saved 8,450 tokens"

**Team Benchmarks:**

- Compare repos within organization
- Industry averages by language/framework
- Gamification: "Your repo is 35% more optimized than average"

## 💰 SaaS Monetization Strategy

### Free Tier: CLI Analysis

- One-time snapshot analysis
- Basic metrics and recommendations
- JSON/HTML export
- **Goal:** Hook users with value, show what's possible

### Pro Tier ($49/month)

1. **Historical Trends**
   - Track fragmentation over time
   - Measure improvement after refactoring
   - Visualize context cost changes
2. **Team Benchmarks**
   - Compare against similar codebases
   - Industry standard metrics
   - Best practice recommendations

3. **Refactoring Plans** (5/month)
   - Automated consolidation suggestions
   - Step-by-step implementation guides
   - ROI estimation

4. **Integration API**
   - Webhook notifications
   - Slack/Discord alerts
   - Export to other tools

### Enterprise Tier (Custom Pricing)

1. **AI Usage Correlation**
   - Integrate with GitHub Copilot metrics
   - Show $ spent on context waste
   - Identify most expensive modules

2. **CI/CD Integration**
   - Block PRs that increase fragmentation
   - Enforce context budget limits
   - Automated quality gates

3. **Custom Rules Engine**
   - Define organization-specific thresholds
   - Custom domain categorization
   - Tailored recommendations

4. **Team Analytics**
   - Per-team metrics
   - Cross-repo analysis
   - Portfolio-level insights

### Upsell Funnel

```
Free CLI Analysis
    ↓
Shows high fragmentation + token waste
    ↓
"Want to track this over time?" → Pro Signup
    ↓
Shows trends, benchmarks
    ↓
"Integrate with your CI/CD?" → Enterprise Demo
```

### Key Messaging

**Free → Pro:**

> "You're wasting 12,450 tokens on fragmented user management.
> Track trends and get refactoring plans → Upgrade to Pro"

**Pro → Enterprise:**

> "Your team hits context limits 120x/week costing $X/month.
> Block regressions in CI/CD → Book Enterprise Demo"

## 🎯 Success Metrics

### Tool Adoption

- Downloads/installs per month
- GitHub stars
- npm weekly downloads
- Community contributions

### SaaS Conversion

- Free → Pro conversion rate (target: 3-5%)
- Pro → Enterprise pipeline (target: 10+ demos/month)
- MRR growth
- Churn rate (target: <5%)

### User Value Delivered

- Average context cost reduction (target: 40-60%)
- Time saved per developer (tracked via surveys)
- AI assistance quality improvement
- User testimonials and case studies

## 📋 Development Phases

### Phase 1: MVP (Week 1-2)

- [ ] Core dependency graph builder
- [ ] Basic token cost calculation
- [ ] Import depth analysis
- [ ] Simple CLI output
- [ ] Unit tests

### Phase 2: Advanced Analysis (Week 3-4)

- [ ] Fragmentation detection
- [ ] Cohesion scoring
- [ ] Module clustering
- [ ] Refactoring recommendations
- [ ] HTML report generation

### Phase 3: Polish (Week 5)

- [ ] Comprehensive README
- [ ] CLI presets and examples
- [ ] Performance optimization
- [ ] Integration tests
- [ ] Publish to npm

### Phase 4: SaaS Foundation (Future)

- [ ] API endpoint for analysis upload
- [ ] Database schema for historical data
- [ ] Authentication system
- [ ] Dashboard UI
- [ ] Billing integration

## 🔗 Integration Points

### With @aiready/core

```typescript
import {
  scanFiles,
  readFileContent,
  estimateTokens,
  buildAST,
  extractImports,
} from '@aiready/core';
```

### With @aiready/pattern-detect

- Cross-reference fragmented modules with duplicate patterns
- Combined reports showing both issues
- Unified recommendations

### With Future Tools

- **@aiready/doc-drift:** Include stale docs in context cost
- **@aiready/consistency:** Factor naming patterns into cohesion
- **@aiready/deps:** Use dependency analysis for import depth

## 🚀 Competitive Positioning

### What Exists (Don't Compete)

- **madge** - Circular dependency detection (different focus)
- **dependency-cruiser** - Dependency validation rules (different angle)
- **cost-of-modules** - npm package size (not about AI context)

### Our Unique Value

1. **AI-Context Focus** - Only tool measuring context window impact
2. **Fragmentation Detection** - Identifies scattered implementations
3. **Token Cost Quantification** - Shows exact $ waste
4. **Refactoring Guidance** - Actionable consolidation plans
5. **SaaS Historical Tracking** - Trend analysis over time

### Marketing Message

> "AI tools are only as good as your code structure.
> Stop wasting context tokens on fragmented code.
> AIReady Context Analyzer shows you exactly where to consolidate."

## 📚 References

When implementing, refer to:

- `.github/copilot-instructions.md` - Overall architecture guidelines
- `packages/core/src/` - Shared utilities (scanFiles, estimateTokens, etc.)
- `packages/pattern-detect/` - Reference spoke implementation
- This document - Product vision and technical plan

---

**Next Steps:** Create package structure following hub-and-spoke pattern → Implement core algorithms → Build CLI → Test on real repos → Publish to npm
