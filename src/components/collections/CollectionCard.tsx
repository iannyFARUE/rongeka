import Link from "next/link";
import { Star, FolderOpen } from "lucide-react";
import type { CollectionWithMeta } from "@/lib/db/collections";
import CollectionActionsDropdown from "./CollectionActionsDropdown";
import { ICON_MAP } from "@/lib/item-icons";
import { pluralise } from "@/lib/format";

export default function CollectionCard({
  collection,
}: {
  collection: CollectionWithMeta;
}) {
  const { dominantColor } = collection;

  return (
    <div className="group relative flex flex-col rounded-xl border border-white/6 bg-[#111113] overflow-hidden hover:border-white/10 transition-all">
      {/* Top color accent bar */}
      <div className="h-[3px] w-full shrink-0" style={{ backgroundColor: dominantColor }} />

      {/* Clickable body */}
      <Link
        href={`/dashboard/collections/${collection.id}`}
        className="flex flex-col flex-1 p-4 hover:bg-white/[0.02] transition-colors"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${dominantColor}18` }}
          >
            <FolderOpen className="h-4 w-4" style={{ color: dominantColor }} />
          </div>
          {collection.isFavorite && (
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0 mt-1" />
          )}
        </div>

        <h3 className="font-semibold text-sm text-white/85 leading-snug mb-1">
          {collection.name}
        </h3>

        {collection.description && (
          <p className="text-xs text-white/35 line-clamp-1 mb-3">
            {collection.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            {collection.types.slice(0, 5).map((type) => {
              const Icon = ICON_MAP[type.icon];
              if (!Icon) return null;
              return (
                <div
                  key={type.id}
                  className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${type.color}18` }}
                  title={type.name}
                >
                  <Icon className="h-3 w-3" style={{ color: type.color }} />
                </div>
              );
            })}
          </div>
          <span className="text-[11px] text-white/30 tabular-nums font-medium">
            {pluralise(collection.itemCount, "item")}
          </span>
        </div>
      </Link>

      {/* 3-dot menu */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
