"use client"

import { useState } from "react"
import { TYPE_ICONS } from "@/lib/item-icons"
import NewItemDialog from "@/components/items/NewItemDialog"

const TYPE_COPY: Record<string, { heading: string; body: string; cta: string }> = {
  snippet: {
    heading: "No snippets yet",
    body: "Save code you reuse across projects — functions, configs, boilerplate.",
    cta: "Add your first snippet",
  },
  prompt: {
    heading: "No prompts yet",
    body: "Store your best AI prompts and system messages so you never lose them.",
    cta: "Add your first prompt",
  },
  command: {
    heading: "No commands yet",
    body: "Stop googling the same CLI commands. Save them here once, find them instantly.",
    cta: "Add your first command",
  },
  note: {
    heading: "No notes yet",
    body: "Jot down ideas, explanations, or anything you want to remember later.",
    cta: "Add your first note",
  },
  link: {
    heading: "No links yet",
    body: "Bookmark docs, tools, and references you actually use — not browser tab chaos.",
    cta: "Add your first link",
  },
  file: {
    heading: "No files yet",
    body: "Upload config files, templates, or any file you want to keep close at hand.",
    cta: "Add your first file",
  },
  image: {
    heading: "No images yet",
    body: "Store screenshots, diagrams, and reference images alongside your other resources.",
    cta: "Add your first image",
  },
}

const FILE_TYPES = new Set(["file", "image"])

interface TypeEmptyStateProps {
  typeName: string
  typeColor: string
}

export default function TypeEmptyState({ typeName, typeColor }: TypeEmptyStateProps) {
  const [open, setOpen] = useState(false)
  const copy = TYPE_COPY[typeName] ?? {
    heading: `No ${typeName}s yet`,
    body: "Nothing here yet. Add your first one to get started.",
    cta: `Add your first ${typeName}`,
  }
  const Icon = TYPE_ICONS[typeName] ?? TYPE_ICONS.snippet
  const isFileType = FILE_TYPES.has(typeName)

  return (
    <>
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        {/* Icon halo */}
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${typeColor}15`, boxShadow: `0 0 0 1px ${typeColor}20` }}
        >
          <Icon className="h-7 w-7" style={{ color: typeColor }} />
        </div>

        <h2 className="text-lg font-semibold text-white/80 mb-2">{copy.heading}</h2>
        <p className="text-sm text-white/35 max-w-sm leading-relaxed mb-7">{copy.body}</p>

        {!isFileType && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: `${typeColor}20`,
              color: typeColor,
              border: `1px solid ${typeColor}30`,
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            {copy.cta}
          </button>
        )}
      </div>

      {!isFileType && (
        <NewItemDialog
          open={open}
          onClose={() => setOpen(false)}
          defaultType={typeName as "snippet" | "prompt" | "command" | "note" | "link"}
        />
      )}
    </>
  )
}
