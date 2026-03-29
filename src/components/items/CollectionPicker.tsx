"use client"

import { FolderOpen } from "lucide-react"

interface Collection {
  id: string
  name: string
}

interface CollectionPickerProps {
  collections: Collection[]
  selected: string[]
  onChange: (ids: string[]) => void
}

export default function CollectionPicker({ collections, selected, onChange }: CollectionPickerProps) {
  if (collections.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">No collections yet.</p>
    )
  }

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {collections.map((col) => {
        const isSelected = selected.includes(col.id)
        return (
          <button
            key={col.id}
            type="button"
            onClick={() => toggle(col.id)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${
              isSelected
                ? "bg-primary/10 border-primary text-primary"
                : "bg-transparent border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            <FolderOpen className="h-3 w-3 shrink-0" />
            {col.name}
          </button>
        )
      })}
    </div>
  )
}
