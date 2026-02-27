---
title: Define Clear Context Boundaries
impact: HIGH
impactDescription: Ambiguous boundaries prevent AI from understanding domain contexts
tags: grounding, boundaries, domains, context, architecture
---

## Define Clear Context Boundaries

**Impact: HIGH (AI cannot retrieve relevant context)**

When domain boundaries are unclear or mixed, AI cannot determine which code to load for a given task. Code for multiple domains in the same file or module confuses AI about which rules apply, leading to incorrect suggestions that mix domain logic.

Clear context boundaries help AI understand:
- Which domain a piece of code belongs to
- What business rules apply in each context
- Where to find relevant code for a given feature

**Incorrect (mixed boundaries):**

```typescript
// src/utils/mixed.ts - Three domains mixed together
// What is this file's purpose? AI cannot tell.

export function calculateOrderTotal(items: OrderItem[]) {
  // Order domain logic
}

export function formatUserDisplayName(user: User) {
  // User domain logic
}

export function validateProductSku(sku: string) {
  // Product domain logic
}

// src/index.ts - Everything re-exported
export * from './utils/mixed';
// AI has no idea which domain to look in

// Root-level chaos
// src/helper.ts (what helper?)
// src/util.ts (what util?)
// src/tools.ts (what tools?)
```

**Correct (clear boundaries):**

```typescript
// Domain-driven structure
src/
├── domain/
│   ├── order/
│   │   ├── entities/
│   │   │   └── Order.ts
│   │   ├── services/
│   │   │   └── OrderService.ts
│   │   └── index.ts              # Public API
│   │
│   ├── user/
│   │   ├── entities/
│   │   │   └── User.ts
│   │   ├── services/
│   │   │   └── UserService.ts
│   │   └── index.ts
│   │
│   └── product/
│       ├── entities/
│       │   └── Product.ts
│       ├── services/
│       │   └── ProductService.ts
│       └── index.ts
│
├── application/                   # Use cases
│   ├── create-order.ts
│   └── update-profile.ts
│
└── infrastructure/               # External integrations
    ├── database/
    └── api/
```

**Domain index files provide clear contracts:**

```typescript
// domain/order/index.ts
export { Order, OrderItem, OrderStatus } from './entities/Order';
export { OrderService } from './services/OrderService';
export type { CreateOrderInput, OrderSummary } from './types';

// AI knows exactly where to find order-related code
```

**Detection tip:** Run `npx @aiready/agent-grounding` to analyze context boundaries and directory semantics in your codebase.

Reference: [Agent Grounding Docs](https://getaiready.dev/docs/agent-grounding)