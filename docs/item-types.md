# Item Types

Rongeka supports 7 system item types. All are system-owned (`isSystem: true`, `userId: null`) and cannot be edited or deleted by users. Custom types are a planned Pro feature.

---

## The 7 Item Types

### 1. Snippet

| Property | Value |
|---|---|
| **Icon** | `Code` (Lucide) |
| **Color** | Blue — `#3b82f6` |
| **URL** | `/items/snippets` |
| **ContentType** | `TEXT` |
| **Pro** | No |

**Purpose:** Reusable code blocks in any language. The primary type for developers storing patterns, hooks, utilities, and boilerplate.

**Key fields used:**
- `content` — the code body (Markdown/text)
- `language` — syntax highlighting hint (e.g. `typescript`, `dockerfile`)
- `tags` — for discovery (e.g. `react`, `hooks`)

---

### 2. Prompt

| Property | Value |
|---|---|
| **Icon** | `Sparkles` (Lucide) |
| **Color** | Purple — `#8b5cf6` |
| **URL** | `/items/prompts` |
| **ContentType** | `TEXT` |
| **Pro** | No |

**Purpose:** AI prompts, system messages, and workflow instructions for LLMs. No `language` field needed.

**Key fields used:**
- `content` — the prompt text (Markdown supported)
- `tags` — topic/use-case labels (e.g. `ai`, `code-review`)

---

### 3. Command

| Property | Value |
|---|---|
| **Icon** | `Terminal` (Lucide) |
| **Color** | Orange — `#f97316` |
| **URL** | `/items/commands` |
| **ContentType** | `TEXT` |
| **Pro** | No |

**Purpose:** Shell commands, CLI one-liners, and terminal workflows. Short, runnable strings meant to be copied quickly.

**Key fields used:**
- `content` — the shell command string
- `tags` — tool/context labels (e.g. `git`, `docker`)

---

### 4. Note

| Property | Value |
|---|---|
| **Icon** | `StickyNote` (Lucide) |
| **Color** | Yellow — `#fde047` |
| **URL** | `/items/notes` |
| **ContentType** | `TEXT` |
| **Pro** | No |

**Purpose:** Free-form text notes, documentation excerpts, or written reference material. Rendered with a Markdown editor.

**Key fields used:**
- `content` — full Markdown body
- `tags` — topic labels

---

### 5. File *(Pro)*

| Property | Value |
|---|---|
| **Icon** | `File` (Lucide) |
| **Color** | Gray — `#6b7280` |
| **URL** | `/items/files` |
| **ContentType** | `FILE` |
| **Pro** | Yes |

**Purpose:** Uploaded binary or text files stored in Cloudflare R2. Accessed via a pre-signed URL.

**Key fields used:**
- `fileUrl` — Cloudflare R2 URL
- `fileName` — original filename
- `fileSize` — size in bytes

---

### 6. Image *(Pro)*

| Property | Value |
|---|---|
| **Icon** | `Image` (Lucide) |
| **Color** | Pink — `#ec4899` |
| **URL** | `/items/images` |
| **ContentType** | `FILE` |
| **Pro** | Yes |

**Purpose:** Uploaded images (screenshots, diagrams, design references) stored in Cloudflare R2.

**Key fields used:**
- `fileUrl` — Cloudflare R2 URL
- `fileName` — original filename
- `fileSize` — size in bytes

---

### 7. Link

| Property | Value |
|---|---|
| **Icon** | `Link` (Lucide) |
| **Color** | Emerald — `#10b981` |
| **URL** | `/items/links` |
| **ContentType** | `URL` |
| **Pro** | No |

**Purpose:** External URLs — documentation, tools, references, and resources.

**Key fields used:**
- `url` — the full URL
- `description` — optional summary
- `tags` — topic labels (e.g. `docs`, `prisma`)

---

## Content Classification

The `ContentType` enum on `Item` determines which fields are populated:

| ContentType | Active fields | Types that use it |
|---|---|---|
| `TEXT` | `content`, optionally `language` | snippet, prompt, command, note |
| `FILE` | `fileUrl`, `fileName`, `fileSize` | file, image |
| `URL` | `url` | link |

Rules:
- `content` is `null` for FILE and URL items.
- `fileUrl`/`fileName`/`fileSize` are `null` for TEXT and URL items.
- `url` is `null` for TEXT and FILE items.
- `language` is only relevant for TEXT items (mainly snippet/command).

---

## Shared Properties

All item types share these fields regardless of content classification:

| Field | Description |
|---|---|
| `title` | Display name (required) |
| `description` | Short summary (optional) |
| `isFavorite` | Starred by the user |
| `isPinned` | Pinned to top of lists |
| `lastUsedAt` | Timestamp for "recently used" ordering |
| `tags` | Many-to-many global tag relations |
| `itemCollections` | Collection memberships (many-to-many) |
| `createdAt` / `updatedAt` | Audit timestamps |

---

## Display Differences

| Type | Syntax Highlight | Rendered Markdown | Preview Image | Open URL |
|---|---|---|---|---|
| snippet | Yes (`language`) | No | No | No |
| prompt | No | Yes | No | No |
| command | No (plain) | No | No | No |
| note | No | Yes | No | No |
| file | No | No | No | Download |
| image | No | No | Yes | No |
| link | No | No | No | Yes |

---

## Pro Gating

`file` and `image` are restricted to Pro users in production. During development, all users are treated as Pro and can access all types. The `ItemType.isSystem` flag protects all 7 types from user modification.
