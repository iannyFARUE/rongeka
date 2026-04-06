"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Sparkles, Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createItem, cancelUpload } from "@/actions/items"
import { generateAutoTags } from "@/actions/ai"
import { getCollectionsForPicker } from "@/actions/collections"
import MarkdownEditor from "@/components/items/MarkdownEditor"
import FileUpload, { type UploadedFile } from "@/components/items/FileUpload"
import CollectionPicker from "@/components/items/CollectionPicker"

const ITEM_TYPES = [
  { name: "snippet", label: "Snippet" },
  { name: "prompt", label: "Prompt" },
  { name: "command", label: "Command" },
  { name: "note", label: "Note" },
  { name: "link", label: "Link" },
  { name: "file", label: "File" },
  { name: "image", label: "Image" },
] as const

type ItemTypeName = typeof ITEM_TYPES[number]["name"]

const CONTENT_TYPES = new Set<ItemTypeName>(["snippet", "prompt", "command", "note"])
const LANGUAGE_TYPES = new Set<ItemTypeName>(["snippet", "command"])
const MARKDOWN_TYPES = new Set<ItemTypeName>(["note", "prompt"])
const FILE_TYPES = new Set<ItemTypeName>(["file", "image"])

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
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [saving, setSaving] = useState(false)
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([])
  const [collectionIds, setCollectionIds] = useState<string[]>([])
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [suggestingTags, setSuggestingTags] = useState(false)

  useEffect(() => {
    if (open) {
      setTypeName(defaultType)
      getCollectionsForPicker().then(setCollections)
    }
  }, [open, defaultType])

  function reset() {
    setTypeName(defaultType)
    setTitle("")
    setDescription("")
    setContent("")
    setUrl("")
    setLanguage("")
    setTags("")
    setUploadedFile(null)
    setCollectionIds([])
    setSuggestedTags([])
  }

  function handleClose() {
    if (uploadedFile) {
      // File was uploaded to R2 but item was never saved — clean up asynchronously
      cancelUpload(uploadedFile.key).catch(() => {})
    }
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
      collectionIds,
      fileKey: uploadedFile?.key ?? null,
      fileName: uploadedFile?.fileName ?? null,
      fileSize: uploadedFile?.fileSize ?? null,
    })

    setSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    // Clear before handleClose so the cancel-cleanup guard doesn't fire
    setUploadedFile(null)
    toast.success("Item created")
    router.refresh()
    handleClose()
  }

  async function handleSuggestTags() {
    if (!title.trim()) {
      toast.error("Add a title before suggesting tags.")
      return
    }
    setSuggestingTags(true)
    const result = await generateAutoTags({ title, content: content || undefined })
    setSuggestingTags(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setSuggestedTags(result.tags)
  }

  function acceptTag(tag: string) {
    const existing = tags.split(",").map((t) => t.trim()).filter(Boolean)
    if (!existing.includes(tag)) {
      setTags(existing.length > 0 ? `${tags.trimEnd().replace(/,\s*$/, "")}, ${tag}` : tag)
    }
    setSuggestedTags((prev) => prev.filter((t) => t !== tag))
  }

  function rejectTag(tag: string) {
    setSuggestedTags((prev) => prev.filter((t) => t !== tag))
  }

  const isFileType = FILE_TYPES.has(typeName)
  const isSubmitDisabled =
    saving ||
    !title.trim() ||
    (typeName === "link" && !url.trim()) ||
    (isFileType && !uploadedFile)

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
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Type
            </label>
            <Select value={typeName} onValueChange={(v) => setTypeName(v as ItemTypeName)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEM_TYPES.map((t) => (
                  <SelectItem key={t.name} value={t.name}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* File upload (file/image types) */}
          {isFileType && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                File <span className="text-destructive">*</span>
              </label>
              <FileUpload
                itemType={typeName as "file" | "image"}
                uploaded={uploadedFile}
                onUpload={setUploadedFile}
                onClear={() => setUploadedFile(null)}
              />
            </div>
          )}

          {/* Content (text types) */}
          {CONTENT_TYPES.has(typeName) && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Content
              </label>
              {LANGUAGE_TYPES.has(typeName) ? (
                <textarea
                  className={`${inputClass} font-mono resize-none`}
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Content"
                />
              ) : MARKDOWN_TYPES.has(typeName) ? (
                <MarkdownEditor value={content} onChange={setContent} />
              ) : (
                <textarea
                  className={`${inputClass} font-mono resize-none`}
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Content"
                />
              )}
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tags
              </label>
              {title.trim() && (
                <button
                  type="button"
                  onClick={handleSuggestTags}
                  disabled={suggestingTags}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" />
                  {suggestingTags ? "Suggesting…" : "Suggest Tags"}
                </button>
              )}
            </div>
            <input
              className={inputClass}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, hooks, typescript"
            />
            <p className="text-xs text-muted-foreground">Comma-separated</p>
            {suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {suggestedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted border border-border"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => acceptTag(tag)}
                      className="text-green-500 hover:text-green-400 transition-colors"
                      aria-label={`Accept tag ${tag}`}
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectTag(tag)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={`Reject tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Collections */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Collections
            </label>
            <CollectionPicker
              collections={collections}
              selected={collectionIds}
              onChange={setCollectionIds}
            />
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
            disabled={isSubmitDisabled}
            className="px-4 py-1.5 rounded text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
