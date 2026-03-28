"use client"

import {
  File,
  FileText,
  FileCode,
  FileImage,
  FileArchive,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/format"
import type { ItemWithMeta } from "@/lib/db/items"

interface FileListRowProps {
  item: ItemWithMeta
  onClick: () => void
}

function getFileIcon(fileName: string | null) {
  if (!fileName) return File
  const ext = fileName.split(".").pop()?.toLowerCase()
  if (!ext) return File
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"].includes(ext)) return FileImage
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return FileArchive
  if (["ts", "tsx", "js", "jsx", "py", "go", "rs", "rb", "java", "c", "cpp", "sh"].includes(ext)) return FileCode
  if (["md", "txt", "pdf", "doc", "docx", "csv", "json", "yaml", "yml", "toml", "ini", "xml"].includes(ext)) return FileText
  return File
}

export default function FileListRow({ item, onClick }: FileListRowProps) {
  const Icon = getFileIcon(item.fileName)
  const downloadUrl = item.fileUrl
    ? `/api/download?key=${encodeURIComponent(item.fileUrl)}&download=1`
    : null

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    if (!downloadUrl) return
    const a = document.createElement("a")
    a.href = downloadUrl
    a.download = item.fileName ?? item.title
    a.click()
  }

  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* File icon */}
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />

      {/* Name + description */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{item.fileName ?? item.title}</p>
        {item.title !== item.fileName && item.fileName && (
          <p className="text-xs text-muted-foreground truncate">{item.title}</p>
        )}
      </div>

      {/* Meta: size + date (hidden on mobile to keep row compact) */}
      <div className="hidden sm:flex flex-col items-end shrink-0 text-xs text-muted-foreground gap-0.5">
        {item.fileSize != null && <span>{formatBytes(item.fileSize)}</span>}
        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Download button */}
      {downloadUrl && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDownload}
          aria-label="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </button>
  )
}
