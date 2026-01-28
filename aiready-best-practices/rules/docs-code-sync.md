---
title: Keep Documentation in Sync with Code
impact: MEDIUM
impactDescription: 20-30% reduction in AI suggestion errors from stale docs
tags: documentation, maintenance, comments, sync
references: https://jsdoc.app/
---

## Keep Documentation in Sync with Code

**Impact: MEDIUM (20-30% reduction in AI suggestion errors from stale docs)**

Outdated documentation misleads AI models. When function signatures change but JSDoc comments don't update, AI suggests code based on old documentation, causing type errors and logic bugs.

Keep docs close to code and update them together.

**Incorrect (stale documentation):**

```typescript
/**
 * Fetch user by email
 * @param email - User email address
 * @returns User object
 */
function getUser(id: string, options?: FetchOptions): Promise<User | null> {
  // Function signature changed but docs didn't!
  // AI will suggest: getUser('user@example.com')
  // Actual usage: getUser('user-123', { includeDeleted: false })
  return database.users.findOne({ id, ...options })
}

/**
 * Calculate total price
 * @param items - Array of items
 * @returns Total price
 */
function calculateTotal(
  items: CartItem[],
  taxRate: number,
  discount?: Discount
): Money {
  // Added taxRate and discount but docs don't mention them
  // AI won't know these parameters exist
}

// Comments that lie
const MAX_RETRIES = 5 // Maximum retry attempts (actually 5, not 3!)
// This function is deprecated (but it's still used everywhere)
function legacyAuth() { /* ... */ }
```

**Correct (synchronized documentation):**

```typescript
/**
 * Fetch user by ID with optional fetch configurations
 * @param id - User ID (UUID format)
 * @param options - Optional fetch configuration
 * @param options.includeDeleted - Include soft-deleted users
 * @param options.relations - Related entities to include
 * @returns User object if found, null otherwise
 * @throws {DatabaseError} If database connection fails
 * 
 * @example
 * const user = await getUser('user-123')
 * const userWithPosts = await getUser('user-123', { relations: ['posts'] })
 */
function getUser(id: string, options?: FetchOptions): Promise<User | null> {
  return database.users.findOne({ id, ...options })
}

/**
 * Calculate total price including tax and discounts
 * @param items - Cart items to calculate
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @param discount - Optional discount to apply
 * @returns Total price after tax and discounts
 * 
 * @example
 * const total = calculateTotal(items, 0.08)
 * const discounted = calculateTotal(items, 0.08, { type: 'percentage', value: 10 })
 */
function calculateTotal(
  items: CartItem[],
  taxRate: number,
  discount?: Discount
): Money {
  // Implementation
}

// Accurate comments
const MAX_RETRIES = 5 // Maximum retry attempts before giving up

/**
 * @deprecated Use authenticateWithJWT instead. Will be removed in v2.0
 * @see authenticateWithJWT
 */
function legacyAuth() { /* ... */ }
```

Documentation best practices:
1. **Update docs in the same commit** as code changes
2. **Use type-aware documentation** (JSDoc, TSDoc) that IDEs can validate
3. **Include examples** for complex functions
4. **Document breaking changes** with deprecation warnings
5. **Remove obsolete comments** rather than leaving them

Types of documentation that mislead AI:
- ❌ Parameter descriptions that don't match current signature
- ❌ Return type docs that differ from actual types
- ❌ Comments saying "TODO" from 2 years ago
- ❌ Examples that don't compile
- ❌ Deprecation warnings without alternatives

Use tooling:
- **TypeDoc/JSDoc** - Auto-generates docs from comments
- **API Extractor** - Validates doc comments match signatures
- **Linters** - Detect missing or inconsistent docs
- **CI checks** - Fail builds if docs are incomplete

Benefits:
- 20-30% fewer AI errors from documentation mismatches
- AI provides correct function signatures
- Better autocomplete suggestions
- Accurate code examples

Reference: [JSDoc](https://jsdoc.app/)
