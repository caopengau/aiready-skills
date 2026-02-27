---
title: Avoid Change Amplification Hotspots
impact: HIGH
impactDescription: High fan-in/fan-out files cause "edit explosion" for AI agents
tags: amplification, coupling, fan-in, fan-out, hotspots, graph-metrics
---

## Avoid Change Amplification Hotspots

**Impact: HIGH (Predicts edit explosion risk)**

Change amplification hotspots are files with high fan-in (many files depend on them) or high fan-out (they depend on many files). When AI modifies these files, the resulting cascade of breakages often exceeds the agent's context window or reasoning capacity.

This is one of the leading causes of AI agent failure - a single change triggers a cascade of updates across the codebase.

**Incorrect (high amplification files):**

```typescript
// utils/index.ts - HIGH FAN-OUT (depends on everything)
// Imports from dozens of modules
import { formatDate } from '../date/formatter';
import { validateEmail } from '../validation/email';
import { hashPassword } from '../auth/crypto';
import { parseJson } from '../utils/json';
// ... 50+ more imports

// When AI changes anything here, it must understand all 50+ modules

// models/base-entity.ts - HIGH FAN-IN (everyone depends on it)
// Used by 100+ files across the codebase
export class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  save() { /* ... */ }
  delete() { /* ... */ }
  validate() { /* ... */ }
}

// AI modifying this will cause 100+ files to potentially need updates

// config/index.ts - Central configuration
// Changing anything here affects the entire system
export const config = {
  database: { /* 50+ fields */ },
  api: { /* 30+ fields */ },
  features: { /* 40+ fields */ }
};
```

**Correct (modular, bounded files):**

```typescript
// utils/date/index.ts - Focused export
export { formatDate, parseDate } from './formatter';

// utils/validation/email.ts - Single responsibility
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// domain/user/entities/User.ts - Bounded context
// Only used within the user domain
export class User {
  id: string;
  email: string;
  
  static create(props: UserProps): User { /* ... */ }
}

// domain/user/repositories/UserRepository.ts - Clear boundary
// Only accessed through this interface
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// Feature flags as separate modules
import { databaseConfig } from './config/database';
import { apiConfig } from './config/api';
import { featureFlags } from './config/features';

export { databaseConfig, apiConfig, featureFlags };
// Each can be modified independently
```

**Refactoring strategies:**

1. **Break up high fan-out files**: Use barrel exports from focused modules
2. **Interface segregation for high fan-in**: Define interfaces that hide implementation
3. **Extract domain boundaries**: Create clear modules that AI can work on independently
4. **Dependency injection**: Allow mocking without changing dependents

**Detection tip:** Run `npx @aiready/change-amplification` to identify hotspots and compute fan-in/fan-out metrics for your codebase.

Reference: [Change Amplification Docs](https://getaiready.dev/docs/change-amplification)