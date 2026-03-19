"use client";

import Link from "next/link";
import { ChevronRight, Star, type LucideIcon } from "lucide-react";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
} from "lucide-react";
import type { CollectionWithMeta } from "@/lib/db/collections";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

export default function CollectionCard({
  collection,
}: {
  collection: CollectionWithMeta;
}) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-4 hover:bg-accent/20 transition-colors overflow-hidden"
      style={{ borderLeftColor: collection.dominantColor, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-sm leading-snug">{collection.name}</h3>
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          {collection.isFavorite && (
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          )}
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>

      {collection.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
          {collection.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex items-center gap-1">
          {collection.types.slice(0, 4).map((type) => {
            const Icon = ICON_MAP[type.icon];
            if (!Icon) return null;
            return (
              <div
                key={type.id}
                className="flex h-5 w-5 items-center justify-center rounded"
                style={{ backgroundColor: `${type.color}25` }}
                title={type.name}
              >
                <Icon className="h-3 w-3" style={{ color: type.color }} />
              </div>
            );
          })}
        </div>
        <span className="text-xs text-muted-foreground">
          {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
        </span>
      </div>
    </Link>
  );
}
