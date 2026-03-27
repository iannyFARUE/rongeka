import { Pin, Star, type LucideIcon } from "lucide-react";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
} from "lucide-react";
import type { ItemWithMeta } from "@/lib/db/items";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

function formatDate(date: Date): string {
  const now = new Date();
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return "Today";
  }
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  return "Today";
}

export default function ItemRow({
  item,
  onClick,
}: {
  item: ItemWithMeta;
  onClick?: () => void;
}) {
  const Icon = ICON_MAP[item.itemType.icon];
  const { color } = item.itemType;

  return (
    <div
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 hover:bg-accent/10 transition-colors cursor-pointer overflow-hidden"
      style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
      onClick={onClick}
    >
      {/* Top row: icon + date */}
      <div className="flex items-start justify-between gap-2">
        {Icon && (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: `${color}22` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        )}
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          {item.isPinned && (
            <Pin className="h-3 w-3 text-muted-foreground" />
          )}
          {item.isFavorite && (
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          )}
          <span className="text-xs text-muted-foreground tabular-nums">
            {item.lastUsedAt ? formatDate(item.lastUsedAt) : "Today"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate leading-snug">{item.title}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {item.description}
          </p>
        )}
        {item.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {item.tags.map((tag) => (
              <span key={tag.id} className="text-xs text-muted-foreground">
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
