---
name: aiready-best-practices
description: Guidelines for writing AI-friendly code. Detects semantic duplicates, context fragmentation, naming inconsistencies, AI signal clarity issues, change amplification hotspots, agent grounding problems, and testability barriers. Use when writing new code, reviewing PRs, refactoring for AI adoption, or debugging AI assistant confusion. Helps minimize context waste and improve AI comprehension.
version: v0.2.0
license: MIT
authors:
  - AIReady <contact@getaiready.dev>
keywords:
  - aiready
  - ai-coding
  - best-practices
  - code-quality
  - agent-skills
  - ai-friendly
homepage: https://getaiready.dev
repository: https://github.com/caopengau/aiready-skills
---

# AIReady Best Practices

Guidelines for writing code that AI coding assistants can understand and maintain effectively. Based on analysis of thousands of repositories and common AI model failure patterns.

## When to Apply

Reference these guidelines when:

- **Writing new features** - Apply patterns from the start
- **Reviewing pull requests** - Check for AI-unfriendly patterns
- **Refactoring code** - Improve AI comprehension
- **Debugging AI confusion** - Fix when assistants give wrong suggestions
- **Preparing for AI adoption** - Modernize codebase structure

## Rule Categories by Priority

| Priority | Category               | Impact   | Prefix              |
| -------- | ---------------------- | -------- | ------------------- |
| 1        | Pattern Detection      | CRITICAL | `patterns-`         |
| 2        | AI Signal Clarity      | CRITICAL | `signal-`           |
| 3        | Context Optimization   | HIGH     | `context-`          |
| 4        | Change Amplification   | HIGH     | `amplification-`    |
| 5        | Agent Grounding        | HIGH     | `grounding-`        |
| 6        | Consistency Checking   | MEDIUM   | `consistency-`      |
| 7        | Documentation          | MEDIUM   | `docs-`             |
| 8        | Testability            | MEDIUM   | `testability-`      |
| 9        | Dependencies           | LOW      | `deps-`             |

## Quick Reference

### 1. Pattern Detection (CRITICAL)

- `patterns-semantic-duplicates` - Consolidate duplicate implementations
- `patterns-consistent-naming` - Use consistent names for similar concepts
- `patterns-interface-fragmentation` - Unify similar interfaces

### 2. AI Signal Clarity (CRITICAL)

- `signal-boolean-traps` - Avoid multi-boolean parameters that flip AI intent
- `signal-magic-literals` - Name constants instead of using unnamed values
- `signal-naming-entropy` - Avoid variable names with multiple interpretations

### 3. Context Optimization (HIGH)

- `context-import-depth` - Keep import chains shallow (max 3 levels)
- `context-cohesion` - Group related functionality together
- `context-file-size` - Split oversized files

### 4. Change Amplification (HIGH)

- `amplification-hotspots` - Identify high fan-in/fan-out coupling files

### 5. Agent Grounding (HIGH)

- `grounding-context-boundaries` - Clear domain boundaries for AI retrieval
- `grounding-readme-quality` - README provides sufficient agent context

### 6. Consistency Checking (MEDIUM)

- `consistency-naming-conventions` - Follow project-wide naming patterns
- `consistency-error-handling` - Use consistent error patterns

### 7. Documentation (MEDIUM)

- `docs-code-sync` - Keep docs in sync with code changes
- `docs-ai-context` - Document non-obvious AI context needs

### 8. Testability (MEDIUM)

- `testability-purity` - Avoid global state and side effects
- `testability-verification` - Ensure tests exist for AI verification

### 9. Dependencies (LOW)

- `deps-circular` - Avoid circular dependencies
- `deps-freshness` - Keep dependencies up to date

## Running the Unified Scan

To check your codebase for all AI-readiness issues at once, use the unified aiready CLI:

```bash
# Run all available checks
aiready scan .

# Run specific tools
aiready scan . --tools pattern-detect,ai-signal-clarity,context-analyzer

# Scan a specific directory
aiready scan ./src

# Output JSON for automation
aiready scan . --output json
```

The unified scan runs all analysis tools and provides a combined report with:
- Pattern detection issues (semantic duplicates, interface fragmentation)
- AI signal clarity issues (boolean traps, magic literals, naming entropy)
- Context optimization issues (import depth, file size, cohesion)
- Change amplification hotspots (high fan-in/fan-out files)
- Agent grounding issues (context boundaries, README quality)
- Consistency violations (naming, error handling)
- Documentation drift (outdated comments)
- Testability issues (purity, verification coverage)

Each rule file references the specific tool that detects it, making it easy to focus on individual categories.

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md`

## Context Efficiency

This skill is designed for efficient context usage:

- **Lazy loading**: Only relevant rules are loaded when needed
- **Progressive disclosure**: Detailed examples are in separate files
- **Focused rules**: Each rule addresses one specific pattern
- **Measurable impact**: Clear metrics for each improvement

## Related Tools

These guidelines complement the AIReady CLI tools:

- **@aiready/pattern-detect** - Automated semantic duplicate detection
- **@aiready/context-analyzer** - Context window cost analysis
- **@aiready/consistency** - Naming convention checking
- **@aiready/ai-signal-clarity** - Boolean traps, magic literals, naming entropy detection
- **@aiready/change-amplification** - Coupling and hotspot analysis
- **@aiready/agent-grounding** - Domain boundary and README quality
- **@aiready/testability** - Purity and verification analysis
- **@aiready/doc-drift** - Documentation freshness tracking
- **@aiready/cli** - Unified analysis tool

Learn more: [https://getaiready.dev](https://getaiready.dev)