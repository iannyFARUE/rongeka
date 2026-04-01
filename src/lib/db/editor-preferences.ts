import { cache } from "react"
import { prisma } from "@/lib/db"
import { EditorPreferences, DEFAULT_EDITOR_PREFERENCES } from "@/types/editor"

export const getEditorPreferences = cache(async (userId: string): Promise<EditorPreferences> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  })

  if (!user || !user.editorPreferences) return DEFAULT_EDITOR_PREFERENCES

  return { ...DEFAULT_EDITOR_PREFERENCES, ...(user.editorPreferences as Partial<EditorPreferences>) }
})
