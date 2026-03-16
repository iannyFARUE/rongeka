# Rongeka — Project Overview

> **One fast, searchable, AI-enhanced hub for all developer knowledge & resources.**

Developers scatter their essentials across VS Code, Notion, browser bookmarks, `.txt` files, GitHub Gists, and bash history. Rongeka consolidates everything — snippets, prompts, commands, links, notes, and files — into a single keyboard-friendly workspace.

---

## Table of Contents

1. [Target Users](#target-users)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Data Models](#data-models)
5. [Prisma Schema](#prisma-schema)
6. [Item Types](#item-types)
7. [UI/UX Guidelines](#uiux-guidelines)
8. [Monetization](#monetization)
9. [Project Structure](#project-structure)
10. [Key Decisions & Notes](#key-decisions--notes)

---

## Target Users

| User | Core Need |
|---|---|
| **Everyday Developer** | Quickly grab snippets, commands, and links |
| **AI-first Developer** | Save prompts, system messages, context files, and workflows |
| **Content Creator / Educator** | Store code blocks, explanations, and course notes |
| **Full-stack Builder** | Collect patterns, boilerplates, and API examples |

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| **Framework** | Next.js 16 / React 19 | SSR pages + dynamic components |
| **Language** | TypeScript | Full type safety across the stack |
| **Database** | Neon (PostgreSQL) | Serverless Postgres |
| **ORM** | Prisma 7 | [Docs](https://www.prisma.io/docs) — always use migrations, never `db push` |
| **Caching** | Redis (TBD) | May be added for search/performance |
| **File Storage** | Cloudflare R2 | File and image uploads |
| **Auth** | NextAuth v5 | Email/password + GitHub OAuth |
| **AI** | OpenAI `gpt-4o-mini` | Tagging, summaries, code explanation, prompt optimizer |
| **Styling** | Tailwind CSS v4 + shadcn/ui | [Tailwind Docs](https://tailwindcss.com/docs) · [shadcn Docs](https://ui.shadcn.com) |
| **Payments** | Stripe | Subscription management |

> ⚠️ **Database Rule:** Never run `db push` or manually edit the database structure. Always create Prisma migrations (`prisma migrate dev`) and apply them in both dev and prod.

---

## Features

### A. Items & Item Types

Items are the core unit of Rongeka. Each item has a **type** that determines its icon, color, and behavior.

- Items are quick to create and access via a **slide-in drawer**
- Item type URLs follow the pattern `/items/snippets`, `/items/prompts`, etc.
- System types cannot be modified; custom types are a planned Pro feature

**Content categories:**

| Category | Types |
|---|---|
| `text` | snippet, prompt, note, command |
| `url` | link |
| `file` | file *(Pro)*, image *(Pro)* |

---

### B. Collections

Collections are user-defined groups that can hold items of any type.

- An item can belong to **multiple collections** (many-to-many via join table)
- Examples: `React Patterns`, `Interview Prep`, `Context Files`, `Python Snippets`
- Collections have an optional `defaultTypeId` to pre-select a type when creating new items

---

### C. Search

Full-text search across:
- Item title
- Item content
- Tags
- Item type

---

### D. Authentication

- Email/password
- GitHub OAuth
- Powered by **NextAuth v5**

---

### E. Core Features

- ⭐ Favorite collections and items
- 📌 Pin items to top
- 🕑 Recently used items
- 📥 Import code from a file
- ✏️ Markdown editor for text-type items
- 📁 File upload for `file` / `image` types
- 📤 Export data (JSON / ZIP)
- 🌙 Dark mode (default) with light mode toggle
- ➕ Add/remove items to/from multiple collections
- 🔍 View which collections an item belongs to

---

### F. AI Features *(Pro only)*

| Feature | Description |
|---|---|
| **Auto-tag suggestions** | Suggests relevant tags based on content |
| **AI Summaries** | Generates a short summary of any item |
| **Explain This Code** | Breaks down a code snippet in plain language |
| **Prompt Optimizer** | Rewrites and improves AI prompts |

> During development, all users can access Pro/AI features regardless of subscription status.

---

## Data Models

```
┌─────────────┐        ┌─────────────────┐        ┌──────────────┐
│    User     │──────< │      Item       │>───────│  Collection  │
└─────────────┘        └─────────────────┘        └──────────────┘
       │                       │                          │
       │                  ┌────┴────┐               ItemCollection
       │                  │         │                (join table)
       │               ItemType    Tag
       │             (system or
       └──────────>    custom)
```

### Relationships

- A **User** has many Items, Collections, and (eventually) custom ItemTypes
- An **Item** belongs to one ItemType and one User; has many Tags; belongs to many Collections via `ItemCollection`
- A **Collection** belongs to one User; has many Items via `ItemCollection`
- **ItemType** is either system-owned (user = null) or user-owned (Pro custom types)

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Auth (NextAuth v5) ──────────────────────────────────────────

model User {
  id                    String    @id @default(cuid())
  name                  String?
  email                 String    @unique
  emailVerified         DateTime?
  image                 String?
  password              String?   // null for OAuth users
  isPro                 Boolean   @default(false)
  stripeCustomerId      String?   @unique
  stripeSubscriptionId  String?   @unique
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  accounts    Account[]
  sessions    Session[]
  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ─── Core Models ────────────────────────────────────────────────

model ItemType {
  id       String  @id @default(cuid())
  name     String  // "snippet" | "prompt" | "note" | "command" | "file" | "image" | "link"
  icon     String  // Lucide icon name e.g. "Code", "Sparkles"
  color    String  // Hex color e.g. "#3b82f6"
  isSystem Boolean @default(false) // system types cannot be edited or deleted

  userId String? // null for system types
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items            Item[]
  defaultForCollections Collection[] @relation("DefaultType")

  @@map("item_types")
}

model Item {
  id          String  @id @default(cuid())
  title       String
  description String?

  // Content
  contentType ContentType // TEXT | FILE | URL
  content     String?     // Markdown/text content (null if file/link)
  language    String?     // e.g. "typescript", "python" (for syntax highlighting)

  // File fields (R2)
  fileUrl      String? // Cloudflare R2 URL
  fileName     String? // Original filename
  fileSize     Int?    // Bytes

  // Link field
  url String? // for link type items

  // Meta
  isFavorite Boolean  @default(false)
  isPinned   Boolean  @default(false)
  lastUsedAt DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  userId     String
  itemTypeId String

  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemType        ItemType         @relation(fields: [itemTypeId], references: [id])
  tags            Tag[]
  itemCollections ItemCollection[]

  @@map("items")
}

model Collection {
  id          String  @id @default(cuid())
  name        String
  description String?
  isFavorite  Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId        String
  defaultTypeId String? // Pre-selected type for new items in this collection

  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  defaultType     ItemType?        @relation("DefaultType", fields: [defaultTypeId], references: [id])
  itemCollections ItemCollection[]

  @@map("collections")
}

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
  @@map("item_collections")
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  items Item[]

  @@map("tags")
}

// ─── Enums ──────────────────────────────────────────────────────

enum ContentType {
  TEXT
  FILE
  URL
}
```

---

## Item Types

| Type | Icon (Lucide) | Color | Hex | URL |
|---|---|---|---|---|
| Snippet | `Code` | Blue | `#3b82f6` | `/items/snippets` |
| Prompt | `Sparkles` | Purple | `#8b5cf6` | `/items/prompts` |
| Command | `Terminal` | Orange | `#f97316` | `/items/commands` |
| Note | `StickyNote` | Yellow | `#fde047` | `/items/notes` |
| File *(Pro)* | `File` | Gray | `#6b7280` | `/items/files` |
| Image *(Pro)* | `Image` | Pink | `#ec4899` | `/items/images` |
| Link | `Link` | Emerald | `#10b981` | `/items/links` |

---

## UI/UX Guidelines

### Design Principles

- **Dark mode by default**, light mode optional
- Modern, minimal, developer-focused aesthetic
- Clean typography with generous whitespace
- Subtle borders and soft shadows
- References: [Notion](https://notion.so), [Linear](https://linear.app), [Raycast](https://raycast.com)
- Syntax highlighting on all code blocks (use [Shiki](https://shiki.matsu.io) or [highlight.js](https://highlightjs.org))


### Screenshots

Refer to the screenshots below as a base for the dashboard UI. It does not have to be exact. Use it as a reference:

- @context/screenshots/dashboard-ui-main.png
- @context/screenshots/dashboard-ui-drawer.png

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [Logo]  Rongeka                          [Search]  │  ← Top bar
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  ITEM TYPES  │  Collections (grid of color-coded    │
│  ─────────── │  cards based on dominant item type)  │
│  Snippets    │                                      │
│  Prompts     │  ┌──────────┐  ┌──────────┐          │
│  Commands    │  │React     │  │Interview │          │
│  Notes       │  │Patterns  │  │Prep      │          │
│  Files       │  └──────────┘  └──────────┘          │
│  Images      │                                      │
│  Links       │  Items (color-coded border cards)    │
│              │                                      │
│  ─────────── │  ┌──────────────────────────────┐   │
│  COLLECTIONS │  │ useCallback snippet          │   │
│  ─────────── │  │ #react #hooks                │   │
│  React…      │  └──────────────────────────────┘   │
│  Interview…  │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

- **Sidebar:** Item type links + latest collections. Collapsible. Becomes a drawer on mobile.
- **Main:** Color-coded collection cards (background = dominant item type color). Items shown as color-coded border cards.
- **Items:** Open in a quick-access **drawer** (no full page navigation).

### Micro-interactions

- Smooth enter/exit transitions on drawers and modals
- Hover states on all cards
- Toast notifications for create / update / delete / copy actions
- Loading skeletons on initial data fetch

### Responsive

- Desktop-first layout
- Sidebar collapses to a hamburger/drawer on mobile

---

## Monetization

### Free Tier

| Limit | Value |
|---|---|
| Items | 50 total |
| Collections | 3 |
| Item types | All system types except `file` and `image` |
| Search | Basic |
| File/image uploads | ❌ |
| AI features | ❌ |

### Pro Tier — $8/month or $72/year

| Feature | Availability |
|---|---|
| Items | Unlimited |
| Collections | Unlimited |
| File & Image uploads | ✅ |
| Custom types | ✅ *(coming later)* |
| AI auto-tagging | ✅ |
| AI code explanation | ✅ |
| AI prompt optimizer | ✅ |
| Export (JSON / ZIP) | ✅ |
| Priority support | ✅ |

> During development, treat all users as Pro.

---

## Project Structure

```
rongeka/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar + main shell
│   │   ├── page.tsx            # Collections overview
│   │   ├── items/
│   │   │   └── [type]/         # /items/snippets, /items/prompts, etc.
│   │   └── collections/
│   │       └── [id]/
│   └── api/
│       ├── auth/               # NextAuth handler
│       ├── items/              # CRUD + file upload
│       ├── collections/        # CRUD
│       └── ai/                 # Tag suggestions, summaries, explain, optimizer
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── items/
│   │   ├── ItemCard.tsx
│   │   ├── ItemDrawer.tsx      # Create/edit/view drawer
│   │   └── ItemForm.tsx
│   ├── collections/
│   │   ├── CollectionCard.tsx
│   │   └── CollectionForm.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── SearchBar.tsx
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── auth.ts                 # NextAuth config
│   ├── r2.ts                   # Cloudflare R2 helpers
│   ├── openai.ts               # OpenAI client + AI helpers
│   └── stripe.ts               # Stripe helpers
├── prisma/
│   ├── schema.prisma
│   └── migrations/             # All migrations tracked here
├── types/
│   └── index.ts
└── middleware.ts               # Auth + route protection
```

---

## Key Decisions & Notes

1. **Migrations only** — Never use `prisma db push` in any environment. Always generate and commit migration files.

2. **R2 for files** — Cloudflare R2 is S3-compatible and has no egress fees, making it ideal for file/image storage. Use pre-signed URLs for uploads.

3. **Drawer-first UX** — Items should never require a full page navigation. Speed of access is a core value.

4. **Many-to-many collections** — A single item can belong to multiple collections. This is handled via the `ItemCollection` join table, which also tracks `addedAt`.

5. **System vs. custom types** — System types (`isSystem: true`, `userId: null`) are seeded and cannot be deleted. Custom types (Pro, future) are user-owned.

6. **AI gating** — All AI routes should check `user.isPro` (bypass during development). Use OpenAI `gpt-4o-mini` for cost efficiency.

7. **Search** — Start with Postgres full-text search (`to_tsvector` / `to_tsquery`) via a Prisma raw query. Upgrade to a dedicated search layer (e.g., Typesense, Meilisearch) if needed.

8. **Tag model** — Tags are global (`name @unique`) and shared across users via the implicit many-to-many relation with `Item`. Consider making tags user-scoped if tag pollution becomes an issue.

9. **Export** — JSON export is a simple API route. ZIP export (for file types) requires streaming from R2 into a zip archive (use `archiver` or a similar Node.js package).

10. **Stripe webhooks** — Listen for `customer.subscription.updated` and `customer.subscription.deleted` to sync `isPro` on the user record.
