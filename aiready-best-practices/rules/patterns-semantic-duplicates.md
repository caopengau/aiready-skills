---
title: Avoid Semantic Duplicate Patterns
impact: CRITICAL
impactDescription: 30-70% context window waste
tags: patterns, duplicates, context-window, semantic-similarity
---

## Avoid Semantic Duplicate Patterns

**Impact: CRITICAL (30-70% context window waste)**

Semantic duplicates—components, functions, or modules that perform the same task with different names—waste AI context window tokens and confuse pattern recognition. AI models struggle to identify which implementation to use, leading to inconsistent suggestions and hallucinated variations.

When AI encounters multiple implementations of the same concept, it:

- Wastes tokens loading all variations into context
- Cannot determine the canonical pattern
- Suggests mixing patterns inappropriately
- Creates new variations instead of reusing existing code

**Incorrect (multiple implementations of same concept):**

```typescript
// getUserData.ts
export async function getUserData(id: string) {
  return fetch(`/api/users/${id}`).then((r) => r.json());
}

// fetchUser.ts
export async function fetchUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// loadUserInfo.ts
export async function loadUserInfo(id: string) {
  return await fetch(`/api/users/${id}`).then((res) => res.json());
}
```

AI sees three similar functions and cannot determine which to use, often creating a fourth variation.

**Correct (single, consistent implementation):**

```typescript
// users.ts
export async function getUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// All other files import from here
import { getUser } from './users';
```

AI recognizes the canonical implementation and consistently suggests using `getUser`.

**Detection tip:** Run `npx @aiready/pattern-detect` to automatically identify semantic duplicates in your codebase.

Reference: [Pattern Detection Docs](https://getaiready.dev/docs/pattern-detect)
