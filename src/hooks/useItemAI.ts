"use client"

import { useState } from "react"
import { toast } from "sonner"
import { generateAutoTags, generateDescription } from "@/actions/ai"

interface UseItemAIOptions {
  getTitle: () => string
  getContent: () => string | undefined
  getUrl: () => string | undefined
  getTypeName: () => string | undefined
  getTags: () => string
  onTagsChange: (tags: string) => void
  onDescriptionChange: (description: string) => void
}

interface UseItemAIReturn {
  suggestedTags: string[]
  suggestingTags: boolean
  generatingDescription: boolean
  handleSuggestTags: () => Promise<void>
  handleGenerateDescription: () => Promise<void>
  acceptTag: (tag: string) => void
  rejectTag: (tag: string) => void
}

export function useItemAI({
  getTitle,
  getContent,
  getUrl,
  getTypeName,
  getTags,
  onTagsChange,
  onDescriptionChange,
}: UseItemAIOptions): UseItemAIReturn {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [suggestingTags, setSuggestingTags] = useState(false)
  const [generatingDescription, setGeneratingDescription] = useState(false)

  async function handleSuggestTags() {
    const title = getTitle()
    if (!title.trim()) {
      toast.error("Add a title before suggesting tags.")
      return
    }
    setSuggestingTags(true)
    const result = await generateAutoTags({ title, content: getContent() })
    setSuggestingTags(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setSuggestedTags(result.tags)
  }

  async function handleGenerateDescription() {
    const title = getTitle()
    if (!title.trim()) {
      toast.error("Add a title before generating a description.")
      return
    }
    setGeneratingDescription(true)
    const rawTags = getTags()
    const tagList = rawTags.split(",").map((t) => t.trim()).filter(Boolean)
    const result = await generateDescription({
      title,
      typeName: getTypeName(),
      content: getContent(),
      url: getUrl(),
      tags: tagList.length > 0 ? tagList : undefined,
    })
    setGeneratingDescription(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    onDescriptionChange(result.description)
  }

  function acceptTag(tag: string) {
    const rawTags = getTags()
    const existing = rawTags.split(",").map((t) => t.trim()).filter(Boolean)
    if (!existing.includes(tag)) {
      const newTags = existing.length > 0
        ? `${rawTags.trimEnd().replace(/,\s*$/, "")}, ${tag}`
        : tag
      onTagsChange(newTags)
    }
    setSuggestedTags((prev) => prev.filter((t) => t !== tag))
  }

  function rejectTag(tag: string) {
    setSuggestedTags((prev) => prev.filter((t) => t !== tag))
  }

  return {
    suggestedTags,
    suggestingTags,
    generatingDescription,
    handleSuggestTags,
    handleGenerateDescription,
    acceptTag,
    rejectTag,
  }
}
