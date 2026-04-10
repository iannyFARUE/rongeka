import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
  type LucideIcon,
} from "lucide-react"

/**
 * Maps Lucide icon names (stored on ItemType.icon) to their component.
 * Used by any component that renders an item type icon.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
}

/**
 * Maps item type slugs (e.g. "snippet") to their icon component directly.
 * Used on pages that need to look up icons by type name rather than icon name.
 */
export const TYPE_ICONS: Record<string, LucideIcon> = {
  snippet: Code,
  prompt: Sparkles,
  command: Terminal,
  note: StickyNote,
  file: File,
  image: Image,
  link: Link,
}
