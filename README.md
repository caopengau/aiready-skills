# AIReady

> Explains why AI tools struggle with your codebase—and where small changes unlock outsized leverage

🌐 **[Visit our website](https://getaiready.dev)** | 📦 [npm](https://www.npmjs.com/package/@aiready/cli) | ⭐ [GitHub](https://github.com/caopengau/aiready-cli)

📖 **Quick Links:** [🚀 Quick Start (5 min)](./QUICK-START.md) | [🔐 Security](./SECURITY.md) | [🤔 Not Another Linter?](./NOT-ANOTHER-LINTER.md) | [🏢 Enterprise](./ENTERPRISE-READINESS-PLAN.md)

## 🎯 Mission

As AI becomes deeply integrated into SDLC, codebases become harder for AI models to understand due to:
- Knowledge cutoff limitations in AI models
- Different model preferences across team members
- Duplicated patterns AI doesn't recognize
- Context fragmentation that breaks AI understanding

AIReady helps teams **assess, visualize, and prepare** repositories for better AI adoption.

## 🌍 Language Support

**Currently Supported (64% market coverage):**
- ✅ **TypeScript** (`.ts`, `.tsx`)
- ✅ **JavaScript** (`.js`, `.jsx`)
- ✅ **Python** (`.py`) - NEW! PEP 8 conventions, import analysis, pattern detection

**Roadmap:**
- 🔜 **Java** (Q3 2026) - Maven/Gradle, Spring Framework
- 🔜 **Go** (Q4 2026) - Go modules, concurrency patterns
- 🔜 **Rust** (Q4 2026) - Cargo, ownership patterns
- 🔜 **C#** (Q1 2027) - .NET, LINQ patterns

Mixed-language projects are fully supported - the tool automatically detects and analyzes each file type appropriately.

## 📦 Packages

### Core Tools (Free)

- **[@aiready/cli](https://www.npmjs.com/package/@aiready/cli)** [![npm](https://img.shields.io/npm/v/@aiready/cli)](https://www.npmjs.com/package/@aiready/cli) - Unified CLI interface for running all analysis tools together or individually
- **[@aiready/pattern-detect](https://www.npmjs.com/package/@aiready/pattern-detect)** [![npm](https://img.shields.io/npm/v/@aiready/pattern-detect)](https://www.npmjs.com/package/@aiready/pattern-detect) - Detect semantic duplicate patterns that waste AI context window tokens
- **[@aiready/context-analyzer](https://www.npmjs.com/package/@aiready/context-analyzer)** [![npm](https://img.shields.io/npm/v/@aiready/context-analyzer)](https://www.npmjs.com/package/@aiready/context-analyzer) - Analyze context window costs, import depth, cohesion, and fragmentation
- **[@aiready/consistency](https://www.npmjs.com/package/@aiready/consistency)** [![npm](https://img.shields.io/npm/v/@aiready/consistency)](https://www.npmjs.com/package/@aiready/consistency) - Check naming conventions and pattern consistency across your codebase

### Coming Soon

- **[@aiready/doc-drift](./packages/doc-drift)** - Track documentation freshness vs code churn to identify outdated docs
- **[@aiready/deps](./packages/deps)** - Analyze dependency health and detect circular dependencies

## 🏗️ Architecture

AIReady uses a **hub-and-spoke architecture** for modularity and extensibility:

```
┌─────────────────────────────────────────────────────────────────┐
│                           🎯 USER                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        🎛️  CLI (@aiready/cli)                  │
│                    Unified Interface & Orchestration            │
│  • Single command for all tools                                │
│  • Multi-language support (auto-detects files)                 │
│  • Scoring & unified reporting                                 │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      🏢 HUB (@aiready/core)                      │
│                   Shared Infrastructure                         │
│  • Multi-language parsers (TS, JS, Python)                     │
│  • File scanning & analysis utilities                          │
│  • Common types & interfaces                                   │
│  • No dependencies on spokes                                   │
└─────┬───────────┬───────────┬───────────┬───────────┬───────────┘
      │           │           │           │           │
      ▼           ▼           ▼           ▼           ▼
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│  📊 PATTERN │  📦 CONTEXT │  🔧 CONSIST │  📚 DOC     │  📋 DEPS    │
│   DETECT    │   ANALYZER  │   ENCY      │   DRIFT     │   ANALYZER  │
│             │             │             │             │             │
│  • Semantic │  • Context  │  • Naming   │  • Doc      │  • Dep      │
│    duplicates│   budgets   │   rules     │   freshness │   health    │
│             │             │             │             │             │
│  ✅ Ready   │  ✅ Ready   │  ✅ Ready   │  🔜 Soon    │  🔜 Soon    │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
   @aiready/     @aiready/     @aiready/     @aiready/     @aiready/
   pattern-      context-      consistency  doc-drift    deps
   detect        analyzer
```

### 🎯 Design Benefits

- **Modular**: Use individual tools or run everything together
- **Independent**: Each spoke focuses on one problem, can be updated separately
- **Extensible**: Easy to add new languages or analysis types
- **Clean**: Spokes only depend on core, not each other

### 🌍 Language Support

**Currently Supported (64% market coverage):**
- ✅ **TypeScript** (`.ts`, `.tsx`)
- ✅ **JavaScript** (`.js`, `.jsx`)
- ✅ **Python** (`.py`) - NEW! PEP 8 conventions, import analysis, pattern detection

**Roadmap:**
- 🔜 **Java** (Q3 2026) - Maven/Gradle, Spring Framework
- 🔜 **Go** (Q4 2026) - Go modules, concurrency patterns
- 🔜 **Rust** (Q4 2026) - Cargo, ownership patterns
- 🔜 **C#** (Q1 2027) - .NET, LINQ patterns

Mixed-language projects are fully supported - the tool automatically detects and analyzes each file type appropriately.

## 🚀 Quick Start

### Using Individual Tools

```bash
# Detect semantic duplicates
npx @aiready/pattern-detect ./src

# Analyze context costs
npx @aiready/context-analyzer ./src --output json

# Or install globally
npm install -g @aiready/pattern-detect @aiready/context-analyzer
```

> **💡 Smart Defaults:** All tools automatically:
> - Exclude test files, build outputs, and node_modules
> - Adjust sensitivity based on codebase size (~10 most serious issues)
> - Save reports to `.aiready/` directory
> 
> Use `--include-tests`, `--exclude`, or threshold options to customize behavior.

### Using Unified CLI

```bash
# Install CLI globally
npm install -g @aiready/cli

# Run unified analysis (patterns + context)
aiready scan .

# Run individual tools
aiready patterns . --similarity 0.6
aiready context . --max-depth 3

# Get JSON output (saved to .aiready/ by default)
aiready scan . --output json

# Specify custom output path
aiready scan . --output json --output-file custom-path.json
```

> **📁 Note:** All output files (JSON, HTML, Markdown) are saved to the `.aiready/` directory by default unless you specify a custom path with `--output-file`.

## 📊 AI Readiness Scoring

Get a unified **0-100 score** that quantifies how well your codebase works with AI coding assistants:

```bash
aiready scan . --score
```

**Example Output:**
```
🎯 AI Readiness Score: 65/100 (Fair)

📊 Breakdown:
  • Pattern Detection:    66/100  (40% weight)
  • Context Analysis:     52/100  (35% weight)  
  • Consistency:          80/100  (25% weight)

Calculation: (66×40 + 52×35 + 80×25) / 100 = 65
```

### Rating Scale

| Score | Rating | What It Means |
|-------|--------|---------------|
| 90-100 | 🟢 Excellent | AI works optimally |
| 75-89  | 🟡 Good | Minor improvements possible |
| 60-74  | 🟠 Fair | Noticeable AI confusion |
| 40-59  | 🔴 Needs Work | Significant AI struggles |
| 0-39   | 🚨 Critical | Major refactoring recommended |

### Customize Weights

Adjust tool importance based on your priorities:

```bash
# Emphasize pattern detection (e.g., for AI code generation)
aiready scan . --score --weights patterns:50,context:30,consistency:20

# Prioritize context efficiency (e.g., for large codebases)
aiready scan . --score --weights context:50,patterns:30,consistency:20

# Balance all three equally
aiready scan . --score --weights patterns:33,context:33,consistency:34
```

### Set Quality Threshold

Fail CI builds if code doesn't meet your standards:

```bash
# Require "Good" rating or better
aiready scan . --score --threshold 75

# Custom threshold
aiready scan . --score --threshold 70
```

### Forward-Compatible & Customizable

**Forward-Compatible:**
- Scores remain comparable as we add new tools
- New tools are opt-in via `--tools` flag
- Existing scores won't change when new tools launch
- Historical trends stay valid

**Fully Customizable:**
- Adjust weights for your team's priorities
- Run scoring with any tool combination
- Override defaults via config files
- Scoring is optional (backward compatible)

**Examples:**
```bash
# Only score patterns + context (no consistency)
aiready scan . --tools patterns,context --score

# Future: When new tools are added, opt-in explicitly
aiready scan . --tools patterns,context,consistency,doc-drift --score
```

See [Scoring Algorithm Details](./.github/plans/scoring-algorithm.md) for complete methodology and future roadmap.

## ⚙️ Configuration

AIReady supports configuration files for persistent settings. Create one of these files in your project root:

- `aiready.json`
- `aiready.config.json` 
- `.aiready.json`
- `.aireadyrc.json`
- `aiready.config.js`
- `.aireadyrc.js`

### Example Configuration

```json
{
  "scan": {
    "include": ["**/*.{ts,tsx,js,jsx}"],
    "exclude": ["**/node_modules/**", "**/dist/**"]
  },
  "tools": {
    "pattern-detect": {
      "minSimilarity": 0.5,
      "minLines": 8,
      "severity": "high",
      "includeTests": false,
      "maxResults": 10
    },
    "context-analyzer": {
      "maxDepth": 5,
      "maxContextBudget": 100000,
      "minCohesion": 0.7,
      "maxResults": 10
    }
  },
  "output": {
    "format": "console",
    "file": null
  }
}
```

CLI options override config file settings.

**Default Exclusions:** By default, test files are excluded from all analyses (patterns: `**/*.test.*`, `**/*.spec.*`, `**/__tests__/**`, `**/test/**`, `**/tests/**`). Use `--include-tests` flag or `"includeTests": true` in config to include them.

**Note:** Console output is limited by default to prevent overwhelming displays. Use `--max-results` to control how many items are shown, or `--output json` for complete results.

## 🏗️ Development

We use a **Makefile-based workflow** for local development. See [MAKEFILE.md](./MAKEFILE.md) for full documentation.

### Quick Commands

```bash
# See all available commands
make help

# Install dependencies
make install

# Build all packages
make build

# Run tests
make test

# Fix code issues (lint + format)
make fix

# Run all quality checks
make check

# Pre-commit checks
make pre-commit
```

### Traditional pnpm Commands (still work)

```bash
pnpm install
pnpm build
pnpm test
pnpm dev
```

## 🚧 Project Status

AIReady is currently tool-only. The website and hosted SaaS are not live yet. The open-source CLI and packages provide:
- Pattern detection and context cost analysis
- Consistency checks (naming and patterns)
- Unified CLI with JSON/console outputs

Roadmap (planned, not yet available):
- Historical trend analysis and team benchmarking
- Custom rule engines and integration APIs
- Automated fix suggestions and CI/CD integration

## � Stats & Analytics

Track package downloads, GitHub metrics, and growth:

```bash
# Show current stats
make stats

# Export for historical tracking
make stats-export

# Weekly report with growth tips
make stats-weekly
```

See [Tracking Stats Guide](./docs/TRACKING-STATS.md) for complete details.

## �📄 License

MIT - See LICENSE in individual packages
