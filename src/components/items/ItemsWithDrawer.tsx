"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import ItemRow from "@/components/items/ItemRow"
import ImageThumbnailCard from "@/components/items/ImageThumbnailCard"
import FileListRow from "@/components/items/FileListRow"
import ItemDrawer from "@/components/items/ItemDrawer"
import type { ItemWithMeta } from "@/lib/db/items"

interface ItemsWithDrawerProps {
  items: ItemWithMeta[]
  className?: string
  variant?: "list" | "gallery" | "file-list"
  isPro?: boolean
}

export default function ItemsWithDrawer({ items, className, variant = "list", isPro }: ItemsWithDrawerProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const openParam = searchParams.get("open")

  const [selectedId, setSelectedId] = useState<string | null>(openParam)
  const [open, setOpen] = useState(!!openParam)

  useEffect(() => {
    if (openParam) {
      setSelectedId(openParam)
      setOpen(true)
      // Clear the ?open param from the URL without a navigation
      const params = new URLSearchParams(searchParams.toString())
      params.delete("open")
      const newUrl = params.size > 0 ? `${pathname}?${params}` : pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [openParam]) // eslint-disable-line react-hooks/exhaustive-deps

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
        {items.map((item) =>
          variant === "gallery" ? (
            <ImageThumbnailCard
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item.id)}
            />
          ) : variant === "file-list" ? (
            <FileListRow
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item.id)}
            />
          ) : (
            <ItemRow
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item.id)}
            />
          )
        )}
      </div>
      <ItemDrawer itemId={selectedId} open={open} onClose={handleClose} isPro={isPro} />
    </>
  )
}
