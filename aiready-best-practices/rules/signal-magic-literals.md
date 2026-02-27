---
title: Avoid Magic Literals
impact: CRITICAL
impactDescription: Unnamed constants confuse AI about business rules
tags: signal, magic, literals, constants, clarity
---

## Avoid Magic Literals

**Impact: CRITICAL (AI cannot infer business rules)**

Magic literals - unnamed constants used directly in code - prevent AI from understanding business rules and domain constraints. When AI sees `if (status === 2)`, it has no idea what "2" means and cannot suggest valid alternatives.

AI models struggle to:
- Infer what values are valid
- Suggest enum usage or constants
- Understand the domain model through code

**Incorrect (magic literals):**

```typescript
// What does status=2 mean? AI has no context
if (user.status === 2) {
  activateUser(user);
}

// Magic numbers in calculations
const fee = amount * 0.15 + 100;
// AI can't explain where 0.15 or 100 comes from

// Repeated magic values
if (response.code === 200 && data.status === 200) {
  // Two different "200" meanings?
}

// String literals scattered
sendEmail('support@company.com');
notify('admin');
```

**Correct (named constants):**

```typescript
// Clear enum for status
enum UserStatus {
  Pending = 0,
  Active = 1,
  Suspended = 2,
  Deleted = 3
}

if (user.status === UserStatus.Active) {
  activateUser(user);
}

// Business rule constants
const TAX_RATE = 0.15;
const BASE_FEE = 100;

const fee = amount * TAX_RATE + BASE_FEE;
// AI now understands the formula's components

// Group related constants
namespace ApiStatus {
  export const Success = 200;
  export const NotFound = 404;
  export const ServerError = 500;
}

if (response.code === ApiStatus.Success) {
  // Clear what success means
}

// Configurable values
const EMAIL_CONFIG = {
  support: 'support@company.com',
  noreply: 'noreply@company.com'
};
```

**Detection tip:** Run `npx @aiready/ai-signal-clarity` to automatically identify magic literal patterns in your codebase.

Reference: [AI Signal Clarity Docs](https://getaiready.dev/docs/ai-signal-clarity)