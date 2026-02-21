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
| **Email/Password** | ✅ Implemented | Traditional login | Email + Password → Verify → Session |
| **Magic Link** | ✅ Implemented | Passwordless option | Email → Link → Verify → Session |

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

## Email/Password Flow

### Registration

```
1. User enters email + password + name on /register
2. Client POSTs to /api/auth/register
3. Server validates input (email format, password strength)
4. Server checks if email already exists
5. Server hashes password with bcrypt (12 rounds)
6. Server creates user in DynamoDB with passwordHash
7. Returns success, user can now sign in
```

### Login

```
1. User enters email + password on /login
2. NextAuth Credentials provider validates:
   - Fetches user by email from DynamoDB
   - Compares password with stored hash
3. If valid, creates session, sets cookie
4. Redirects to /dashboard
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new account |
| `/api/auth/signin` | POST | Sign in (NextAuth) |
| `/api/auth/signout` | POST | Sign out (NextAuth) |

---

## Magic Link Flow

### Request Magic Link

```
1. User enters email on /login
2. Client POSTs to /api/auth/magic-link
3. Server checks if user exists (creates if not)
4. Server generates token (UUID)
5. Server stores token in DynamoDB with 15 min TTL
6. Server sends magic link via AWS SES
7. Returns success message
```

### Verify Magic Link

```
1. User clicks link: /auth/verify?token=xxx
2. Client POSTs token to /api/auth/verify
3. Server validates token (exists, not used, not expired)
4. Server marks token as used
5. Server returns user info
6. Client calls signIn('magic-link') to create session
7. Redirects to /dashboard
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/magic-link` | POST | Request magic link email |
| `/api/auth/verify` | POST | Verify magic link token |

### AWS SES Setup

Before deploying, verify your domain in AWS SES:

1. Go to AWS SES Console → Verified Identities
2. Create Identity → Domain → `getaiready.dev`
3. Add required DNS records (DKIM, SPF)
4. Wait for verification
5. For production, request sending limit increase

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