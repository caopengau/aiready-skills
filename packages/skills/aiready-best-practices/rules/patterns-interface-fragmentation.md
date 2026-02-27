---
title: Unify Fragmented Interfaces
impact: CRITICAL
impactDescription: 40-80% reduction in AI confusion, prevents wrong type usage
tags: patterns, interfaces, types, consistency
references: https://refactoring.guru/extract-interface
---

## Unify Fragmented Interfaces

**Impact: CRITICAL (40-80% reduction in AI confusion)**

Multiple similar interfaces or types for the same concept confuse AI models and lead to incorrect implementations. When AI encounters 5 different user types (`User`, `UserData`, `UserInfo`, `UserProfile`, `UserDTO`), it cannot determine which to use and often mixes them incorrectly.

This is one of the most critical issues for AI comprehension because it directly causes type errors and logic bugs that are hard to detect.

**Incorrect (fragmented interfaces):**

```typescript
// user.types.ts
interface User {
  id: string;
  email: string;
}

// profile.types.ts
interface UserProfile {
  userId: string;
  email: string;
  name: string;
}

// api.types.ts
interface UserData {
  id: string;
  emailAddress: string;
  displayName: string;
}

// Three different interfaces for the same concept!
// AI cannot determine which to use where
function updateUser(user: User) {
  /* ... */
}
function getProfile(userId: string): UserProfile {
  /* ... */
}
function syncData(data: UserData) {
  /* ... */
}
```

**Correct (unified interface):**

```typescript
// user.types.ts
interface User {
  id: string;
  email: string;
  name?: string; // Optional fields for different contexts
}

// Use a single source of truth
function updateUser(user: User) {
  /* ... */
}
function getProfile(userId: string): User {
  /* ... */
}
function syncData(user: User) {
  /* ... */
}

// For API-specific needs, extend rather than duplicate
interface UserDTO extends User {
  createdAt: Date;
  updatedAt: Date;
}
```

When consolidating interfaces:

1. Identify the canonical type (usually the domain entity)
2. Make fields optional if they vary by context
3. Use `extends` for specialized versions
4. Update all usages to reference the unified type
5. Document which fields are required in which contexts

AI models will correctly apply types when there's one clear interface per concept, reducing type errors by 40-80%.

Reference: [Refactoring: Extract Interface](https://refactoring.guru/extract-interface)
