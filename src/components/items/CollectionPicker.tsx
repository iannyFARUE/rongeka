"use client"

import { FolderOpen, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

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

  const label =
    selected.length === 0
      ? "None"
      : selected.length === 1
      ? collections.find((c) => c.id === selected[0])?.name ?? "1 selected"
      : `${selected.length} selected`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-left transition-colors hover:bg-muted focus:outline-none focus-visible:border-foreground">
        <span className="flex items-center gap-2 text-sm">
          <FolderOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className={selected.length === 0 ? "text-muted-foreground" : "text-foreground"}>
            {label}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[200px]">
        {collections.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={selected.includes(col.id)}
            onCheckedChange={() => toggle(col.id)}
          >
            {col.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
