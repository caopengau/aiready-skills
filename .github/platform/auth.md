# Authentication & Login Flow

This document covers OAuth login flows, token/session lifecycle, and security considerations.

---

## Overview

- **Primary sign-in:** OAuth (GitHub, Google)
- **Session management:** Secure HTTP-only cookies with JWT tokens via NextAuth.js

---

## Authentication Methods (Implemented)

| Method | Status | Use Case | Flow |
|--------|--------|----------|------|
| **GitHub OAuth** | ✅ Implemented | Primary sign-in for developers | GitHub → Authorize → Session |
| **Google OAuth** | ✅ Implemented | Convenience for users with Google accounts | Google → Authorize → Session |
| **Email/Password** | 🔜 Planned | Traditional login | Email + Password → Verify → Session |
| **Magic Link** | 🔜 Planned | Passwordless option | Email → Link → Verify → Session |

---

## GitHub OAuth Flow

```
1. User clicks "Sign in with GitHub" on /login
2. Redirects to GitHub OAuth consent screen
3. User authorizes
4. GitHub redirects to /api/auth/callback/github?code=xxx
5. Server exchanges code for GitHub profile
6. Server creates/fetches user in DynamoDB (githubId)
7. Server creates session, sets cookie
8. Redirects to /dashboard
```

---

## Google OAuth Flow

```
1. User clicks "Sign in with Google" on /login
2. Redirects to Google OAuth consent screen
3. User authorizes
4. Google redirects to /api/auth/callback/google?code=xxx
5. Server exchanges code for Google profile
6. Server creates/fetches user in DynamoDB (googleId)
7. Server creates session, sets cookie
8. Redirects to /dashboard
```

---

## Configuration

### Environment Variables Required

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Setting up OAuth Providers

1. **GitHub:** Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
2. **Google:** Go to Google Cloud Console → APIs & Services → Credentials → OAuth 2.0

---

## Planned Authentication Methods

### Email/Password (Coming Soon)

```
1. User enters email + password on /login
2. Server validates credentials against hashed password in DynamoDB
3. Server creates session, sets cookie
4. Redirects to /dashboard
```

### Magic Link (Coming Soon)

```
1. User enters email on /login
2. Client POSTs to /api/auth/signin
3. Server creates short-lived auth token (15 min TTL)
4. Server sends magic link via SES: https://app.example.com/auth/verify?token=xxx
5. User clicks link
6. Server validates token, creates session
7. Server sets HTTP-only cookie, redirects to dashboard
```

---

## Session & Token Lifecycle

| Token Type | Lifetime | Storage | Purpose |
|------------|----------|---------|---------|
| **Auth Token** | 15 minutes | DynamoDB | One-time magic link verification |
| **Session Token** | 7 days | HTTP-only cookie | Authenticated requests |
| **Refresh Token** | 30 days | HTTP-only cookie | Session renewal |

---

## Session Cookie Structure

```typescript
interface SessionCookie {
  userId: string;
  email: string;
  role: 'resident' | 'manager' | 'handyman' | 'admin';
  companyId: string;
  buildingIds: string[];  // For multi-building managers
  iat: number;            // Issued at
  exp: number;            // Expiration
}
```

---

## Role-Based Redirects After Login

| Role | Redirect To |
|------|-------------|
| Resident | `/app/resident` |
| Manager | `/app/manager` |
| Handyman | `/app/handyman` |
| Admin | `/app/admin` |

---

## E2E Testing Notes

- Use dedicated test accounts with known emails
- Mock SES for magic link in CI environments
- Extract magic link token from email body or logs for test verification
- Google OAuth: Use Playwright's `browserContext.authenticateWithGoogle()` or mock the callback

---

## Security Considerations

| Concern | Implementation |
|---------|----------------|
| **Rate limiting** | Max 5 magic link requests per email per hour |
| **Token rotation** | New session token issued on refresh |
| **Token revocation** | Deleting session from DynamoDB invalidates cookie |
| **CSRF protection** | SameSite=Strict cookies + CSRF token in headers |
| **Audit logging** | All auth events logged with IP, user agent, timestamp |