---
name: Rongeka Architecture Overview
description: Key architectural decisions, data flow, and security-sensitive areas found during the 2026-03-19 audit
type: project
---

Rongeka is an early-stage Next.js 16 / React 19 app — dashboard UI plus DB layer, no auth or API routes yet implemented.

**Why:** Understanding the current state prevents flagging missing features (auth, API routes, middleware) as bugs in future sessions.
**How to apply:** When auditing, focus on what exists. Auth, AI routes, Stripe webhook, file upload endpoints do not yet exist — do not flag them as missing.

## Key architectural facts (as of 2026-03-19 audit)

- No `middleware.ts` — route protection not yet implemented (auth phase not started)
- No API routes under `src/app/api/` — none exist yet
- No Server Actions under `src/actions/` — none exist yet
- All DB queries are in `src/lib/db/{collections,items,sidebar}.ts` — server-only, called from RSCs
- Authentication: `bcryptjs` is a dependency but NextAuth is not yet wired up; seed script has hardcoded demo password `12345678`
- Data is NOT scoped by userId anywhere — all queries return all rows in the database (documented with TODO comments)
- `src/lib/mock-data.ts` still exists but is no longer imported anywhere (dead file)
- Prisma client is a singleton in `src/lib/db.ts` using PrismaPg adapter for Neon

## Security-sensitive code locations

- `prisma/seed.ts` line 12: hardcoded password `12345678` for demo user — acceptable for seed, not production code
- `src/lib/db.ts` line 10: `process.env.DATABASE_URL!` non-null assertion — safe pattern for required env var
- All DB query functions lack userId filtering — deliberate TODO, not yet a multi-user app

## Confirmed safe patterns

- `.env` is in `.gitignore` (pattern `.env*`) — correct
- `src/generated/` is in `.gitignore` — correct
- No raw SQL (`$queryRaw`, `$executeRaw`) used anywhere
- No `dangerouslySetInnerHTML` anywhere
- No hardcoded secrets in source files
- TypeScript strict mode enabled, no `any` types in src/
- Prisma migrations used (not `db push`)
- Proper database indexes on `items` (`userId`, `itemTypeId`, `userId+lastUsedAt`) and `collections` (`userId`)
