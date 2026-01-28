# @aiready/skills

AI-friendly coding practices packaged as agent skills for the [skills.sh](https://skills.sh/) ecosystem.

## Overview

This package provides procedural knowledge for AI coding agents to help them write and maintain code that:
- Minimizes semantic duplicates
- Optimizes context window usage
- Maintains consistency
- Keeps documentation fresh
- Manages dependencies effectively

## Installation

### Via skills.sh (Recommended)

```bash
npx skills add caopengau/aiready-skills
```

> **Note:** This skill is distributed via skills.sh, not npm. It's designed for AI agents to consume directly.

## Available Skills

### aiready-best-practices

Guidelines for writing AI-friendly code. Use when:
- Writing new features or refactoring
- Reviewing pull requests
- Preparing codebases for AI adoption
- Debugging AI assistant confusion

**Covers:**
- Pattern Detection (CRITICAL) - Semantic duplicates, naming consistency
- Context Optimization (HIGH) - Import depth, file cohesion
- Consistency Checking (MEDIUM) - Naming conventions, error patterns
- Documentation (MEDIUM) - Code-doc sync
- Dependencies (LOW) - Circular deps, freshness

## Structure

```
packages/skills/
├── aiready-best-practices/      # The skill
│   ├── SKILL.md                # Entry point (indexed by skills.sh)
│   ├── AGENTS.md               # Compiled full document
│   ├── rules/                  # Individual rule files
│   └── metadata.json           # Version, organization
└── src/                        # Build tooling
    ├── build.ts               # Compiles rules → AGENTS.md
    ├── parser.ts              # Parses rule files
    ├── config.ts              # Section mapping
    └── types.ts               # Rule types
```

## Development

### Creating a New Rule

1. Copy the template:
```bash
cp aiready-best-practices/rules/_template.md aiready-best-practices/rules/section-name.md
```

2. Choose the appropriate prefix:
   - `patterns-` - Pattern Detection (Section 1)
   - `context-` - Context Optimization (Section 2)
   - `consistency-` - Consistency Checking (Section 3)
   - `docs-` - Documentation (Section 4)
   - `deps-` - Dependencies (Section 5)

3. Fill in the content following the template

4. Build to regenerate AGENTS.md:
```bash
pnpm run build
```

### Building

```bash
# Build AGENTS.md from rules
pnpm run build

# Build and increment version
pnpm run build:upgrade

# Validate all rules
pnpm run validate

# Build + validate
pnpm run dev
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](./LICENSE)
