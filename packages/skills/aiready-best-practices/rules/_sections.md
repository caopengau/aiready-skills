# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Pattern Detection (patterns)

**Impact:** CRITICAL  
**Description:** Identifies semantic duplicate patterns and naming inconsistencies that waste AI context window tokens and confuse pattern recognition. Consolidating duplicates can save 30-70% of context usage.

## 2. Context Optimization (context)

**Impact:** HIGH  
**Description:** Optimizes code organization for AI context windows. Addresses import depth, file cohesion, and dependency fragmentation that break AI understanding and lead to incomplete or incorrect suggestions.

## 3. Consistency Checking (consistency)

**Impact:** MEDIUM  
**Description:** Ensures naming conventions, error handling patterns, and API designs are consistent across the codebase. Inconsistencies confuse AI models and lead to incorrect pattern replication.

## 4. Documentation (docs)

**Impact:** MEDIUM  
**Description:** Keeps documentation synchronized with code changes. Outdated documentation misleads AI models, causing them to suggest deprecated patterns or incorrect implementations.

## 5. Dependencies (deps)

**Impact:** LOW  
**Description:** Manages dependency health, circular dependencies, and version freshness. While lower priority, dependency issues can cascade into AI confusion about available APIs and best practices.
