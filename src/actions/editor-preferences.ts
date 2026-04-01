"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

const schema = z.object({
  fontSize: z.number().int().min(10).max(24),
  tabSize: z.number().int().refine((v) => [2, 4, 8].includes(v)),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(["vs-dark", "monokai", "github-dark"]),
})

export async function updateEditorPreferences(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid preferences" }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { editorPreferences: parsed.data },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to save preferences" }
  }
}
