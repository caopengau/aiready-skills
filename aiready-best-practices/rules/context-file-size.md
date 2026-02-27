---
title: Split Large Files (>500 lines)
impact: HIGH
impactDescription: 30-50% reduction in context window usage
tags: context, file-size, refactoring, modules
references: https://refactoring.guru/extract-class
---

## Split Large Files (>500 lines)

**Impact: HIGH (30-50% reduction in context window usage)**

Files over 500 lines often exceed AI context windows or force loading unnecessary code. When AI needs to understand one function in a 2000-line file, it must process the entire file, wasting 90%+ of its context budget.

Split large files by feature, responsibility, or data type.

**Incorrect (monolithic file):**

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

**Correct (split by responsibility):**

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

File size guidelines:

- **< 200 lines**: Ideal for AI models (fits in single context window)
- **200-500 lines**: Acceptable if cohesive
- **500-1000 lines**: Should be split unless tightly coupled
- **> 1000 lines**: Always split - too large for effective AI assistance

When splitting:

1. Group by feature or responsibility
2. Keep related operations together
3. Extract to separate files in a logical directory structure
4. Use index files to maintain clean imports

Benefits:

- 30-50% less context used per operation
- AI can process files more accurately
- Faster response times
- Better code suggestions

Reference: [Refactoring: Extract Class](https://refactoring.guru/extract-class)
