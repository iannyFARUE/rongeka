# Auth Security Review

**Last audited:** 2026-03-24
**Audited by:** auth-auditor agent
**Files reviewed:**
- `src/auth.ts`
- `src/auth.config.ts`
- `src/proxy.ts`
- `src/actions/auth.ts`
- `src/actions/profile.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/(auth)/verify-email/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/components/profile/ChangePasswordDialog.tsx`
- `src/components/profile/DeleteAccountDialog.tsx`
- `src/app/dashboard/profile/page.tsx`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/resend.ts`
- `src/lib/features.ts`
- `src/lib/db/profile.ts`
- `next.config.ts`

---

## Summary

17 files reviewed. 4 issues found across 3 severity levels (1 high, 2 medium, 1 low). The core password hashing, bcrypt verification, token lifecycle, and session-guarded profile actions are all implemented correctly. The most significant finding is the complete absence of rate limiting on all credential-based endpoints. A secondary concern is a duplicate registration route that bypasses email verification. One medium-severity issue exists around email normalization inconsistency, and one low-severity issue concerns the `deleteAccount` action silently returning on unauthenticated calls rather than failing loudly.

---

## 🟠 HIGH

### No Rate Limiting on Any Credential Endpoint

- **Files**: `src/actions/auth.ts`, `src/actions/profile.ts`, `src/auth.ts`, `src/app/api/auth/register/route.ts`
- **Problem**: There is no rate limiting anywhere in the application. The following endpoints are completely unbounded:
  - Credentials login (`/api/auth/callback/credentials` via NextAuth) — brute-force of any account password
  - Registration (`registerUser` Server Action and `/api/auth/register` API route) — account creation spam, Resend quota exhaustion
  - Password reset request (`requestPasswordReset`) — email bombing any address, Resend quota exhaustion
  - Reset password form (`resetPassword`) — token brute-force (mitigated partially by `crypto.randomUUID()` entropy, but still unthrottled)
  - Change password (`changePassword`) — brute-force of `currentPassword` for authenticated sessions
- **Fix**: Add rate limiting before deploying to production. The simplest approach for a Next.js/Vercel stack is [`@upstash/ratelimit`](https://github.com/upstash/ratelimit) with a Redis store, applied per IP in the Server Actions and in the proxy middleware. At minimum, the credentials login and password reset request endpoints must be rate-limited.

---

## 🟡 MEDIUM

### Duplicate Registration Route Bypasses Email Verification

- **File**: `src/app/api/auth/register/route.ts`
- **Problem**: This API route (`POST /api/auth/register`) is an older, orphaned registration endpoint. It creates a fully verified user account — `emailVerified` is never set, but the user is created directly without a verification token, and no verification email is sent. If `FEATURES.emailVerification` is `true` (the production default), a user registered via this route will be blocked from signing in via Credentials because `auth.ts` checks `user.emailVerified`. However, the route still creates a user record that occupies the email slot, and it does not apply email normalization (no `.trim().toLowerCase()`). More critically, should the feature flag ever be `false`, or if an OAuth sign-in occurs for the same email, this path creates a dangling account with no verification lifecycle. The Server Action (`registerUser`) is the correct, maintained path.
- **Code**:
  ```ts
  // src/app/api/auth/register/route.ts — no email verification, no feature-flag check
  await prisma.user.create({
    data: { name, email, password: hashedPassword },
  })
  return NextResponse.json({ success: true }, { status: 201 })
  ```
- **Fix**: Delete `src/app/api/auth/register/route.ts`. All registration flows should go through the `registerUser` Server Action in `src/actions/auth.ts`, which correctly handles the email verification lifecycle and the feature flag.

### Email Not Normalized in Registration

- **File**: `src/actions/auth.ts` (lines 13–14)
- **Problem**: The `registerUser` Server Action reads `email` directly from `FormData` without calling `.trim().toLowerCase()`. The `requestPasswordReset` action (line 77) does normalize: `(formData.get("email") as string)?.trim().toLowerCase()`. The `authorize` callback in `src/auth.ts` performs a `findUnique` on the raw email from credentials. This inconsistency means a user who registered as ` Alice@Example.com` (with leading space or mixed case) could create a duplicate account, or fail to receive a reset email if they later request one with the normalized form.
- **Code**:
  ```ts
  // src/actions/auth.ts lines 13-14 — no normalization
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  ```
- **Fix**: Normalize email at the start of `registerUser`:
  ```ts
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  ```

---

## 🔵 LOW

### `deleteAccount` Silently Returns on Unauthenticated Call

- **File**: `src/actions/profile.ts` (line 54)
- **Problem**: If `session?.user?.id` is absent, `deleteAccount` returns `void` silently — no error is thrown or returned to the caller. The `DeleteAccountDialog` component calls `await deleteAccount()` with no error-path handling (it just waits for the transition). In practice, the `/dashboard` routes are protected by the proxy, so an unauthenticated call is unlikely. However, failing silently rather than returning an explicit error string makes future debugging harder and means the UI shows no feedback if the guard is ever bypassed.
- **Code**:
  ```ts
  export async function deleteAccount(): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) return; // silent no-op
    ...
  }
  ```
- **Fix**: Throw an error or change the return type to `{ error?: string }` so the caller can surface a message:
  ```ts
  if (!session?.user?.id) throw new Error("Not authenticated.");
  ```

---

## Passed Checks

- **bcrypt usage confirmed**: `bcryptjs` is used throughout. `bcrypt.hash(password, 12)` is called in `registerUser`, `resetPassword`, and `changePassword`. Cost factor 12 is within the recommended range (10–14).
- **bcrypt.compare() used for verification**: `auth.ts` (Credentials `authorize`) and `changePassword` both call `await bcrypt.compare(candidate, stored)` — no string equality comparison.
- **Hashed password never returned to client**: `src/lib/db/profile.ts` selects `password` only to derive the boolean `hasPassword`. The hash is never included in any serialized response or client-facing type.
- **Token generation is cryptographically secure**: `crypto.randomUUID()` is used in both `registerUser` (email verification) and `requestPasswordReset`. This provides 122 bits of entropy and is a CSPRNG on all Node.js runtimes.
- **Token expiry enforced server-side**: Both `verify-email/page.tsx` and `reset-password/page.tsx` check `record.expires < new Date()` before proceeding. The `resetPassword` Server Action performs the same check independently before updating the password.
- **Expired tokens are deleted**: All expiry-check branches call `prisma.verificationToken.delete({ where: { token } })` before returning the error response.
- **Tokens are single-use**: Both the email verification page and `resetPassword` call `prisma.verificationToken.delete({ where: { token } })` after successful use.
- **Token lookup uses `findUnique`**: All token lookups use `prisma.verificationToken.findUnique({ where: { token } })` — exact match, no partial or `contains` query.
- **Old reset tokens purged on new request**: `requestPasswordReset` calls `prisma.verificationToken.deleteMany({ where: { identifier: email } })` before creating a new token, preventing token accumulation.
- **Email enumeration avoided in password reset**: `requestPasswordReset` returns `null` (success) for both existing and non-existing emails. A comment in the source (`// Always succeed to avoid email enumeration`) confirms the intent.
- **Password reset uses token-bound identity**: `resetPassword` updates the user identified by `record.identifier` (the email stored in the token at issuance), not from any user-supplied field in the form submission.
- **`changePassword` verifies current password**: `src/actions/profile.ts` fetches the user by `session.user.id`, then calls `bcrypt.compare(currentPassword, user.password)` before updating.
- **`changePassword` uses session ID not client input**: User is fetched with `prisma.user.findUnique({ where: { id: session.user.id } })` — the session is the authoritative source of identity.
- **`deleteAccount` uses session ID**: Account deletion targets `{ id: session.user.id }` — no client-supplied ID is trusted.
- **Profile page uses `auth()` for session**: `src/app/dashboard/profile/page.tsx` calls `await auth()` to get the session before fetching any profile data.
- **Dashboard routes are protected**: `src/proxy.ts` uses NextAuth's `auth()` middleware wrapper to guard all `/dashboard/:path*` routes, redirecting unauthenticated requests to the sign-in page.
- **Email verification gate enforced on sign-in**: `src/auth.ts` Credentials `authorize` returns `null` when `FEATURES.emailVerification && !user.emailVerified`, blocking unverified users from obtaining a session.
- **Server Actions validate input server-side**: `registerUser`, `requestPasswordReset`, `resetPassword`, and `changePassword` all perform length and format checks on the server. Client-side `minLength` attributes in forms are supplementary only.
- **No password exposed in register/login responses**: The `authorize` callback returns the raw Prisma `user` object, but NextAuth's JWT strategy serializes only the `id`, `name`, `email`, and `image` fields into the token — `password` is not included in the JWT or session.
