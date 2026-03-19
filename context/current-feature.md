# Current Feature

<!-- No active feature -->

## Status

<!-- Not started -->

## Goals

<!-- None -->

## Notes

<!-- None -->


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
