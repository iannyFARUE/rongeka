import { Pin, Star, MoreHorizontal, type LucideIcon } from "lucide-react";
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

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
}

export default function ItemRow({ item }: { item: ItemWithMeta }) {
  const Icon = ICON_MAP[item.itemType.icon];
  const { color } = item.itemType;

  return (
    <div
      className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent/20 transition-colors"
      style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
    >
      {/* Type icon */}
      {Icon && (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md shrink-0"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-medium truncate">{item.title}</span>
          {item.isPinned && (
            <Pin className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
          {item.isFavorite && (
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate mb-1">
            {item.description}
          </p>
        )}
        {item.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {item.tags.map((tag) => (
              <span key={tag.id} className="text-xs text-muted-foreground">
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        {item.lastUsedAt && (
          <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
            {timeAgo(item.lastUsedAt)}
          </span>
        )}
        <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-accent text-muted-foreground transition-all">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
