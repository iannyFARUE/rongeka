"use client"

import { useState } from "react"
import { Code, Sparkles, Terminal, StickyNote, Link, Plus } from "lucide-react"
import NewItemDialog from "@/components/items/NewItemDialog"

const ACTIONS = [
  {
    type: "snippet" as const,
    label: "Snippet",
    icon: Code,
    color: "#3b82f6",
    bg: "#3b82f615",
    border: "#3b82f630",
    description: "Save reusable code",
  },
  {
    type: "prompt" as const,
    label: "Prompt",
    icon: Sparkles,
    color: "#8b5cf6",
    bg: "#8b5cf615",
    border: "#8b5cf630",
    description: "Store an AI prompt",
  },
  {
    type: "command" as const,
    label: "Command",
    icon: Terminal,
    color: "#f97316",
    bg: "#f9731615",
    border: "#f9731630",
    description: "Remember a CLI command",
  },
  {
    type: "note" as const,
    label: "Note",
    icon: StickyNote,
    color: "#fde047",
    bg: "#fde04715",
    border: "#fde04730",
    description: "Jot something down",
  },
  {
    type: "link" as const,
    label: "Link",
    icon: Link,
    color: "#10b981",
    bg: "#10b98115",
    border: "#10b98130",
    description: "Bookmark a URL",
  },
]

export default function QuickActions() {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<"snippet" | "prompt" | "command" | "note" | "link">("snippet")

  function handleClick(type: typeof selectedType) {
    setSelectedType(type)
    setOpen(true)
  }

  return (
    <>
      <section>
        <p className="text-xs uppercase tracking-widest text-white/25 font-medium mb-3">
          Quick Add
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {ACTIONS.map(({ type, label, icon: Icon, color, bg, border, description }) => (
            <button
              key={type}
              onClick={() => handleClick(type)}
              className="group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
              style={{
                backgroundColor: bg,
                borderColor: border,
              }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-110"
                style={{ backgroundColor: `${color}25` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80 leading-tight">{label}</p>
                <p className="text-xs text-white/35 truncate leading-tight mt-0.5">{description}</p>
              </div>
              <Plus
                className="ml-auto h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                style={{ color }}
              />
            </button>
          ))}
        </div>
      </section>

      <NewItemDialog
        open={open}
        onClose={() => setOpen(false)}
        defaultType={selectedType}
      />
    </>
  )
}
