# AIReady

> AI-readiness analysis tools for reducing tech debt and optimizing codebases for AI adoption

## 🎯 Mission

As AI becomes deeply integrated into SDLC, codebases accumulate tech debt faster due to:
- Knowledge cutoff limitations in AI models
- Different model preferences across team members
- Duplicated patterns AI doesn't recognize
- Context fragmentation that breaks AI understanding

AIReady helps teams **assess, visualize, and prepare** repositories for better AI adoption.

## 📦 Packages

### Core Tools (Free)

- **[@aiready/pattern-detect](./packages/pattern-detect)** [![npm](https://img.shields.io/npm/v/@aiready/pattern-detect)](https://www.npmjs.com/package/@aiready/pattern-detect) - Semantic duplicate detection for AI-generated patterns
- **[@aiready/context-analyzer](./packages/context-analyzer)** [![npm](https://img.shields.io/npm/v/@aiready/context-analyzer)](https://www.npmjs.com/package/@aiready/context-analyzer) - Context window cost & dependency fragmentation analysis ✨ **NEW**
- **[@aiready/doc-drift](./packages/doc-drift)** - Documentation freshness vs code churn tracking _(Coming Soon)_
- **[@aiready/consistency](./packages/consistency)** - Naming & pattern consistency scoring _(Coming Soon)_
- **[@aiready/cli](./packages/cli)** - Unified CLI for all analysis tools ✨ **NEW**

### Convenience Wrappers

- **[@aiready/deps](./packages/deps)** - Dependency health (wraps madge + depcheck)

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
    "exclude": ["**/node_modules/**", "**/dist/**", "**/*.test.*"]
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

## 📄 License

MIT - See LICENSE in individual packages
