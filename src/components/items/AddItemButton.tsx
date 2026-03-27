"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import NewItemDialog from "@/components/items/NewItemDialog"

type ItemTypeName = "snippet" | "prompt" | "command" | "note" | "link"

interface AddItemButtonProps {
  type: ItemTypeName
  label: string
}

export default function AddItemButton({ type, label }: AddItemButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add {label}
      </button>
      <NewItemDialog
        open={open}
        onClose={() => setOpen(false)}
        defaultType={type}
      />
    </>
  )
}
