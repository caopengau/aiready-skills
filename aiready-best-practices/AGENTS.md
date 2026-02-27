# AIReady Best Practices

**Version 0.2.0**  
AIReady  
February 2026

> **Note:**  
> This document is for AI agents and LLMs to follow when writing,  
> maintaining, or refactoring AI-friendly codebases.  
> Humans may find it useful, but guidance here is optimized for  
> AI-assisted workflows and automated consistency.

---

## Abstract

Guidelines for writing AI-friendly codebases that AI coding assistants can understand and maintain effectively. Based on analysis of thousands of repositories and common AI model failure patterns. Covers pattern detection, AI signal clarity, context optimization, change amplification, agent grounding, consistency checking, documentation, testability, and dependency management.

---

## Detecting Issues

To check your codebase for all AI-readiness issues at once, use the unified aiready CLI:

```bash
# Run all available checks
aiready scan .

# Run specific tools
aiready scan . --tools pattern-detect,ai-signal-clarity,context-analyzer

# Output JSON for automation
aiready scan . --output json
```

---

## 1. Pattern Detection (patterns) (CRITICAL)

### 1.1 Avoid Semantic Duplicate Patterns

**Impact: CRITICAL (30-70% context window waste)**

Semantic duplicates—components, functions, or modules that perform the same task with different names—waste AI context window tokens and confuse pattern recognition.

See `rules/patterns-semantic-duplicates.md` for examples.

Reference: https://getaiready.dev/docs/pattern-detect

### 1.2 Unify Fragmented Interfaces

**Impact: CRITICAL (40-80% reduction in AI confusion)**

Multiple similar interfaces for the same concept confuse AI models and lead to incorrect implementations.

See `rules/patterns-interface-fragmentation.md` for examples.

Reference: https://refactoring.guru/extract-interface

---

## 2. AI Signal Clarity (signal) (CRITICAL)

### 2.1 Avoid Boolean Trap Parameters

**Impact: CRITICAL (High confusion potential)**

Boolean parameters with unclear meaning cause AI assistants to incorrectly flip or interpret their intent.

See `rules/signal-boolean-traps.md` for examples.

Reference: https://getaiready.dev/docs/ai-signal-clarity

### 2.2 Avoid Magic Literals

**Impact: CRITICAL (AI cannot infer business rules)**

Unnamed constants prevent AI from understanding business rules and domain constraints.

See `rules/signal-magic-literals.md` for examples.

Reference: https://getaiready.dev/docs/ai-signal-clarity

### 2.3 Avoid High-Entropy Naming

**Impact: CRITICAL (AI cannot disambiguate intent)**

Names with multiple semantic interpretations confuse AI models about code intent.

See `rules/signal-naming-entropy.md` for examples.

Reference: https://getaiready.dev/docs/ai-signal-clarity

---

## 3. Context Optimization (context) (HIGH)

### 3.1 Keep Import Chains Shallow

**Impact: HIGH (10-30% reduction in context depth)**

Deep import chains force AI models to load many intermediate files, exceeding context limits.

See `rules/context-import-depth.md` for examples.

Reference: https://getaiready.dev/docs/context-analyzer

### 3.2 Maintain High Module Cohesion

**Impact: HIGH (25-40% reduction in context pollution)**

Low cohesion forces AI to load multiple unrelated files to understand one feature.

See `rules/context-cohesion.md` for examples.

Reference: https://en.wikipedia.org/wiki/Cohesion_(computer_science)

### 3.3 Split Large Files (>500 lines)

**Impact: HIGH (30-50% reduction in context window usage)**

Files over 500 lines often exceed AI context windows or force loading unnecessary code.

See `rules/context-file-size.md` for examples.

Reference: https://refactoring.guru/extract-class

---

## 4. Change Amplification (amplification) (HIGH)

### 4.1 Avoid Change Amplification Hotspots

**Impact: HIGH (Predicts edit explosion risk)**

High fan-in/fan-out files cause cascading updates when modified, exceeding AI context windows.

See `rules/amplification-hotspots.md` for examples.

Reference: https://getaiready.dev/docs/change-amplification

---

## 5. Agent Grounding (grounding) (HIGH)

### 5.1 Define Clear Context Boundaries

**Impact: HIGH (AI cannot retrieve relevant context)**

Unclear domain boundaries confuse AI about which code to load for a given task.

See `rules/grounding-context-boundaries.md` for examples.

Reference: https://getaiready.dev/docs/agent-grounding

### 5.2 Write Agent-Actionable READMEs

**Impact: HIGH (AI needs high-level context)**

Poor READMEs leave AI without the context needed to make architectural decisions.

See `rules/grounding-readme-quality.md` for examples.

Reference: https://getaiready.dev/docs/agent-grounding

---

## 6. Consistency Checking (consistency) (MEDIUM)

### 6.1 Follow Consistent Naming Conventions

**Impact: MEDIUM (5-15% improvement in AI pattern recognition)**

Inconsistent naming confuses AI about code intent and relationships.

See `rules/consistency-naming-conventions.md` for examples.

Reference: https://getaiready.dev/docs/consistency

### 6.2 Use Consistent Error Handling Patterns

**Impact: MEDIUM (15-25% improvement in AI error handling)**

Mixed error patterns confuse AI about which pattern to use.

See `rules/consistency-error-handling.md` for examples.

Reference: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

---

## 7. Testability (testability) (MEDIUM)

### 7.1 Write Pure Functions

**Impact: MEDIUM (AI cannot easily verify impure code)**

Impure functions make verification difficult and cause AI to enter retry loops.

See `rules/testability-purity.md` for examples.

Reference: https://getaiready.dev/docs/testability

### 7.2 Maintain Verification Coverage

**Impact: MEDIUM (AI cannot confirm changes without tests)**

Low test coverage forces AI into trial-and-error loops.

See `rules/testability-verification.md` for examples.

Reference: https://getaiready.dev/docs/testability

---

## 8. Documentation (docs) (MEDIUM)

### 8.1 Keep Documentation in Sync with Code

**Impact: MEDIUM (20-30% reduction in AI suggestion errors)**

Outdated documentation misleads AI models about current code behavior.

See `rules/docs-code-sync.md` for examples.

Reference: https://jsdoc.app/

---

## Quick Reference

| Category | Priority | Rule Files |
|----------|----------|------------|
| Pattern Detection | CRITICAL | patterns-semantic-duplicates, patterns-interface-fragmentation |
| AI Signal Clarity | CRITICAL | signal-boolean-traps, signal-magic-literals, signal-naming-entropy |
| Context Optimization | HIGH | context-import-depth, context-cohesion, context-file-size |
| Change Amplification | HIGH | amplification-hotspots |
| Agent Grounding | HIGH | grounding-context-boundaries, grounding-readme-quality |
| Consistency | MEDIUM | consistency-naming-conventions, consistency-error-handling |
| Testability | MEDIUM | testability-purity, testability-verification |
| Documentation | MEDIUM | docs-code-sync |

---

## References

1. [https://getaiready.dev](https://getaiready.dev)
2. [https://getaiready.dev/docs](https://getaiready.dev/docs)
3. [https://getaiready.dev/docs/pattern-detect](https://getaiready.dev/docs/pattern-detect)
4. [https://getaiready.dev/docs/ai-signal-clarity](https://getaiready.dev/docs/ai-signal-clarity)
5. [https://getaiready.dev/docs/change-amplification](https://getaiready.dev/docs/change-amplification)
6. [https://getaiready.dev/docs/agent-grounding](https://getaiready.dev/docs/agent-grounding)
7. [https://getaiready.dev/docs/testability](https://getaiready.dev/docs/testability)