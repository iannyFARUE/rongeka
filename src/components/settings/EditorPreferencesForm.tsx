"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateEditorPreferences } from "@/actions/editor-preferences"
import { EditorPreferences } from "@/types/editor"
import { useEditorPreferencesContext } from "@/context/EditorPreferencesContext"

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 18, 20, 24]
const TAB_SIZES = [2, 4, 8]
const THEMES = [
  { value: "vs-dark", label: "VS Dark" },
  { value: "monokai", label: "Monokai" },
  { value: "github-dark", label: "GitHub Dark" },
] as const

export function EditorPreferencesForm({ initial }: { initial: EditorPreferences }) {
  const [, startTransition] = useTransition()
  const { preferences, setPreferences } = useEditorPreferencesContext()

  function save(patch: Partial<EditorPreferences>) {
    const next = { ...preferences, ...patch }
    setPreferences(next)
    startTransition(async () => {
      const result = await updateEditorPreferences(next)
      if (result.success) {
        toast.success("Editor preferences saved")
      } else {
        setPreferences(preferences)
        toast.error(result.error ?? "Failed to save preferences")
      }
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card divide-y divide-border">
      {/* Font Size */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <Label className="text-sm font-medium">Font Size</Label>
          <p className="text-xs text-muted-foreground">Editor font size in pixels</p>
        </div>
        <Select
          defaultValue={String(initial.fontSize)}
          onValueChange={(v) => save({ fontSize: Number(v) })}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>{s}px</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tab Size */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <Label className="text-sm font-medium">Tab Size</Label>
          <p className="text-xs text-muted-foreground">Number of spaces per indent level</p>
        </div>
        <Select
          defaultValue={String(initial.tabSize)}
          onValueChange={(v) => save({ tabSize: Number(v) })}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAB_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>{s} spaces</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Theme */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <Label className="text-sm font-medium">Theme</Label>
          <p className="text-xs text-muted-foreground">Color theme for the code editor</p>
        </div>
        <Select
          defaultValue={initial.theme}
          onValueChange={(v) => save({ theme: v as EditorPreferences["theme"] })}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEMES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Word Wrap */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <Label className="text-sm font-medium">Word Wrap</Label>
          <p className="text-xs text-muted-foreground">Wrap long lines in the editor</p>
        </div>
        <Switch
          defaultChecked={initial.wordWrap}
          onCheckedChange={(v) => save({ wordWrap: v })}
        />
      </div>

      {/* Minimap */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <Label className="text-sm font-medium">Minimap</Label>
          <p className="text-xs text-muted-foreground">Show the code minimap on the right</p>
        </div>
        <Switch
          defaultChecked={initial.minimap}
          onCheckedChange={(v) => save({ minimap: v })}
        />
      </div>
    </div>
  )
}
