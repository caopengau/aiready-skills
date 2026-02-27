---
title: Avoid High-Entropy Naming
impact: CRITICAL
impactDescription: Names with multiple interpretations confuse AI models
tags: signal, naming, entropy, ambiguity, clarity
---

## Avoid High-Entropy Naming

**Impact: CRITICAL (AI cannot disambiguate intent)**

High-entropy names - variables or functions with multiple possible semantic interpretations - confuse AI models. When a name like "data", "info", "handle", or "process" is used, AI cannot determine what concept it represents, leading to incorrect suggestions.

AI models trained on millions of repos learn that ambiguous names correlate with low-quality code and often skip over or misinterpret such identifiers.

**Incorrect (high-entropy names):**

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

**Correct (descriptive names):**

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

**Detection tip:** Run `npx @aiready/ai-signal-clarity` to automatically identify high-entropy naming patterns in your codebase.

Reference: [AI Signal Clarity Docs](https://getaiready.dev/docs/ai-signal-clarity)