# Current Feature: Item Create

## Status

In Progress

## Goals

- "New Item" button in the top bar opens a shadcn Dialog modal
- Type selector in the dialog: snippet, prompt, command, note, link
- Fields shown based on selected type:
  - All types: title (required), description, tags
  - snippet / command: content + language
  - prompt / note: content
  - link: URL (required)
- `createItem` server action in `src/actions/items.ts` with Zod validation and `{ success, data, error }` pattern
- `createItem` DB query in `src/lib/db/items.ts`
- On success: toast, close modal, `router.refresh()`

## Notes

- File and image types are Pro/future — exclude from the type selector
- shadcn Dialog is already installed (used on profile page)
- Tags are comma-separated input, split on save (same pattern as edit mode)

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
- **2026-03-24** — Completed Rate Limiting for Auth: @upstash/ratelimit sliding-window limits on login (5/15m, IP+email), register (3/1h, IP), forgot-password (3/1h, IP), reset-password (5/15m, IP); src/lib/rate-limit.ts utility with fail-open behavior; deleted orphaned /api/auth/register route that bypassed email verification
- **2026-03-25** — Completed Items List View: dynamic route /dashboard/items/[type] with getItemsByType() DB query; responsive 2-column grid of ItemRow components with type-colored left borders; sidebar links corrected from /items/[slug] to /dashboard/items/[slug]
- **2026-03-25** — Completed Item Listing 3-Column Layout: updated grid from md:grid-cols-2 to lg:grid-cols-3; responsive breakpoints: 1 col mobile, 2 col md, 3 col lg+
- **2026-03-26** — Completed Item Drawer: Sheet component (base-ui/dialog, slides from right); GET /api/items/[id] with auth + userId scoping; ItemDrawer client component with skeleton loading, error state, and action bar (Favorite, Pin, Copy, Edit, Delete); ItemsWithDrawer client wrapper preserving server components; works on dashboard and items list pages; 5 unit tests for the API route
- **2026-03-26** — Completed Item Drawer Edit Mode: inline edit mode via Edit button; Save/Cancel action bar; editable title, description, tags (all types), content (text types), language (snippet/command), URL (link); type/collections/dates display-only; updateItem server action with Zod validation + try/catch; updateItem DB query with tag disconnect-all + connectOrCreate; sonner toasts; router.refresh() on save; 8 unit tests for the server action
- **2026-03-26** — Completed Item Delete: Delete button opens shadcn AlertDialog confirmation with item title; on confirm calls deleteItem server action (auth + userId-scoped), closes drawer, success toast, router.refresh(); deleteItem DB query with try/catch; 5 unit tests for the server action
