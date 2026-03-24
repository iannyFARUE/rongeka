# Item CRUD Architecture

Design plan for a unified CRUD system covering all 7 item types (snippet, prompt, command, note, file, image, link).

---

## Guiding Principles

- **One action file** — all item mutations (create, update, delete) in `src/actions/items.ts`
- **One route** — `src/app/(dashboard)/items/[type]/page.tsx` handles all 7 types
- **lib/db for queries** — data fetching in `src/lib/db/items.ts`, called directly from server components
- **Type-specific logic in components** — actions stay generic; components adapt their UI by type
- **Follows existing patterns** — mirrors auth/profile action shape, lib/db query shape, and component conventions already in the codebase

---

## File Structure

```
src/
├── actions/
│   └── items.ts                  # create, update, delete mutations
│
├── lib/
│   └── db/
│       └── items.ts              # getItemsByType, getItemById, getPinnedItems, getRecentItems
│
├── app/
│   └── (dashboard)/
│       └── items/
│           └── [type]/
│               └── page.tsx      # server component — fetches + renders item list
│
└── components/
    └── items/
        ├── ItemRow.tsx           # existing — list row display
        ├── ItemCard.tsx          # grid card display (alternative to row)
        ├── ItemDrawer.tsx        # create/edit/view slide-in drawer (client)
        ├── ItemForm.tsx          # form inside the drawer, adapts by type (client)
        └── ItemTypeIcon.tsx      # renders the correct Lucide icon by name (shared)
```

---

## Routing: `/items/[type]`

### URL → Type mapping

The `[type]` segment is the **plural slug** (e.g. `snippets`, `prompts`). A reverse mapping converts it back to the singular type name used in the database.

```
/items/snippets  →  itemType.name = "snippet"
/items/prompts   →  itemType.name = "prompt"
/items/commands  →  itemType.name = "command"
/items/notes     →  itemType.name = "note"
/items/files     →  itemType.name = "file"
/items/images    →  itemType.name = "image"
/items/links     →  itemType.name = "link"
```

This mapping already exists as `TYPE_SLUGS` in `src/components/layout/Sidebar.tsx` and should be extracted to `src/lib/constants.ts` so both the sidebar and the route page can import it.

### Page behaviour

`src/app/(dashboard)/items/[type]/page.tsx` is a **server component** that:

1. Reads `params.type` (the slug)
2. Reverses it to the type name via the slug map
3. Returns 404 if the slug is unrecognised (`notFound()`)
4. Gets the current user via `auth()`
5. Calls `getItemsByType(userId, typeName)` from `src/lib/db/items.ts`
6. Renders the item list, passing items to client components

```tsx
// src/app/(dashboard)/items/[type]/page.tsx
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType } from "@/lib/db/items";
import { SLUG_TO_TYPE } from "@/lib/constants";
import ItemList from "@/components/items/ItemList";

export default async function ItemTypePage({ params }: { params: { type: string } }) {
  const typeName = SLUG_TO_TYPE[params.type];
  if (!typeName) notFound();

  const session = await auth();
  const items = await getItemsByType(session!.user.id, typeName);

  return <ItemList items={items} typeName={typeName} />;
}
```

---

## Data Fetching: `src/lib/db/items.ts`

All queries are plain async functions that accept `userId` and return typed results. Called directly from server components — no API route needed.

### Functions

| Function | Purpose |
|---|---|
| `getItemsByType(userId, typeName)` | Paginated list for a type page |
| `getItemById(userId, itemId)` | Single item for the drawer view |
| `getPinnedItems(userId)` | Already exists — dashboard pinned section |
| `getRecentItems(userId)` | Already exists — dashboard recent section |

### Shared return type

```typescript
export type ItemWithMeta = {
  id: string;
  title: string;
  description: string | null;
  contentType: "TEXT" | "FILE" | "URL";
  content: string | null;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
  itemType: { id: string; name: string; icon: string; color: string };
  tags: { id: string; name: string }[];
};
```

The existing `ItemWithMeta` in `src/lib/db/items.ts` is narrower (omits content fields). It should be expanded to include `contentType`, `content`, `language`, `fileUrl`, `fileName`, `fileSize`, and `url` so the drawer can display full item details without a second fetch.

---

## Mutations: `src/actions/items.ts`

One file, three actions. All follow the existing `string | null` return convention (null = success, string = error message).

```typescript
"use server";

// create — inserts item + tags, returns new item id on success
export async function createItem(formData: FormData): Promise<{ error: string | null; id?: string }>

// update — updates fields the user changed, reconnects tags
export async function updateItem(itemId: string, formData: FormData): Promise<string | null>

// delete — hard delete, cascades to ItemCollection and tag relations
export async function deleteItem(itemId: string): Promise<string | null>
```

### Input validation

Use **Zod** for all inputs (matches existing auth/profile action patterns):

```typescript
const CreateItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  itemTypeId: z.string().cuid(),
  contentType: z.enum(["TEXT", "FILE", "URL"]),
  content: z.string().optional(),
  language: z.string().optional(),
  url: z.string().url().optional(),
  tags: z.string().optional(), // comma-separated tag names
});
```

### Authorization

Every action must verify `session.user.id === item.userId` before mutating. Never trust the `itemId` alone.

### Tag handling

Tags are global (`name @unique`). On create/update:
1. Split tag string into names
2. `upsert` each tag by name
3. `set` the item's tag relation to the new list (replaces old tags in one operation)

### Type-specific field routing

Actions are generic — they set fields based on `contentType`:

