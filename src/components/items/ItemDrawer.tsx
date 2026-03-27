"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { updateItem, deleteItem } from "@/actions/items"
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

// Item types that have a content field
const CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"])
// Item types that have a language field
const LANGUAGE_TYPES = new Set(["snippet", "command"])

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

interface EditState {
  title: string
  description: string
  content: string
  url: string
  language: string
  tags: string
}

function itemToEditState(item: ItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    url: item.url ?? "",
    language: item.language ?? "",
    tags: item.tags.map((t) => t.name).join(", "),
  }
}

export default function ItemDrawer({ itemId, open, onClose }: ItemDrawerProps) {
  const router = useRouter()
  const [item, setItem] = useState<ItemDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!itemId || !open) {
      setItem(null)
      setIsEditing(false)
      setEditState(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setItem(null)
    setError(false)
    setIsEditing(false)
    setEditState(null)

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

  function handleEditStart() {
    if (!item) return
    setEditState(itemToEditState(item))
    setIsEditing(true)
  }

  function handleEditCancel() {
    setIsEditing(false)
    setEditState(null)
  }

  async function handleEditSave() {
    if (!item || !editState) return
    setSaving(true)

    const tags = editState.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const result = await updateItem(item.id, {
      title: editState.title,
      description: editState.description,
      content: editState.content,
      url: editState.url,
      language: editState.language,
      tags,
    })

    setSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setItem(result.data)
    setIsEditing(false)
    setEditState(null)
    toast.success("Item saved")
    router.refresh()
  }

  async function handleDelete() {
    if (!item) return
    setDeleting(true)
    const result = await deleteItem(item.id)
    setDeleting(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setDeleteDialogOpen(false)
    toast.success("Item deleted")
    router.refresh()
    onClose()
  }

  function setField(field: keyof EditState, value: string) {
    setEditState((prev) => prev ? { ...prev, [field]: value } : prev)
  }

  const Icon = item ? ICON_MAP[item.itemType.icon] : null
  const color = item?.itemType.color ?? "#6b7280"
  const typeName = item?.itemType.name ?? ""

  return (
    <>
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
          ) : isEditing && editState ? (
            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-md shrink-0"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
              )}
              <input
                className="flex-1 bg-transparent border-b border-border text-base font-semibold leading-snug focus:outline-none focus:border-foreground transition-colors"
                value={editState.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Title"
                autoFocus
              />
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
          {isEditing ? (
            <>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium disabled:opacity-50"
                onClick={handleEditSave}
                disabled={saving || !editState?.title.trim()}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-xs"
                onClick={handleEditCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
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
                onClick={handleEditStart}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <div className="flex-1" />
              <button
                className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors text-xs"
                title="Delete"
                disabled={!item}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </>
          )}
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

          {!loading && !error && item && !isEditing && (
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

          {/* Edit form body */}
          {!loading && !error && item && isEditing && editState && (
            <div className="px-5 py-4 space-y-5">
              {/* Type (read-only) */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</p>
                <p className="text-sm font-medium capitalize" style={{ color }}>{typeName}</p>
              </div>

              <div className="border-t border-border" />

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  className="w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
                  rows={2}
                  value={editState.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Optional description"
                />
              </div>

              {/* Content (text types only) */}
              {CONTENT_TYPES.has(typeName) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Content
                  </label>
                  <textarea
                    className="w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-foreground transition-colors resize-none"
                    rows={8}
                    value={editState.content}
                    onChange={(e) => setField("content", e.target.value)}
                    placeholder="Content"
                  />
                </div>
              )}

              {/* Language (snippet/command only) */}
              {LANGUAGE_TYPES.has(typeName) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Language
                  </label>
                  <input
                    className="w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                    value={editState.language}
                    onChange={(e) => setField("language", e.target.value)}
                    placeholder="e.g. typescript"
                  />
                </div>
              )}

              {/* URL (link type only) */}
              {typeName === "link" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    URL
                  </label>
                  <input
                    className="w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                    value={editState.url}
                    onChange={(e) => setField("url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tags
                </label>
                <input
                  className="w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                  value={editState.tags}
                  onChange={(e) => setField("tags", e.target.value)}
                  placeholder="react, hooks, typescript"
                />
                <p className="text-xs text-muted-foreground">Comma-separated</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete item?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>&ldquo;{item?.title}&rdquo;</strong> will be permanently deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
