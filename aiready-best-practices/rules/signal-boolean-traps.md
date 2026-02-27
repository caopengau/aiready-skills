---
title: Avoid Boolean Trap Parameters
impact: CRITICAL
impactDescription: High confusion potential - AI flips boolean intent incorrectly
tags: signal, boolean, parameters, ambiguity, ai-signal
---

## Avoid Boolean Trap Parameters

**Impact: CRITICAL (High confusion potential)**

Boolean parameters with unclear meaning cause AI assistants to incorrectly flip or interpret their intent. When AI sees `function process(includeDeleted = false)`, it may assume "includeDeleted" being true means "include deleted items" or it may flip the logic entirely.

Multi-boolean parameter patterns are especially problematic - AI cannot reliably predict which combination produces which result.

**Incorrect (boolean trap):**

```typescript
// What does the second boolean mean? AI will guess wrong 50% of time
function fetchUsers(includeInactive: boolean, includeDeleted: boolean) {
  // AI can't determine which combinations are valid
}

// Boolean flags that could be confused
function render(options: boolean, useCache: boolean) {
  // AI may suggest: render(true, false) when it means render({ options: true, useCache: false })
}

// Often inverted logic
function validate(required: boolean, optional: boolean) {
  // Is required=true meaning "field is required" or "require this check"?
}
```

**Correct (explicit options object):**

```typescript
// Clear intent with named properties
interface FetchUsersOptions {
  includeInactive: boolean;
  includeDeleted: boolean;
}

function fetchUsers(options: FetchUsersOptions) {
  const { includeInactive, includeDeleted } = options;
  // AI can now understand each option independently
}

// Or use an enum for finite states
enum UserFilter {
  ActiveOnly = 'active',
  All = 'all',
  IncludingInactive = 'inactive'
}

function fetchUsers(filter: UserFilter) {
  // AI understands exact possible values
}

// Use descriptive booleans in objects
interface RenderOptions {
  enableAnimations: boolean;  // Clear meaning
  useCache: boolean;          // Clear meaning
}

function render(options: RenderOptions) {
  // AI can suggest specific property updates
}
```

**Detection tip:** Run `npx @aiready/ai-signal-clarity` to automatically identify boolean trap patterns in your codebase.

Reference: [AI Signal Clarity Docs](https://getaiready.dev/docs/ai-signal-clarity)