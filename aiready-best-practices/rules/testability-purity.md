---
title: Write Pure Functions
impact: MEDIUM
impactDescription: Global state and side effects prevent AI from writing tests
tags: testability, purity, side-effects, global-state, dependency-injection
---

## Write Pure Functions

**Impact: MEDIUM (AI cannot easily verify impure code)**

Pure functions - those that always produce the same output for the same input and have no side effects - are essential for AI agent verification. When AI modifies code, it needs to verify the change works. Impure functions (global state, I/O, randomness) make verification extremely difficult and cause AI to enter expensive "fix-test-fail" retry loops.

AI agents struggle most with:
- Global state that affects function behavior
- Side effects that cannot be mocked
- Non-deterministic behavior

**Incorrect (impure functions):**

```typescript
// Global state - AI cannot predict behavior
let currentUser: User | null = null;

function getUserEmail() {
  return currentUser?.email;  // Depends on global state
}

function processOrder(order: Order) {
  currentUser = order.user;   // Modifies global state
  sendEmail(order.user.email, 'Order processed');
  order.status = 'processed'; // Side effect on input
  return order;
}

// Hidden dependencies
function calculateTotal(items: Item[]) {
  const taxRate = getConfig().taxRate;  // Hidden global access
  return items.reduce((sum, item) => sum + item.price, 0) * taxRate;
}

// Non-deterministic behavior
function getRandomId(): string {
  return Math.random().toString(36);  // Different each call
}
```

**Correct (pure functions):**

```typescript
// Explicit dependencies through parameters
function getUserEmail(user: User): string {
  return user.email;
}

// Pure transformation
function processOrder(order: Order, config: Config): ProcessedOrder {
  return {
    ...order,
    status: 'processed',
    processedAt: new Date(),
    total: calculateTotal(order.items, config.taxRate)
  };
}

// Dependencies explicitly injected
function calculateTotal(items: Item[], taxRate: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 + taxRate);
}

// Deterministic with seed
function generateId(counter: number): string {
  return `id-${counter.toString(36)}`;
}

// Dependency injection pattern
interface Services {
  emailService: EmailService;
  configService: ConfigService;
}

class OrderProcessor {
  constructor(private services: Services) {}
  
  process(order: Order): ProcessedOrder {
    // All dependencies are explicit and mockable
    this.services.emailService.send(order.user.email, 'Processed');
    return { ...order, status: 'processed' };
  }
}
```

**Testing benefits for AI:**

1. **Predictable output**: AI can verify behavior by comparing expected vs actual
2. **Easy mocking**: Dependencies can be replaced for testing
3. **Independent verification**: Each function can be tested in isolation

**Detection tip:** Run `npx @aiready/testability` to analyze purity and identify patterns that cause AI verification loops.

Reference: [Testability Docs](https://getaiready.dev/docs/testability)