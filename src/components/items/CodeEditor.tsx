"use client"

import { useState, useEffect } from "react"
import MonacoEditor from "@monaco-editor/react"
import { Copy, Check, Sparkles, Loader2, Crown } from "lucide-react"
import { useEditorPreferences } from "@/context/EditorPreferencesContext"

interface CodeEditorProps {
  value: string
  language?: string
  readOnly?: boolean
  onChange?: (value: string) => void
  // Explain feature (read-only drawer view only)
  isPro?: boolean
  onExplain?: () => void
  isExplaining?: boolean
  explanation?: string | null
}

export default function CodeEditor({
  value,
  language = "plaintext",
  readOnly = false,
  onChange,
  isPro,
  onExplain,
  isExplaining = false,
  explanation,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const [editorHeight, setEditorHeight] = useState(120)
  const [activeTab, setActiveTab] = useState<"code" | "explain">("code")
  const prefs = useEditorPreferences()

  // Auto-switch to explain tab when explanation arrives
  useEffect(() => {
    if (explanation) {
      setActiveTab("explain")
    }
  }, [explanation])

  // Reset tab when item changes (explanation cleared)
  useEffect(() => {
    if (!explanation) {
      setActiveTab("code")
    }
  }, [explanation])

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const normalizedLang = language.trim().toLowerCase() || "plaintext"
  const showExplainButton = !!onExplain

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* macOS-style header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-white/[0.06]">
        {/* Window dots + tabs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>

          {/* Code/Explain tabs — only shown after explanation is available */}
          {explanation && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setActiveTab("code")}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  activeTab === "code"
                    ? "bg-white/10 text-white/80"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab("explain")}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  activeTab === "explain"
                    ? "bg-white/10 text-white/80"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Explain
              </button>
            </div>
          )}
        </div>

        {/* Language + explain + copy */}
        <div className="flex items-center gap-3">
          {normalizedLang !== "plaintext" && (
            <span className="text-[11px] text-white/40 font-mono select-none">
              {normalizedLang}
            </span>
          )}

          {showExplainButton && (
            isPro === false ? (
              <span
                title="AI features require Pro subscription"
                className="flex items-center gap-1 text-[11px] text-white/25 cursor-not-allowed select-none"
              >
                <Crown className="h-3.5 w-3.5" />
                Explain
              </span>
            ) : (
              <button
                onClick={onExplain}
                disabled={isExplaining}
                className="flex items-center gap-1 text-[11px] text-violet-400/70 hover:text-violet-300 disabled:opacity-50 transition-colors"
                title="Explain this code with AI"
              >
                {isExplaining ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {isExplaining ? "Explaining…" : "Explain"}
              </button>
            )
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

      {/* Explain panel */}
      {activeTab === "explain" && explanation && (
        <div className="bg-[#1e1e1e] px-4 py-4 text-sm text-white/70 leading-relaxed">
          {explanation}
        </div>
      )}

      {/* Monaco Editor */}
      {activeTab === "code" && (
        <div style={{ height: editorHeight }}>
          <MonacoEditor
            height="100%"
            value={value}
            language={normalizedLang}
            theme={prefs.theme}
            options={{
              readOnly,
              minimap: { enabled: prefs.minimap },
              scrollBeyondLastLine: false,
              fontSize: prefs.fontSize,
              tabSize: prefs.tabSize,
              lineNumbers: readOnly ? "off" : "on",
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: readOnly ? 8 : 16,
              lineNumbersMinChars: readOnly ? 0 : 3,
              renderLineHighlight: readOnly ? "none" : "line",
              wordWrap: prefs.wordWrap ? "on" : "off",
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
      )}
    </div>
  )
}
