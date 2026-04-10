"use server"

import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireAuth, formatZodError } from "@/lib/action-utils"

const schema = z.object({
  fontSize: z.number().int().min(10).max(24),
  tabSize: z.number().int().refine((v) => [2, 4, 8].includes(v)),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(["vs-dark", "monokai", "github-dark"]),
})

export async function updateEditorPreferences(data: unknown) {
  const user = await requireAuth()
  if (!user) return { success: false, error: "Unauthorized" }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { success: false, error: formatZodError(parsed.error) }

  try {
    await prisma.user.update({
      where: { id: user.userId },
      data: { editorPreferences: parsed.data },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to save preferences" }
  }
}
