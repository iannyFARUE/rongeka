"use client"

import { useState } from "react"
import MonacoEditor from "@monaco-editor/react"
import { Copy, Check } from "lucide-react"

interface CodeEditorProps {
  value: string
  language?: string
  readOnly?: boolean
  onChange?: (value: string) => void
}

export default function CodeEditor({
  value,
  language = "plaintext",
  readOnly = false,
  onChange,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const [editorHeight, setEditorHeight] = useState(120)

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const normalizedLang = language.trim().toLowerCase() || "plaintext"

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* macOS-style header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-white/[0.06]">
        {/* Window dots */}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Language + copy */}
        <div className="flex items-center gap-3">
          {normalizedLang !== "plaintext" && (
            <span className="text-[11px] text-white/40 font-mono select-none">
              {normalizedLang}
            </span>
          )}
          <button
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
      </div>

      {/* Monaco Editor */}
      <div style={{ height: editorHeight }}>
        <MonacoEditor
          height="100%"
          value={value}
          language={normalizedLang}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: readOnly ? "off" : "on",
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: readOnly ? 8 : 16,
            lineNumbersMinChars: readOnly ? 0 : 3,
            renderLineHighlight: readOnly ? "none" : "line",
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
            scrollbar: {
              vertical: "auto",
              horizontal: "hidden",
              verticalScrollbarSize: 6,
              useShadows: false,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
          }}
          onChange={(val) => onChange?.(val ?? "")}
          onMount={(editor) => {
            function updateHeight() {
              setEditorHeight(Math.min(400, editor.getContentHeight()))
              editor.layout()
            }
            editor.onDidContentSizeChange(updateHeight)
            updateHeight()
          }}
        />
      </div>
    </div>
  )
}