| contentType | Fields written | Fields nulled |
|---|---|---|
| `TEXT` | `content`, `language` | `fileUrl`, `fileName`, `fileSize`, `url` |
| `FILE` | `fileUrl`, `fileName`, `fileSize` | `content`, `language`, `url` |
| `URL` | `url` | `content`, `language`, `fileUrl`, `fileName`, `fileSize` |

---

## Components

### `ItemList` (client)

Wraps the server-fetched items array. Manages drawer open/close state and which item is selected for editing. Renders `ItemRow` for each item and a floating "New Item" button (or relies on TopBar's existing button).

```
ItemList (client)
├── [ItemRow × n] (server-renderable, but needs onClick → make client or wrap)
└── ItemDrawer (conditionally rendered, client)
```

### `ItemRow` (existing, extend)

Currently a display-only server component. Needs two additions:
- `onClick` prop to open the drawer in **view** mode
- Menu actions: "Edit", "Delete", "Copy", "Toggle Favorite", "Toggle Pin"

Keep it as a **client component** (it already has hover/menu state potential).

### `ItemDrawer` (client)

Slide-in drawer (shadcn `Sheet` or a custom drawer). Three modes controlled by a `mode` prop:

| Mode | Triggered by | Content |
|---|---|---|
| `view` | Clicking an `ItemRow` | Read-only item detail |
| `edit` | Edit menu action | `ItemForm` pre-filled |
| `create` | "New Item" button | `ItemForm` empty, type pre-selected |

Drawer renders the correct content renderer or form based on `item.contentType`:
- `TEXT` → syntax-highlighted code block (snippet/command) or Markdown renderer (prompt/note)
- `FILE` → file download link or image preview
- `URL` → clickable link with favicon

### `ItemForm` (client)

Form rendered inside `ItemDrawer` for create and edit. Adapts its fields by `contentType`:

| Field | TEXT | FILE | URL |
|---|---|---|---|
| Title | ✓ | ✓ | ✓ |
| Description | ✓ | ✓ | ✓ |
| Content (textarea/editor) | ✓ | — | — |
| Language selector | snippet, command only | — | — |
| File upload | — | ✓ | — |
| URL input | — | — | ✓ |
| Tags | ✓ | ✓ | ✓ |

Uses `useActionState(createItem / updateItem)` and shows toast on success/error (matches profile form pattern).

### `ItemTypeIcon` (utility)

Centralises the string-to-Lucide-icon mapping that currently lives as `ICON_MAP` in multiple components. Accepts `iconName: string` and `color: string`, returns the icon JSX.

```tsx
// Replaces ad-hoc ICON_MAP objects spread across components
<ItemTypeIcon name="Code" color="#3b82f6" size={16} />
```

---

## Constants: `src/lib/constants.ts`

Extract shared mappings here so they are importable by both routes and components:

```typescript
// Type slug mappings
export const TYPE_TO_SLUG: Record<string, string> = {
  snippet: "snippets",
  prompt: "prompts",
  command: "commands",
  note: "notes",
  file: "files",
  image: "images",
  link: "links",
};

export const SLUG_TO_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(TYPE_TO_SLUG).map(([k, v]) => [v, k])
);

// Display order (matches existing TYPE_ORDER in sidebar/profile)
export const TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

// Pro-gated types
export const PRO_TYPES = new Set(["file", "image"]);
```

Currently `TYPE_SLUGS`/`TYPE_ORDER`/`PRO_TYPES` are defined inline in `Sidebar.tsx`, `sidebar.ts`, and `profile.ts`. Moving them to `constants.ts` eliminates duplication.

---

## Where Type-specific Logic Lives

The rule is: **actions are generic, components are specific**.

| Concern | Lives in |
|---|---|
| Which DB fields to write | `actions/items.ts` — based on `contentType` enum |
| Which form fields to show | `ItemForm.tsx` — checks `contentType` or `typeName` |
| Syntax highlighting | `ItemDrawer.tsx` — only for `TEXT` items with `language` |
| Markdown rendering | `ItemDrawer.tsx` — only for prompt/note types |
| Image preview | `ItemDrawer.tsx` — only for `FILE` + image type |
| File download | `ItemDrawer.tsx` — only for `FILE` + file type |
| URL open behaviour | `ItemDrawer.tsx` — only for `URL` items |
| Color-coded border | `ItemRow.tsx` — `itemType.color` via inline style |
| Icon rendering | `ItemTypeIcon.tsx` — maps `itemType.icon` string |
| Pro badge | `Sidebar.tsx` — `PRO_TYPES` set (already exists) |
| Pro gate (create) | `actions/items.ts` — checks `session.user.isPro` for file/image |

---

## Data Flow Summary

```
User clicks "New Snippet"
        ↓
  TopBar / ItemList
  opens ItemDrawer (mode=create, typeName=snippet)
        ↓
  ItemForm renders TEXT fields + language selector
        ↓
  Submit → createItem() server action
  → Zod validate
  → auth() check
  → prisma.item.create()
  → upsert tags
        ↓
  Return { error: null, id: newItemId }
        ↓
  Drawer shows success toast, closes
  ItemList re-fetches (router.refresh() or revalidatePath)
```

```
User clicks an ItemRow
        ↓
  ItemList sets selectedItem, opens ItemDrawer (mode=view)
        ↓
  ItemDrawer renders read-only view
  (syntax block / markdown / image / link based on contentType)
        ↓
  User clicks Edit
        ↓
  Drawer switches to mode=edit, renders ItemForm pre-filled
        ↓
  Submit → updateItem() server action
  → same validate + auth + prisma.item.update()
        ↓
  Drawer closes, list refreshes
```
