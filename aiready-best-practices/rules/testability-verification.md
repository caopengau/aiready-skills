---
title: Maintain Verification Coverage
impact: MEDIUM
impactDescription: Low test coverage prevents AI from confirming its changes work
tags: testability, verification, coverage, testing, ai-agent
---

## Maintain Verification Coverage

**Impact: MEDIUM (AI cannot confirm changes without tests)**

Verification coverage measures how easily AI can confirm its changes work. Low test coverage or poor test quality forces AI into expensive trial-and-error loops, guessing at whether the code works rather than confidently knowing through test results.

AI agents specifically need:
- Tests that cover the functionality they're modifying
- Clear assertion patterns they can extend
- Fast feedback on whether changes work

**Incorrect (low verification):**

```typescript
// No tests exist for critical functionality
// user-service.ts
export function calculateLoyaltyPoints(order: Order): number {
  const basePoints = order.total * 0.1;
  const bonusPoints = order.items.length > 5 ? 50 : 0;
  return Math.floor(basePoints + bonusPoints);
}

// AI modifies calculateLoyaltyPoints but has no way to verify
// Must manually test or hope CI passes

// Poor test quality
test('test1', () => {
  expect(true).toBe(true);  // Fake test, no actual verification
});

// Tests without assertions
async function testUser() {
  const user = await getUser('123');
  console.log(user);  // No assertion, AI can't determine success
}
```

**Correct (verification coverage):**

```typescript
// Clear, testable functions with documented behavior
export function calculateLoyaltyPoints(order: Order): number {
  /**
   * Calculates loyalty points for an order
   * @param order - The order to calculate points for
   * @returns Total loyalty points earned
   *
   * Rules:
   * - 1 point per $1 spent (basePoints = total * 0.1)
   * - 50 bonus points if order has 5+ items
   *
   * @example
   * const order = { total: 100, items: [{ price: 100 }] };
   * expect(calculateLoyaltyPoints(order)).toBe(60); // 10 + 50 bonus
   */
  const basePoints = order.total * 0.1;
  const bonusPoints = order.items.length >= 5 ? 50 : 0;
  return Math.floor(basePoints + bonusPoints);
}

// Comprehensive tests with clear assertions
describe('calculateLoyaltyPoints', () => {
  it('should calculate 1 point per dollar spent', () => {
    const order = createOrder({ total: 100, items: [itemA] });
    expect(calculateLoyaltyPoints(order)).toBe(10);
  });

  it('should add 50 bonus points for 5+ items', () => {
    const order = createOrder({
      total: 100,
      items: [itemA, itemB, itemC, itemD, itemE]
    });
    expect(calculateLoyaltyPoints(order)).toBe(60); // 10 + 50
  });

  it('should not add bonus for fewer than 5 items', () => {
    const order = createOrder({
      total: 100,
      items: [itemA, itemB, itemC]
    });
    expect(calculateLoyaltyPoints(order)).toBe(10); // No bonus
  });
});

// Fast feedback - unit tests run in <1 second
// npm run test:unit (fast, no external dependencies)
```

**AI verification patterns:**

1. **Test-driven**: AI should write tests first, then implement to pass
2. **Golden master**: Compare output against known-good baseline
3. **Property-based**: Test invariants rather than specific values
4. **Smoke tests**: Quick sanity checks for core functionality

**Recommended test structure:**

```
src/
├── features/
│   └── order/
│       ├── order-service.ts
│       └── __tests__/
│           ├── order-service.unit.test.ts    # Fast, isolated
│           └── order-service.integration.test.ts  # Full flow
```

**Detection tip:** Run `npx @aiready/testability` to analyze verification coverage and identify files that need tests for AI agent confidence.

Reference: [Testability Docs](https://getaiready.dev/docs/testability)