"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Copy, Check } from "lucide-react"

interface MarkdownEditorProps {
  value: string
  readOnly?: boolean
  onChange?: (value: string) => void
}

export default function MarkdownEditor({
  value,
  readOnly = false,
  onChange,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">(readOnly ? "preview" : "write")
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-white/[0.06]">
        {/* Window dots (readonly) or Write/Preview tabs (edit mode) */}
        {readOnly ? (
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
        ) : (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`px-3 py-0.5 rounded text-[11px] font-medium transition-colors ${
                tab === "write"
                  ? "bg-white/10 text-white/80"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`px-3 py-0.5 rounded text-[11px] font-medium transition-colors ${
                tab === "preview"
                  ? "bg-white/10 text-white/80"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Preview
            </button>
          </div>
        )}

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
          title="Copy"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Body */}
      {(tab === "write" && !readOnly) ? (
        <textarea
          className="w-full bg-[#1e1e1e] text-[#d4d4d4] text-sm font-mono px-4 py-3 focus:outline-none resize-none min-h-[120px] max-h-[400px] overflow-y-auto"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Write markdown here…"
          style={{ scrollbarWidth: "thin" }}
        />
      ) : (
        <div className="bg-[#1e1e1e] px-4 py-3 overflow-y-auto max-h-[400px]" style={{ scrollbarWidth: "thin" }}>
          {value.trim() ? (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-white/30 italic">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  )
}
