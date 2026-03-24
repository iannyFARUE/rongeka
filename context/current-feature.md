# Current Feature: Rate Limiting for Auth

## Status

In Progress

## Goals

- Add rate limiting to all auth-related endpoints to prevent brute-force, credential stuffing, and email abuse
- Use Upstash Redis with `@upstash/ratelimit` (sliding window, serverless-compatible)
- Create a reusable `src/lib/rate-limit.ts` utility
- Protect 5 endpoints with appropriate limits (login, register, forgot-password, reset-password, resend-verification)
- Return 429 responses with `Retry-After` header and user-friendly error messages
- Rate limiting fails open if Upstash is unavailable

## Notes

- Endpoints and limits:
  - `/api/auth/callback/credentials` (login) — 5 attempts / 15 min, key by IP + email
  - `/api/auth/register` — 3 attempts / 1 hour, key by IP
  - `/api/auth/forgot-password` — 3 attempts / 1 hour, key by IP
  - `/api/auth/reset-password` — 5 attempts / 15 min, key by IP
  - `/api/auth/resend-verification` — 3 attempts / 15 min, key by IP + email
- Rate limit utility returns `{ success, remaining, reset }`
- Extract IP from `x-forwarded-for` header (Vercel)
- 429 JSON body: `{ error: "Too many attempts. Please try again in X minutes." }`
- Login limiting with NextAuth Credentials is tricky — may need a custom sign-in handler or authorize-level check
- Upstash free tier: 10k requests/day (sufficient)
- Env vars needed: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## History

- **2026-03-16** — Initial Next.js app scaffolded with Create Next App
- **2026-03-16** — Completed Dashboard UI Phase 1: ShadCN initialized, dark mode, top bar with search and New Item button, dashboard route with sidebar and main placeholders
- **2026-03-16** — Completed Dashboard UI Phase 2: Collapsible sidebar with icon-only collapsed state, item type links, favorite/recent collections, recently used items, user avatar, mobile drawer support, and Geist font fix
- **2026-03-16** — Completed Dashboard UI Phase 3: Stats cards, recent collections grid, pinned items section, and recent items list in the main content area
- **2026-03-18** — Completed Prisma + Neon PostgreSQL setup: Prisma 7 with PrismaPg driver adapter, full schema with all data models and NextAuth tables, initial migration applied to Neon dev branch, db:test and db:studio scripts added
- **2026-03-18** — Completed Database Seed: idempotent seed script (prisma/seed.ts) with demo user, 7 system item types, and 5 collections with 18 items; db:seed script and prisma.seed config added to package.json
- **2026-03-18** — Completed Dashboard Collections: replaced mock collection data with real Neon DB data; created src/lib/db/collections.ts with getCollections() and getDashboardStats(); collection cards now show dominant-type colored left border and real item type icons
- **2026-03-18** — Completed Dashboard Items: replaced mock item data with real Neon DB data; created src/lib/db/items.ts with getPinnedItems() and getRecentItems(); ItemRow now uses DB types; mock-data.ts fully removed from dashboard
- **2026-03-18** — Completed Stats & Sidebar: created src/lib/db/sidebar.ts and DashboardShell client component; layout.tsx converted to server component; sidebar shows live item types (custom order), collections with dominant-type colored dots, recently used items, and "View all collections" link
- **2026-03-19** — Completed Pro Badge in Sidebar: added shadcn/ui Badge component; Files and Images item type links in the expanded sidebar now show a subtle violet "Pro" badge
- **2026-03-19** — Completed Code Audit Quick Wins: added getDemoUserId() helper + userId scoping on all DB queries; filtered null lastUsedAt from recent items; removed "use client" from CollectionCard; merged duplicate lucide-react imports
- **2026-03-21** — Completed Auth Setup: NextAuth v5 beta with GitHub OAuth; split edge config (auth.config.ts + auth.ts); Prisma adapter + JWT strategy; Next.js 16 proxy protecting /dashboard/*; session.user.id exposed via callbacks; Session type extended
- **2026-03-21** — Completed Auth Credentials: email/password Credentials provider with bcrypt validation; edge-safe placeholder in auth.config.ts; POST /api/auth/register with validation, dedup, and hashing; form fields defined for built-in sign-in page
- **2026-03-22** — Completed Auth UI: custom /sign-in and /register pages; UserAvatar (image or initials); sidebar user area with real session name/avatar and sign-out dropdown; dashboard/page and layout use auth() session; getDemoUserId removed
- **2026-03-22** — Completed Email Verification: Resend integration; user+token created atomically with email-send rollback; /check-email and /verify-email pages; Credentials sign-in blocked for unverified users; scripts/reset-users.ts for dev DB cleanup
- **2026-03-22** — Completed Email Verification Toggle Flag: central FEATURES.emailVerification flag in src/lib/features.ts; EMAIL_VERIFICATION_ENABLED env var (defaults true); registration and credentials sign-in respect the flag; documented in .env.example
- **2026-03-23** — Completed Forgot Password: /forgot-password email form + /reset-password token page; VerificationToken model reused with 1hr TTL; no email enumeration; unverified users automatically verified on successful reset; Resend emails upgraded to shared dark-mode HTML template
- **2026-03-24** — Completed Profile Page: /dashboard/profile with user info (name, email, avatar, creation date), usage stats (total items, collections, per-type breakdown), Change Password dialog (email users only), Delete Account confirmation dialog; shadcn Dialog added (base-ui/react)
