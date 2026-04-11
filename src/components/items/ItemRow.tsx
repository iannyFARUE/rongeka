"use client";

import { useState } from "react";
import { Pin, Star, Copy, Check } from "lucide-react";
import type { ItemWithMeta } from "@/lib/db/items";
import { ICON_MAP } from "@/lib/item-icons";
import { formatRelativeDate } from "@/lib/format";

export default function ItemRow({
  item,
  onClick,
}: {
  item: ItemWithMeta;
  onClick?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = ICON_MAP[item.itemType.icon];
  const { color } = item.itemType;

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const text = item.content ?? item.url ?? item.title;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className="group relative flex flex-col gap-2 rounded-xl border border-white/6 bg-[#111113] px-4 py-3.5 hover:bg-[#141416] hover:border-white/10 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Colored left bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-70"
        style={{ backgroundColor: color }}
      />

      {/* Top row */}
      <div className="flex items-center gap-2.5 min-w-0 pl-1">
        {Icon && (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color }} />
          </div>
        )}
        <p className="text-sm font-semibold text-white/85 truncate flex-1 leading-snug">
          {item.title}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.isPinned && <Pin className="h-3 w-3 text-white/25" />}
          {item.isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
          <span className="text-[11px] text-white/25 tabular-nums">
            {item.lastUsedAt ? formatRelativeDate(item.lastUsedAt) : "Today"}
          </span>
        </div>
      </div>

      {/* Description + tag badges */}
      {(item.description || item.tags.length > 0) && (
        <div className="min-w-0 pl-10">
          {item.description && (
            <p className="text-xs text-white/35 line-clamp-1 mb-1.5">
              {item.description}
            </p>
          )}
          {item.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded-md border"
                  style={{
                    color: color + "99",
                    borderColor: color + "25",
                    backgroundColor: color + "0d",
                  }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/60"
        aria-label="Copy"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
