"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { createItem } from "@/actions/items"

const ITEM_TYPES = [
  { name: "snippet", label: "Snippet" },
  { name: "prompt", label: "Prompt" },
  { name: "command", label: "Command" },
  { name: "note", label: "Note" },
  { name: "link", label: "Link" },
] as const

type ItemTypeName = typeof ITEM_TYPES[number]["name"]

const CONTENT_TYPES = new Set<ItemTypeName>(["snippet", "prompt", "command", "note"])
const LANGUAGE_TYPES = new Set<ItemTypeName>(["snippet", "command"])

interface NewItemDialogProps {
  open: boolean
  onClose: () => void
  defaultType?: ItemTypeName
}

export default function NewItemDialog({ open, onClose, defaultType = "snippet" }: NewItemDialogProps) {
  const router = useRouter()
  const [typeName, setTypeName] = useState<ItemTypeName>(defaultType)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [url, setUrl] = useState("")
  const [language, setLanguage] = useState("")
  const [tags, setTags] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setTypeName(defaultType)
  }, [open, defaultType])

  function reset() {
    setTypeName(defaultType)
    setTitle("")
    setDescription("")
    setContent("")
    setUrl("")
    setLanguage("")
    setTags("")
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit() {
    setSaving(true)
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean)

    const result = await createItem({
      typeName,
      title,
      description,
      content,
      url,
      language,
      tags: tagList,
    })

    setSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success("Item created")
    router.refresh()
    handleClose()
  }

  const inputClass =
    "w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type selector */}
          <div className="flex gap-1.5 flex-wrap">
            {ITEM_TYPES.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setTypeName(t.name)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  typeName === t.name
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Item title"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          {/* Content (text types) */}
          {CONTENT_TYPES.has(typeName) && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Content
              </label>
              <textarea
                className={`${inputClass} font-mono resize-none`}
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
              />
            </div>
          )}

          {/* Language (snippet/command) */}
          {LANGUAGE_TYPES.has(typeName) && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Language
              </label>
              <input
                className={inputClass}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. typescript"
              />
            </div>
          )}

          {/* URL (link) */}
          {typeName === "link" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                URL <span className="text-destructive">*</span>
              </label>
              <input
                className={inputClass}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
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
              className={inputClass}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, hooks, typescript"
            />
            <p className="text-xs text-muted-foreground">Comma-separated</p>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !title.trim() || (typeName === "link" && !url.trim())}
            className="px-4 py-1.5 rounded text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
