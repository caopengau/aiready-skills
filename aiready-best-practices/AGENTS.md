# AIReady Best Practices

**Version 0.2.0**  
AIReady  
February 2026

> **Note:**  
> This document is for AI agents and LLMs to follow when writing,  
> maintaining, or refactoring AI-friendly codebases.  
> Humans may find it useful, but guidance here is optimized for  
> AI-assisted workflows and automated consistency.

---

## Abstract

Guidelines for writing AI-friendly codebases that AI coding assistants can understand and maintain effectively. Based on analysis of thousands of repositories and common AI model failure patterns. Covers pattern detection, AI signal clarity, context optimization, change amplification, agent grounding, consistency checking, documentation, testability, and dependency management.

---

## Table of Contents

0. [Section 0](#0-section-0) (HIGH)
   - 0.1 [Avoid Boolean Trap Parameters](#01-avoid-boolean-trap-parameters)
   - 0.2 [Avoid Change Amplification Hotspots](#02-avoid-change-amplification-hotspots)
   - 0.3 [Avoid High-Entropy Naming](#03-avoid-high-entropy-naming)
   - 0.4 [Avoid Magic Literals](#04-avoid-magic-literals)
   - 0.5 [Define Clear Context Boundaries](#05-define-clear-context-boundaries)
   - 0.6 [Maintain Verification Coverage](#06-maintain-verification-coverage)
   - 0.7 [Write Agent-Actionable READMEs](#07-write-agent-actionable-readmes)
   - 0.8 [Write Pure Functions](#08-write-pure-functions)
1. [Pattern Detection (patterns)](#1-pattern-detection-(patterns)) (CRITICAL)
   - 1.1 [Avoid Semantic Duplicate Patterns](#11-avoid-semantic-duplicate-patterns)
   - 1.2 [Unify Fragmented Interfaces](#12-unify-fragmented-interfaces)
2. [Context Optimization (context)](#2-context-optimization-(context)) (HIGH)
   - 2.1 [Keep Import Chains Shallow](#21-keep-import-chains-shallow)
   - 2.2 [Maintain High Module Cohesion](#22-maintain-high-module-cohesion)
   - 2.3 [Split Large Files (>500 lines)](#23-split-large-files-(>500-lines))
3. [Consistency Checking (consistency)](#3-consistency-checking-(consistency)) (MEDIUM)
   - 3.1 [Follow Consistent Naming Conventions](#31-follow-consistent-naming-conventions)
   - 3.2 [Use Consistent Error Handling Patterns](#32-use-consistent-error-handling-patterns)
4. [Documentation (docs)](#4-documentation-(docs)) (MEDIUM)
   - 4.1 [Keep Documentation in Sync with Code](#41-keep-documentation-in-sync-with-code)

---

## 0. Section 0

**Impact: HIGH**

---

### 0.1 Avoid Boolean Trap Parameters

**Impact: CRITICAL (High confusion potential - AI flips boolean intent incorrectly)**

*Tags: signal, boolean, parameters, ambiguity, ai-signal*

Boolean parameters with unclear meaning cause AI assistants to incorrectly flip or interpret their intent. When AI sees `function process(includeDeleted = false)`, it may assume "includeDeleted" being true means "include deleted items" or it may flip the logic entirely.

Multi-boolean parameter patterns are especially problematic - AI cannot reliably predict which combination produces which result.

**Incorrect:**

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

**Correct:**

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

Reference: [https://getaiready.dev/docs/ai-signal-clarity](https://getaiready.dev/docs/ai-signal-clarity)

### 0.2 Avoid Change Amplification Hotspots

**Impact: HIGH (High fan-in/fan-out files cause "edit explosion" for AI agents)**

*Tags: amplification, coupling, fan-in, fan-out, hotspots, graph-metrics*

Change amplification hotspots are files with high fan-in (many files depend on them) or high fan-out (they depend on many files). When AI modifies these files, the resulting cascade of breakages often exceeds the agent's context window or reasoning capacity.

This is one of the leading causes of AI agent failure - a single change triggers a cascade of updates across the codebase.

**Incorrect:**

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

**Correct:**

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

Reference: [https://getaiready.dev/docs/change-amplification](https://getaiready.dev/docs/change-amplification)

### 0.3 Avoid High-Entropy Naming

**Impact: CRITICAL (Names with multiple interpretations confuse AI models)**

*Tags: signal, naming, entropy, ambiguity, clarity*

High-entropy names - variables or functions with multiple possible semantic interpretations - confuse AI models. When a name like "data", "info", "handle", or "process" is used, AI cannot determine what concept it represents, leading to incorrect suggestions.

AI models trained on millions of repos learn that ambiguous names correlate with low-quality code and often skip over or misinterpret such identifiers.

**Incorrect:**

```typescript
// What does "data" contain at each stage?
const data = fetchData();
const processedData = transform(data);
const finalData = validate(processedData);

// Overloaded "handle" - what is it?
function handle(item: any) { ... }
// Is it: handle event? handle error? handle processing?

// Generic "info" - what info?
interface UserInfo { ... }
interface OrderInfo { ... }
interface ConfigInfo { ... }
// AI cannot determine what fields each contains

// Ambiguous abbreviations
const x = getUsers();
const y = process(x);
const z = validate(y);
// What is x, y, z at each stage?
```

**Correct:**

```typescript
// Clear data flow
const rawUserRecords = fetchUserRecords();
const normalizedUsers = normalizeUserRecords(rawUserRecords);
const validUsers = filterActiveUsers(normalizedUsers);

// Specific handlers
function handleUserRegistration(event: RegistrationEvent) { ... }
function handlePaymentProcessing(event: PaymentEvent) { ... }
function handleError(error: Error, context: ErrorContext) { ... }

// Semantic types with clear contents
interface UserProfile {
  id: string;
  displayName: string;
  email: string;
}

interface OrderDetails {
  orderId: string;
  lineItems: LineItem[];
  totalAmount: Money;
}

interface SystemConfig {
  maxRetries: number;
  timeout: number;
  features: FeatureFlags;
}

// Self-documenting variables
const pendingInvoices = filterByStatus(invoices, 'pending');
const overdueAccounts = filterByDaysOverdue(accounts, 30);
```

Reference: [https://getaiready.dev/docs/ai-signal-clarity](https://getaiready.dev/docs/ai-signal-clarity)

### 0.4 Avoid Magic Literals

**Impact: CRITICAL (Unnamed constants confuse AI about business rules)**

*Tags: signal, magic, literals, constants, clarity*

Magic literals - unnamed constants used directly in code - prevent AI from understanding business rules and domain constraints. When AI sees `if (status === 2)`, it has no idea what "2" means and cannot suggest valid alternatives.

AI models struggle to:
- Infer what values are valid
- Suggest enum usage or constants
- Understand the domain model through code

**Incorrect:**

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

**Correct:**

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

Reference: [https://getaiready.dev/docs/ai-signal-clarity](https://getaiready.dev/docs/ai-signal-clarity)

### 0.5 Define Clear Context Boundaries

**Impact: HIGH (Ambiguous boundaries prevent AI from understanding domain contexts)**

*Tags: grounding, boundaries, domains, context, architecture*

When domain boundaries are unclear or mixed, AI cannot determine which code to load for a given task. Code for multiple domains in the same file or module confuses AI about which rules apply, leading to incorrect suggestions that mix domain logic.

Clear context boundaries help AI understand:
- Which domain a piece of code belongs to
- What business rules apply in each context
- Where to find relevant code for a given feature

**Incorrect:**

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

**Correct:**

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

Reference: [https://getaiready.dev/docs/agent-grounding](https://getaiready.dev/docs/agent-grounding)

### 0.6 Maintain Verification Coverage

**Impact: MEDIUM (Low test coverage prevents AI from confirming its changes work)**

*Tags: testability, verification, coverage, testing, ai-agent*

Verification coverage measures how easily AI can confirm its changes work. Low test coverage or poor test quality forces AI into expensive trial-and-error loops, guessing at whether the code works rather than confidently knowing through test results.

AI agents specifically need:
- Tests that cover the functionality they're modifying
- Clear assertion patterns they can extend
- Fast feedback on whether changes work

**Incorrect:**

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

**Correct:**

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

Reference: [https://getaiready.dev/docs/testability](https://getaiready.dev/docs/testability)

### 0.7 Write Agent-Actionable READMEs

**Impact: HIGH (Poor README quality reduces AI's understanding of project context)**

*Tags: grounding, readme, documentation, context, agents*

READMEs are often the first context AI loads when working on a repository. Poor-quality READMEs leave AI without the high-level understanding needed to make architectural decisions, understand business rules, or recognize domain boundaries.

A good README for AI agents should include:
- Project purpose and domain
- Architecture overview with diagram
- Key domain concepts and terminology
- Entry points and common workflows
- Testing and verification patterns

**Incorrect:**

```markdown
# My Project

A TypeScript project.

## Install

npm install

## Test

npm test
```

**Correct:**

```markdown
# Order Processing Service

Domain: E-commerce Order Management

## Purpose

Handles order creation, validation, and fulfillment for the e-commerce platform. This service manages the complete order lifecycle from cart checkout to delivery confirmation.

## Architecture
```

Reference: [https://getaiready.dev/docs/agent-grounding](https://getaiready.dev/docs/agent-grounding)

### 0.8 Write Pure Functions

**Impact: MEDIUM (Global state and side effects prevent AI from writing tests)**

*Tags: testability, purity, side-effects, global-state, dependency-injection*

Pure functions - those that always produce the same output for the same input and have no side effects - are essential for AI agent verification. When AI modifies code, it needs to verify the change works. Impure functions (global state, I/O, randomness) make verification extremely difficult and cause AI to enter expensive "fix-test-fail" retry loops.

AI agents struggle most with:
- Global state that affects function behavior
- Side effects that cannot be mocked
- Non-deterministic behavior

**Incorrect:**

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

**Correct:**

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

Reference: [https://getaiready.dev/docs/testability](https://getaiready.dev/docs/testability)

---

## 1. Pattern Detection (patterns)

**Impact: CRITICAL**

Identifies semantic duplicate patterns and naming inconsistencies that waste AI context window tokens and confuse pattern recognition. Consolidating duplicates can save 30-70% of context usage.

---

### 1.1 Avoid Semantic Duplicate Patterns

**Impact: CRITICAL (30-70% context window waste)**

*Tags: patterns, duplicates, context-window, semantic-similarity*

Semantic duplicates—components, functions, or modules that perform the same task with different names—waste AI context window tokens and confuse pattern recognition. AI models struggle to identify which implementation to use, leading to inconsistent suggestions and hallucinated variations.

When AI encounters multiple implementations of the same concept, it:

- Wastes tokens loading all variations into context
- Cannot determine the canonical pattern
- Suggests mixing patterns inappropriately
- Creates new variations instead of reusing existing code

**Incorrect:**

```typescript
// getUserData.ts
export async function getUserData(id: string) {
  return fetch(`/api/users/${id}`).then((r) => r.json());
}

// fetchUser.ts
export async function fetchUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// loadUserInfo.ts
export async function loadUserInfo(id: string) {
  return await fetch(`/api/users/${id}`).then((res) => res.json());
}
```

**Correct:**

```typescript
// users.ts
export async function getUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// All other files import from here
import { getUser } from './users';
```

Reference: [https://getaiready.dev/docs/pattern-detect](https://getaiready.dev/docs/pattern-detect)

### 1.2 Unify Fragmented Interfaces

**Impact: CRITICAL (40-80% reduction in AI confusion, prevents wrong type usage)**

*Tags: patterns, interfaces, types, consistency*

Multiple similar interfaces or types for the same concept confuse AI models and lead to incorrect implementations. When AI encounters 5 different user types (`User`, `UserData`, `UserInfo`, `UserProfile`, `UserDTO`), it cannot determine which to use and often mixes them incorrectly.

This is one of the most critical issues for AI comprehension because it directly causes type errors and logic bugs that are hard to detect.

**Incorrect:**

```typescript
// user.types.ts
interface User {
  id: string;
  email: string;
}

// profile.types.ts
interface UserProfile {
  userId: string;
  email: string;
  name: string;
}

// api.types.ts
interface UserData {
  id: string;
  emailAddress: string;
  displayName: string;
}

// Three different interfaces for the same concept!
// AI cannot determine which to use where
function updateUser(user: User) {
  /* ... */
}
function getProfile(userId: string): UserProfile {
  /* ... */
}
function syncData(data: UserData) {
  /* ... */
}
```

**Correct:**

```typescript
// user.types.ts
interface User {
  id: string;
  email: string;
  name?: string; // Optional fields for different contexts
}

// Use a single source of truth
function updateUser(user: User) {
  /* ... */
}
function getProfile(userId: string): User {
  /* ... */
}
function syncData(user: User) {
  /* ... */
}

// For API-specific needs, extend rather than duplicate
interface UserDTO extends User {
  createdAt: Date;
  updatedAt: Date;
}
```

Reference: [https://refactoring.guru/extract-interface](https://refactoring.guru/extract-interface)

---

## 2. Context Optimization (context)

**Impact: HIGH**

Optimizes code organization for AI context windows. Addresses import depth, file cohesion, and dependency fragmentation that break AI understanding and lead to incomplete or incorrect suggestions.

---

### 2.1 Keep Import Chains Shallow

**Impact: HIGH (10-30% reduction in context depth)**

*Tags: context, imports, dependency-depth, circular-imports*

Deep import chains force AI models to load many intermediate files to understand a single function, quickly exceeding context window limits. When AI needs to trace through 5+ levels of imports, it often loses context of the original goal and provides incomplete or incorrect suggestions.

Each level of import depth exponentially increases the context needed:

- Level 1: Direct dependencies (good)
- Level 2-3: Transitive dependencies (acceptable)
- Level 4+: Deep chains (problematic for AI)

**Incorrect:**

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

**Correct:**

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

Reference: [https://getaiready.dev/docs/context-analyzer](https://getaiready.dev/docs/context-analyzer)

### 2.2 Maintain High Module Cohesion

**Impact: HIGH (25-40% reduction in context pollution, improves AI file selection)**

*Tags: context, cohesion, organization, modules*

Low cohesion forces AI to load multiple unrelated files to understand one feature. When a file contains unrelated functions (authentication + date formatting + validation), AI must read the entire file even when only needing one function.

High cohesion means related code stays together. AI can load the minimal context needed.

**Incorrect:**

```typescript
// utils.ts - Everything dumped together
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function formatDate(date: Date) {
  return date.toISOString();
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, SECRET);
}

// AI must load ALL of this just to understand password hashing!
// Context cost: 150+ lines for 10 lines of relevant code
```

**Correct:**

```typescript
// auth/password.ts
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// auth/token.ts
export function generateToken(userId: string) {
  return jwt.sign({ userId }, SECRET);
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}

// validation/email.ts
export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// utils/date.ts
export function formatDate(date: Date) {
  return date.toISOString();
}

// AI loads only auth/password.ts for password operations
// Context cost: 15 lines instead of 150+
```

Reference: [https://en.wikipedia.org/wiki/Cohesion_(computer_science)](https://en.wikipedia.org/wiki/Cohesion_(computer_science))

### 2.3 Split Large Files (>500 lines)

**Impact: HIGH (30-50% reduction in context window usage)**

*Tags: context, file-size, refactoring, modules*

Files over 500 lines often exceed AI context windows or force loading unnecessary code. When AI needs to understand one function in a 2000-line file, it must process the entire file, wasting 90%+ of its context budget.

Split large files by feature, responsibility, or data type.

**Incorrect:**

```typescript
// user-service.ts (2000+ lines)
class UserService {
  // Profile management (300 lines)
  async getProfile(userId: string) {
    /* ... */
  }
  async updateProfile(userId: string, data: any) {
    /* ... */
  }
  async uploadAvatar(userId: string, file: File) {
    /* ... */
  }

  // Authentication (400 lines)
  async login(email: string, password: string) {
    /* ... */
  }
  async logout(userId: string) {
    /* ... */
  }
  async resetPassword(email: string) {
    /* ... */
  }
  async verifyEmail(token: string) {
    /* ... */
  }

  // Permissions (350 lines)
  async hasPermission(userId: string, resource: string) {
    /* ... */
  }
  async grantPermission(userId: string, permission: string) {
    /* ... */
  }
  async revokePermission(userId: string, permission: string) {
    /* ... */
  }

  // Notifications (300 lines)
  async sendNotification(userId: string, message: string) {
    /* ... */
  }
  async getNotifications(userId: string) {
    /* ... */
  }
  async markAsRead(notificationId: string) {
    /* ... */
  }

  // Analytics (350 lines)
  async trackUserEvent(userId: string, event: string) {
    /* ... */
  }
  async getUserStats(userId: string) {
    /* ... */
  }

  // ... 300 more lines
}

// AI needs 2000 lines context just to understand profile updates!
```

**Correct:**

```typescript
// user/profile-service.ts (150 lines)
export class ProfileService {
  async get(userId: string) {
    /* ... */
  }
  async update(userId: string, data: ProfileData) {
    /* ... */
  }
  async uploadAvatar(userId: string, file: File) {
    /* ... */
  }
}

// user/auth-service.ts (200 lines)
export class AuthService {
  async login(email: string, password: string) {
    /* ... */
  }
  async logout(userId: string) {
    /* ... */
  }
  async resetPassword(email: string) {
    /* ... */
  }
  async verifyEmail(token: string) {
    /* ... */
  }
}

// user/permission-service.ts (180 lines)
export class PermissionService {
  async check(userId: string, resource: string) {
    /* ... */
  }
  async grant(userId: string, permission: string) {
    /* ... */
  }
  async revoke(userId: string, permission: string) {
    /* ... */
  }
}

// user/notification-service.ts (160 lines)
export class NotificationService {
  async send(userId: string, message: string) {
    /* ... */
  }
  async list(userId: string) {
    /* ... */
  }
  async markRead(notificationId: string) {
    /* ... */
  }
}

// user/analytics-service.ts (170 lines)
export class AnalyticsService {
  async trackEvent(userId: string, event: string) {
    /* ... */
  }
  async getStats(userId: string) {
    /* ... */
  }
}

// AI loads only 150 lines for profile operations
// Context savings: 1850 lines (92% reduction)
```

Reference: [https://refactoring.guru/extract-class](https://refactoring.guru/extract-class)

---

## 3. Consistency Checking (consistency)

**Impact: MEDIUM**

Ensures naming conventions, error handling patterns, and API designs are consistent across the codebase. Inconsistencies confuse AI models and lead to incorrect pattern replication.

---

### 3.1 Follow Consistent Naming Conventions

**Impact: MEDIUM (5-15% improvement in AI pattern recognition)**

*Tags: consistency, naming, conventions, readability*

Inconsistent naming conventions confuse AI models about code intent and relationships. When similar concepts use different naming patterns, AI cannot reliably predict the correct pattern for new code, leading to inconsistent suggestions that mix multiple styles.

AI models are trained on millions of repositories and learn that consistent naming correlates with code quality. Inconsistent naming signals:

- Lack of coordination between team members
- Technical debt or legacy code
- Unclear ownership or architecture

**Incorrect:**

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

**Correct:**

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

Reference: [https://getaiready.dev/docs/consistency](https://getaiready.dev/docs/consistency)

### 3.2 Use Consistent Error Handling Patterns

**Impact: MEDIUM (15-25% improvement in AI error handling suggestions)**

*Tags: consistency, errors, patterns, exceptions*

Mixed error patterns confuse AI models. When your codebase uses throw, try-catch, error callbacks, Result types, and null returns interchangeably, AI cannot predict the correct pattern and suggests inconsistent error handling.

Choose one primary pattern and use it consistently.

**Incorrect:**

```typescript
// File 1: throws exceptions
function parseUserData(data: string): User {
  if (!data) throw new Error('Invalid data');
  return JSON.parse(data);
}

// File 2: returns null
function getUserById(id: string): User | null {
  const user = database.get(id);
  return user ?? null;
}

// File 3: uses error callbacks
function fetchUser(
  id: string,
  callback: (error: Error | null, user?: User) => void
) {
  // ...
}

// File 4: returns Result type
function validateUser(user: User): Result<User, ValidationError> {
  // ...
}

// AI cannot determine which pattern to use when suggesting code!
```

**Correct:**

```typescript
// shared/result.ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// All functions use the same pattern
function parseUserData(data: string): Result<User> {
  if (!data) return err(new Error('Invalid data'));
  try {
    return ok(JSON.parse(data));
  } catch (e) {
    return err(new Error('Parse failed'));
  }
}

function getUserById(id: string): Result<User> {
  const user = database.get(id);
  if (!user) return err(new Error('User not found'));
  return ok(user);
}

function validateUser(user: User): Result<User, ValidationError> {
  if (!user.email) return err({ field: 'email', message: 'Required' });
  return ok(user);
}

// Usage is consistent everywhere
const result = getUserById('123');
if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.error.message);
}
```

Reference: [https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)

---

## 4. Documentation (docs)

**Impact: MEDIUM**

Keeps documentation synchronized with code changes. Outdated documentation misleads AI models, causing them to suggest deprecated patterns or incorrect implementations.

---

### 4.1 Keep Documentation in Sync with Code

**Impact: MEDIUM (20-30% reduction in AI suggestion errors from stale docs)**

*Tags: documentation, maintenance, comments, sync*

Outdated documentation misleads AI models. When function signatures change but JSDoc comments don't update, AI suggests code based on old documentation, causing type errors and logic bugs.

Keep docs close to code and update them together.

**Incorrect:**

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
  return database.users.findOne({ id, ...options });
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
const MAX_RETRIES = 5; // Maximum retry attempts (actually 5, not 3!)
// This function is deprecated (but it's still used everywhere)
function legacyAuth() {
  /* ... */
}
```

**Correct:**

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
  return database.users.findOne({ id, ...options });
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
const MAX_RETRIES = 5; // Maximum retry attempts before giving up

/**
 * @deprecated Use authenticateWithJWT instead. Will be removed in v2.0
 * @see authenticateWithJWT
 */
function legacyAuth() {
  /* ... */
}
```

Reference: [https://jsdoc.app/](https://jsdoc.app/)

---

## References

1. [https://getaiready.dev](https://getaiready.dev)
2. [https://getaiready.dev/docs](https://getaiready.dev/docs)
