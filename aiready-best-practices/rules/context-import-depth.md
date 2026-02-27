---
title: Keep Import Chains Shallow
impact: HIGH
impactDescription: 10-30% reduction in context depth
tags: context, imports, dependency-depth, circular-imports
---

## Keep Import Chains Shallow

**Impact: HIGH (10-30% reduction in context depth)**

Deep import chains force AI models to load many intermediate files to understand a single function, quickly exceeding context window limits. When AI needs to trace through 5+ levels of imports, it often loses context of the original goal and provides incomplete or incorrect suggestions.

Each level of import depth exponentially increases the context needed:

- Level 1: Direct dependencies (good)
- Level 2-3: Transitive dependencies (acceptable)
- Level 4+: Deep chains (problematic for AI)

**Incorrect (deep import chain):**

```typescript
// app.ts
import { processData } from './features/processor';

// features/processor.ts
import { transform } from './utils/transformer';

// features/utils/transformer.ts
import { validate } from '../../../lib/validation/validator';

// lib/validation/validator.ts
import { checkSchema } from './schema/checker';

// lib/validation/schema/checker.ts
import { rules } from '../../../config/rules/validation-rules';
```

AI must load 6 files to understand `processData`, often losing context.

**Correct (shallow, well-organized imports):**

```typescript
// app.ts
import { processData } from './features/processor';

// features/processor.ts
import { transform, validate } from '@/lib/utils';

// lib/utils/index.ts (barrel export)
export { transform } from './transformer';
export { validate } from './validator';
export { checkSchema } from './schema';
```

AI can quickly understand the dependency tree with clear boundaries.

**Best practices:**

- Use barrel exports (`index.ts`) to flatten import paths
- Keep max import depth at 3 levels
- Co-locate related code to reduce cross-cutting concerns
- Use `@/` path aliases to avoid relative path chains

**Detection tip:** Run `npx @aiready/context-analyzer --max-depth 3` to find deep import chains.

Reference: [Context Analysis Docs](https://getaiready.dev/docs/context-analyzer)
