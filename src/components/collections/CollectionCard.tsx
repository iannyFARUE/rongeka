import Link from "next/link";
import {
  Star,
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";
import type { CollectionWithMeta } from "@/lib/db/collections";
import CollectionActionsDropdown from "./CollectionActionsDropdown";

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
    <div
      className="group relative flex flex-col rounded-lg border border-border bg-card overflow-hidden"
      style={{ borderLeftColor: collection.dominantColor, borderLeftWidth: 3 }}
    >
      {/* Clickable area → collection page */}
      <Link
        href={`/dashboard/collections/${collection.id}`}
        className="flex flex-col flex-1 p-4 hover:bg-accent/20 transition-colors"
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm leading-snug">{collection.name}</h3>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            {collection.isFavorite && (
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            )}
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

      {/* 3-dot menu — sits outside the link */}
      <div className="absolute top-2 right-2">
        <CollectionActionsDropdown
          collectionId={collection.id}
          collectionName={collection.name}
          collectionDescription={collection.description}
          isFavorite={collection.isFavorite}
        />
      </div>
    </div>
  );
}
