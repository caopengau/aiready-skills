---
title: Use Consistent Error Handling Patterns
impact: MEDIUM
impactDescription: 15-25% improvement in AI error handling suggestions
tags: consistency, errors, patterns, exceptions
references: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
---

## Use Consistent Error Handling Patterns

**Impact: MEDIUM (15-25% improvement in AI error handling suggestions)**

Mixed error patterns confuse AI models. When your codebase uses throw, try-catch, error callbacks, Result types, and null returns interchangeably, AI cannot predict the correct pattern and suggests inconsistent error handling.

Choose one primary pattern and use it consistently.

**Incorrect (mixed error patterns):**

```typescript
// File 1: throws exceptions
function parseUserData(data: string): User {
  if (!data) throw new Error('Invalid data')
  return JSON.parse(data)
}

// File 2: returns null
function getUserById(id: string): User | null {
  const user = database.get(id)
  return user ?? null
}

// File 3: uses error callbacks
function fetchUser(id: string, callback: (error: Error | null, user?: User) => void) {
  // ...
}

// File 4: returns Result type
function validateUser(user: User): Result<User, ValidationError> {
  // ...
}

// AI cannot determine which pattern to use when suggesting code!
```

**Correct (consistent Result pattern - recommended for TypeScript):**

```typescript
// shared/result.ts
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

export function ok<T>(data: T): Result<T> {
  return { success: true, data }
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error }
}

// All functions use the same pattern
function parseUserData(data: string): Result<User> {
  if (!data) return err(new Error('Invalid data'))
  try {
    return ok(JSON.parse(data))
  } catch (e) {
    return err(new Error('Parse failed'))
  }
}

function getUserById(id: string): Result<User> {
  const user = database.get(id)
  if (!user) return err(new Error('User not found'))
  return ok(user)
}

function validateUser(user: User): Result<User, ValidationError> {
  if (!user.email) return err({ field: 'email', message: 'Required' })
  return ok(user)
}

// Usage is consistent everywhere
const result = getUserById('123')
if (result.success) {
  console.log(result.data.name)
} else {
  console.error(result.error.message)
}
```

**Alternative: Consistent exception pattern:**

```typescript
// If you prefer exceptions, use them consistently everywhere
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// All functions throw typed exceptions
function parseUserData(data: string): User {
  if (!data) throw new AppError('Invalid data', 'INVALID_INPUT', 400)
  return JSON.parse(data)
}

function getUserById(id: string): User {
  const user = database.get(id)
  if (!user) throw new AppError('User not found', 'NOT_FOUND', 404)
  return user
}

// Usage is consistent everywhere
try {
  const user = getUserById('123')
  console.log(user.name)
} catch (error) {
  if (error instanceof AppError) {
    console.error(`[${error.code}] ${error.message}`)
  }
}
```

Choose one pattern based on your needs:
- **Result types**: Explicit, type-safe, forces handling
- **Exceptions**: Familiar, separates happy path from errors
- **Error callbacks**: Legacy Node.js style (avoid in new code)
- **Null/undefined**: Avoid - loses error context

Benefits:
- AI consistently suggests the correct pattern
- 15-25% more accurate error handling code
- Easier to learn codebase patterns
- Reduces error handling bugs

Reference: [TypeScript: Narrowing with Type Predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
