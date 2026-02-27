---
title: Maintain High Module Cohesion
impact: HIGH
impactDescription: 25-40% reduction in context pollution, improves AI file selection
tags: context, cohesion, organization, modules
references: https://en.wikipedia.org/wiki/Cohesion_(computer_science)
---

## Maintain High Module Cohesion

**Impact: HIGH (25-40% reduction in context pollution)**

Low cohesion forces AI to load multiple unrelated files to understand one feature. When a file contains unrelated functions (authentication + date formatting + validation), AI must read the entire file even when only needing one function.

High cohesion means related code stays together. AI can load the minimal context needed.

**Incorrect (low cohesion - mixed concerns):**

```typescript
// utils.ts - Everything dumped together
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function formatDate(date: Date) {
  return date.toISOString();
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, SECRET);
}

// AI must load ALL of this just to understand password hashing!
// Context cost: 150+ lines for 10 lines of relevant code
```

**Correct (high cohesion - grouped by concern):**

```typescript
// auth/password.ts
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// auth/token.ts
export function generateToken(userId: string) {
  return jwt.sign({ userId }, SECRET);
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}

// validation/email.ts
export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// utils/date.ts
export function formatDate(date: Date) {
  return date.toISOString();
}

// AI loads only auth/password.ts for password operations
// Context cost: 15 lines instead of 150+
```

Cohesion metrics:

- **High**: All functions in a file share the same data or serve the same feature
- **Medium**: Functions loosely related (e.g., all string utilities)
- **Low**: Functions have no relationship (avoid this)

Benefits for AI:

- 25-40% less context loaded per query
- AI correctly selects relevant files
- Reduces cross-file navigation
- Makes refactoring suggestions more accurate

Reference: [Cohesion (computer science)](<https://en.wikipedia.org/wiki/Cohesion_(computer_science)>)
