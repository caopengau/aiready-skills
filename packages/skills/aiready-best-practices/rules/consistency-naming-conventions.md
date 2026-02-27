---
title: Follow Consistent Naming Conventions
impact: MEDIUM
impactDescription: 5-15% improvement in AI pattern recognition
tags: consistency, naming, conventions, readability
---

## Follow Consistent Naming Conventions

**Impact: MEDIUM (5-15% improvement in AI pattern recognition)**

Inconsistent naming conventions confuse AI models about code intent and relationships. When similar concepts use different naming patterns, AI cannot reliably predict the correct pattern for new code, leading to inconsistent suggestions that mix multiple styles.

AI models are trained on millions of repositories and learn that consistent naming correlates with code quality. Inconsistent naming signals:

- Lack of coordination between team members
- Technical debt or legacy code
- Unclear ownership or architecture

**Incorrect (mixed naming patterns for similar concepts):**

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

AI suggests random patterns from the mix, creating more inconsistency.

**Correct (consistent naming throughout):**

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

AI reliably predicts the correct pattern for new code.

**Establish conventions for:**

- Functions: `camelCase` (JavaScript/TypeScript) or `snake_case` (Python)
- Classes/Types: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case.ts` or `PascalCase.tsx` (components)
- Private fields: `_camelCase` or `#camelCase`

**Detection tip:** Run `npx @aiready/consistency` to identify naming pattern violations.

Reference: [Consistency Checking Docs](https://getaiready.dev/docs/consistency)
