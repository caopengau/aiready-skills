# AIReady Best Practices

**Version 0.1.0**  
AIReady  
January 2026

> **Note:**  
> This document is for AI agents and LLMs to follow when writing,  
> maintaining, or refactoring AI-friendly codebases.  
> Humans may find it useful, but guidance here is optimized for  
> AI-assisted workflows and automated consistency.

---

## Abstract

Guidelines for writing AI-friendly codebases that AI coding assistants can understand and maintain effectively. Based on analysis of thousands of repositories and common AI model failure patterns. Covers pattern detection, context optimization, consistency checking, documentation drift, and dependency management.

---

## Table of Contents

1. [Pattern Detection (patterns)](#1-pattern-detection-(patterns)) (CRITICAL)
   - 1.1 [Avoid Semantic Duplicate Patterns](#11-avoid-semantic-duplicate-patterns)
2. [Context Optimization (context)](#2-context-optimization-(context)) (HIGH)
   - 2.1 [Keep Import Chains Shallow](#21-keep-import-chains-shallow)
3. [Consistency Checking (consistency)](#3-consistency-checking-(consistency)) (MEDIUM)
   - 3.1 [Follow Consistent Naming Conventions](#31-follow-consistent-naming-conventions)

---

## 1. Pattern Detection (patterns)

**Impact: CRITICAL**

Identifies semantic duplicate patterns and naming inconsistencies that waste AI context window tokens and confuse pattern recognition. Consolidating duplicates can save 30-70% of context usage.

---

### 1.1 Avoid Semantic Duplicate Patterns

**Impact: CRITICAL (30-70% context window waste)**

*Tags: patterns, duplicates, context-window, semantic-similarity*

Semantic duplicates—components, functions, or modules that perform the same task with different names—waste AI context window tokens and confuse pattern recognition. AI models struggle to identify which implementation to use, leading to inconsistent suggestions and hallucinated variations.

When AI encounters multiple implementations of the same concept, it:
- Wastes tokens loading all variations into context
- Cannot determine the canonical pattern
- Suggests mixing patterns inappropriately
- Creates new variations instead of reusing existing code

**Incorrect:**

```typescript
// getUserData.ts
export async function getUserData(id: string) {
  return fetch(`/api/users/${id}`).then(r => r.json())
}

// fetchUser.ts
export async function fetchUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
}

// loadUserInfo.ts
export async function loadUserInfo(id: string) {
  return await fetch(`/api/users/${id}`).then(res => res.json())
}
```

**Correct:**

```typescript
// users.ts
export async function getUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
}

// All other files import from here
import { getUser } from './users'
```

Reference: [https://getaiready.dev/docs/pattern-detect](https://getaiready.dev/docs/pattern-detect)

---

## 2. Context Optimization (context)

**Impact: HIGH**

Optimizes code organization for AI context windows. Addresses import depth, file cohesion, and dependency fragmentation that break AI understanding and lead to incomplete or incorrect suggestions.

---

### 2.1 Keep Import Chains Shallow

**Impact: HIGH (10-30% reduction in context depth)**

*Tags: context, imports, dependency-depth, circular-imports*

Deep import chains force AI models to load many intermediate files to understand a single function, quickly exceeding context window limits. When AI needs to trace through 5+ levels of imports, it often loses context of the original goal and provides incomplete or incorrect suggestions.

Each level of import depth exponentially increases the context needed:
- Level 1: Direct dependencies (good)
- Level 2-3: Transitive dependencies (acceptable)
- Level 4+: Deep chains (problematic for AI)

**Incorrect:**

```typescript
// app.ts
import { processData } from './features/processor'

// features/processor.ts
import { transform } from './utils/transformer'

// features/utils/transformer.ts
import { validate } from '../../../lib/validation/validator'

// lib/validation/validator.ts
import { checkSchema } from './schema/checker'

// lib/validation/schema/checker.ts
import { rules } from '../../../config/rules/validation-rules'
```

**Correct:**

```typescript
// app.ts
import { processData } from './features/processor'

// features/processor.ts
import { transform, validate } from '@/lib/utils'

// lib/utils/index.ts (barrel export)
export { transform } from './transformer'
export { validate } from './validator'
export { checkSchema } from './schema'
```

Reference: [https://getaiready.dev/docs/context-analyzer](https://getaiready.dev/docs/context-analyzer)

---

## 3. Consistency Checking (consistency)

**Impact: MEDIUM**

Ensures naming conventions, error handling patterns, and API designs are consistent across the codebase. Inconsistencies confuse AI models and lead to incorrect pattern replication.

---

### 3.1 Follow Consistent Naming Conventions

**Impact: MEDIUM (5-15% improvement in AI pattern recognition)**

*Tags: consistency, naming, conventions, readability*

Inconsistent naming conventions confuse AI models about code intent and relationships. When similar concepts use different naming patterns, AI cannot reliably predict the correct pattern for new code, leading to inconsistent suggestions that mix multiple styles.

AI models are trained on millions of repositories and learn that consistent naming correlates with code quality. Inconsistent naming signals:
- Lack of coordination between team members
- Technical debt or legacy code
- Unclear ownership or architecture

**Incorrect:**

```typescript
// Inconsistent naming for similar operations
function getUserData() { ... }
function fetch_user_profile() { ... }
function GetUserSettings() { ... }
function user_preferences() { ... }

// Inconsistent naming for similar types
interface UserData { ... }
type user_profile = { ... }
interface IUserSettings { ... }
type UserPrefs = { ... }

// Inconsistent file naming
// UserService.ts
// user-repository.ts
// userController.ts
// user_model.ts
```

**Correct:**

```typescript
// Consistent camelCase for functions
function getUserData() { ... }
function getUserProfile() { ... }
function getUserSettings() { ... }
function getUserPreferences() { ... }

// Consistent PascalCase for types
interface UserData { ... }
interface UserProfile { ... }
interface UserSettings { ... }
interface UserPreferences { ... }

// Consistent kebab-case for files
// user-service.ts
// user-repository.ts
// user-controller.ts
// user-model.ts
```

Reference: [https://getaiready.dev/docs/consistency](https://getaiready.dev/docs/consistency)

---

## References

1. [https://getaiready.dev](https://getaiready.dev)
2. [https://getaiready.dev/docs](https://getaiready.dev/docs)
