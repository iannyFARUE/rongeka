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
      className="group relative flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent/10 transition-colors cursor-pointer overflow-hidden"
      style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
      onClick={onClick}
    >
      {/* Top row: icon + title + meta */}
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md shrink-0"
            style={{ backgroundColor: `${color}22` }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color }} />
          </div>
        )}
        <p className="text-sm font-semibold truncate flex-1 leading-snug">{item.title}</p>
        <div className="flex items-center gap-1 shrink-0">
          {item.isPinned && <Pin className="h-3 w-3 text-muted-foreground" />}
          {item.isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
          <span className="text-xs text-muted-foreground tabular-nums">
            {item.lastUsedAt ? formatDate(item.lastUsedAt) : "Today"}
          </span>
        </div>
      </div>

      {/* Description + tags */}
      {(item.description || item.tags.length > 0) && (
        <div className="min-w-0 pl-8.5">
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {item.description}
            </p>
          )}
          {item.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {item.tags.map((tag) => (
                <span key={tag.id} className="text-xs text-muted-foreground">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
