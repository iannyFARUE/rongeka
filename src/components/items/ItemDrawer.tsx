"use client"

import { useEffect, useState } from "react"
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  FolderOpen,
  type LucideIcon,
} from "lucide-react"
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ItemDetail } from "@/lib/db/items"

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  const weeks = Math.floor(days / 7)
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
}

interface ItemDrawerProps {
  itemId: string | null
  open: boolean
  onClose: () => void
}


export default function ItemDrawer({ itemId, open, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!itemId || !open) {
      setItem(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setItem(null)
    setError(false)

    fetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setItem(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
          setError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [itemId, open])

  function handleCopy() {
    if (!item) return
    const text = item.content ?? item.url ?? ""
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const Icon = item ? ICON_MAP[item.itemType.icon] : null
  const color = item?.itemType.color ?? "#6b7280"

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent showCloseButton={false}>
        {/* 1. Header: icon + title + tags */}
        <SheetHeader className="border-b-0 px-5 pt-5 pb-0 pr-12 shrink-0">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-muted shrink-0" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-muted" />
                <div className="h-5 w-12 rounded-full bg-muted" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {Icon && (
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-md shrink-0"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                )}
                <SheetTitle className="text-base font-semibold leading-snug">
                  {item?.title ?? ""}
                </SheetTitle>
              </div>
              {item && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </SheetHeader>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Close"
        >
          ✕
        </button>

        {/* 2. Action bar */}
        <div className="flex items-center gap-1 px-4 py-3 mt-3 shrink-0">
          <button
            className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-xs"
            title="Favorite"
            disabled={!item}
          >
            <Star
              className="h-3.5 w-3.5"
              style={item?.isFavorite ? { fill: "#fde047", color: "#fde047" } : {}}
            />
            Favorite
          </button>
          <button
            className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-xs"
            title="Pin"
            disabled={!item}
          >
            <Pin
              className="h-3.5 w-3.5"
              style={item?.isPinned ? { color } : {}}
            />
            Pin
          </button>
          <button
            className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-xs"
            title="Copy"
            disabled={!item}
            onClick={handleCopy}
          >
            <Copy
              className="h-3.5 w-3.5"
              style={copied ? { color: "#10b981" } : {}}
            />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-xs"
            title="Edit"
            disabled={!item}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <div className="flex-1" />
          <button
            className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors text-xs"
            title="Delete"
            disabled={!item}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>

        {/* 3. Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="animate-pulse px-5 py-4 space-y-3">
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="mt-6 space-y-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-4/5 rounded bg-muted" />
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Failed to load item. Please try again.
            </div>
          )}

          {!loading && !error && item && (
            <>
              {/* Meta */}
              <div className="px-5 py-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium capitalize" style={{ color }}>
                    {item.itemType.name}
                  </span>
                  {item.language && (
                    <span className="px-2 py-0.5 rounded-full bg-muted font-mono">
                      {item.language}
                    </span>
                  )}
                </div>

                {item.itemCollections.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.itemCollections.map(({ collection }) => collection.name).join(", ")}</span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {item.lastUsedAt
                    ? `Last used ${timeAgo(item.lastUsedAt)}`
                    : `Created ${timeAgo(item.createdAt)}`}
                </p>
              </div>

              {/* Single divider */}
              <div className="border-t border-border mx-5" />

              {/* Description */}
              {item.description && (
                <div className="px-5 py-5 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Content */}
              {item.content && (
                <div className="px-5 py-5 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Content</p>
                  <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed bg-muted/50 rounded-md p-4 overflow-x-auto">
                    {item.content}
                  </pre>
                </div>
              )}

              {item.url && (
                <div className="px-5 py-5">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline break-all"
                  >
                    {item.url}
                  </a>
                </div>
              )}

              {item.fileUrl && (
                <div className="px-5 py-5 text-sm text-muted-foreground">
                  <p>{item.fileName}</p>
                  {item.fileSize && (
                    <p className="text-xs mt-1">{(item.fileSize / 1024).toFixed(1)} KB</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
