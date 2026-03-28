import type { ItemWithMeta } from "@/lib/db/items"

interface ImageThumbnailCardProps {
  item: ItemWithMeta
  onClick: () => void
}

export default function ImageThumbnailCard({ item, onClick }: ImageThumbnailCardProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-lg overflow-hidden border border-border bg-card text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="aspect-video overflow-hidden bg-muted">
        {item.fileUrl ? (
          <img
            src={`/api/download?key=${encodeURIComponent(item.fileUrl)}`}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
            No preview
          </div>
        )}
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium truncate">{item.title}</p>
        {item.fileName && (
          <p className="text-xs text-muted-foreground truncate">{item.fileName}</p>
        )}
      </div>
    </button>
  )
}
