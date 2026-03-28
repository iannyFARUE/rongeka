"use client"

import { useRef, useState, useCallback } from "react"
import { Upload, X, FileIcon, ImageIcon } from "lucide-react"
import { formatBytes } from "@/lib/format"

export interface UploadedFile {
  key: string
  fileName: string
  fileSize: number
  mimeType: string
  isImage: boolean
}

interface FileUploadProps {
  itemType: "file" | "image"
  onUpload: (result: UploadedFile) => void
  onClear: () => void
  uploaded: UploadedFile | null
}

const IMAGE_EXTENSIONS = ".png,.jpg,.jpeg,.gif,.webp,.svg"
const FILE_EXTENSIONS = ".pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini"
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_FILE_SIZE = 10 * 1024 * 1024


export default function FileUpload({ itemType, onUpload, onClear, uploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const maxSize = itemType === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE
  const accept = itemType === "image" ? IMAGE_EXTENSIONS : FILE_EXTENSIONS
  const limitLabel = itemType === "image" ? "5 MB" : "10 MB"

  const uploadFile = useCallback((file: File) => {
    setError(null)

    if (file.size > maxSize) {
      setError(`File exceeds ${limitLabel} limit`)
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/upload")

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener("load", () => {
      setProgress(null)
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText) as UploadedFile
        onUpload(result)
      } else {
        try {
          const { error: msg } = JSON.parse(xhr.responseText)
          setError(msg ?? "Upload failed")
        } catch {
          setError("Upload failed")
        }
      }
    })

    xhr.addEventListener("error", () => {
      setProgress(null)
      setError("Upload failed")
    })

    setProgress(0)
    xhr.send(formData)
  }, [maxSize, limitLabel, onUpload])

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    // Reset input so same file can be re-selected if cleared
    e.target.value = ""
  }

  if (uploaded) {
    return (
      <div className="rounded-md border border-border bg-muted/30 overflow-hidden">
        {uploaded.isImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/download?key=${encodeURIComponent(uploaded.key)}`}
            alt={uploaded.fileName}
            className="w-full max-h-64 object-contain bg-black/20"
          />
        )}
        <div className="flex items-center gap-3 px-3 py-2.5">
          {uploaded.isImage ? (
            <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{uploaded.fileName}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(uploaded.fileSize)}</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-sm transition-colors cursor-pointer ${
          dragging
            ? "border-primary bg-primary/5 text-foreground"
            : "border-border bg-muted/20 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
        }`}
      >
        <Upload className="h-6 w-6" />
        <span>
          {itemType === "image" ? "Drop an image or click to browse" : "Drop a file or click to browse"}
        </span>
        <span className="text-xs">
          {itemType === "image"
            ? `PNG, JPG, GIF, WebP, SVG — up to ${limitLabel}`
            : `PDF, TXT, MD, JSON, YAML, XML, CSV, TOML, INI — up to ${limitLabel}`}
        </span>

        {progress !== null && (
          <div className="absolute inset-x-4 bottom-3">
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-center mt-1">{progress}%</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
