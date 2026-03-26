"use client"

import { useState } from "react"
import ItemRow from "@/components/items/ItemRow"
import ItemDrawer from "@/components/items/ItemDrawer"
import type { ItemWithMeta } from "@/lib/db/items"

interface ItemsWithDrawerProps {
  items: ItemWithMeta[]
  className?: string
}

export default function ItemsWithDrawer({ items, className }: ItemsWithDrawerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  function handleItemClick(id: string) {
    setSelectedId(id)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
  }

  return (
    <>
      <div className={className}>
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onClick={() => handleItemClick(item.id)}
          />
        ))}
      </div>
      <ItemDrawer itemId={selectedId} open={open} onClose={handleClose} />
    </>
  )
}
