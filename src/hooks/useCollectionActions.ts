"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateCollection, deleteCollection, toggleFavoriteCollection } from "@/actions/collections"

interface UseCollectionActionsOptions {
  collectionId: string
  collectionName: string
  collectionDescription: string | null
  isFavorite: boolean
  /** Called after a successful delete. Defaults to router.refresh(). */
  onDeleted?: () => void
}

export interface CollectionActionsState {
  name: string
  setName: (name: string) => void
  description: string
  setDescription: (desc: string) => void
  editOpen: boolean
  setEditOpen: (open: boolean) => void
  deleteOpen: boolean
  setDeleteOpen: (open: boolean) => void
  saving: boolean
  deleting: boolean
  isFavorite: boolean
  openEdit: () => void
  handleSave: () => Promise<void>
  handleDelete: () => Promise<void>
  handleToggleFavorite: () => Promise<void>
}

export function useCollectionActions({
  collectionId,
  collectionName,
  collectionDescription,
  isFavorite: initialIsFavorite,
  onDeleted,
}: UseCollectionActionsOptions): CollectionActionsState {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [name, setName] = useState(collectionName)
  const [description, setDescription] = useState(collectionDescription ?? "")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)

  function openEdit() {
    setName(collectionName)
    setDescription(collectionDescription ?? "")
    setEditOpen(true)
  }

  async function handleToggleFavorite() {
    const result = await toggleFavoriteCollection(collectionId)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setIsFavorite(result.isFavorite)
    toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites")
    router.refresh()
  }

  async function handleSave() {
    setSaving(true)
    const result = await updateCollection(collectionId, { name, description })
    setSaving(false)
    if (result.success) {
      toast.success("Collection updated.")
      setEditOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteCollection(collectionId)
    setDeleting(false)
    if (result.success) {
      toast.success("Collection deleted.")
      setDeleteOpen(false)
      if (onDeleted) {
        onDeleted()
      } else {
        router.refresh()
      }
    } else {
      toast.error(result.error)
    }
  }

  return {
    name, setName,
    description, setDescription,
    editOpen, setEditOpen,
    deleteOpen, setDeleteOpen,
    saving,
    deleting,
    isFavorite,
    openEdit,
    handleSave,
    handleDelete,
    handleToggleFavorite,
  }
}
