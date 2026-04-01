import { describe, it, expect, vi, beforeEach } from "vitest"
import { updateEditorPreferences } from "../editor-preferences"

vi.mock("@/auth", () => ({ auth: vi.fn() }))
vi.mock("@/lib/db", () => ({ prisma: { user: { update: vi.fn() } } }))

import { auth } from "@/auth"
import { prisma } from "@/lib/db"

const mockAuth = vi.mocked(auth)
const mockUpdate = vi.mocked(prisma.user.update)

const validPrefs = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark" as const,
}

describe("updateEditorPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns unauthorized when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await updateEditorPreferences(validPrefs)

    expect(result).toEqual({ success: false, error: "Unauthorized" })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("returns error for invalid data", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)

    const result = await updateEditorPreferences({ fontSize: "big" })

    expect(result).toEqual({ success: false, error: "Invalid preferences" })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("returns error when fontSize is out of range", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)

    const result = await updateEditorPreferences({ ...validPrefs, fontSize: 9 })

    expect(result).toEqual({ success: false, error: "Invalid preferences" })
  })

  it("returns error when fontSize exceeds max", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)

    const result = await updateEditorPreferences({ ...validPrefs, fontSize: 25 })

    expect(result).toEqual({ success: false, error: "Invalid preferences" })
  })

  it("returns error when tabSize is not an allowed value", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)

    const result = await updateEditorPreferences({ ...validPrefs, tabSize: 3 })

    expect(result).toEqual({ success: false, error: "Invalid preferences" })
  })

  it("returns error when theme is not a valid option", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)

    const result = await updateEditorPreferences({ ...validPrefs, theme: "light" })

    expect(result).toEqual({ success: false, error: "Invalid preferences" })
  })

  it("saves preferences and returns success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    mockUpdate.mockResolvedValue({} as never)

    const result = await updateEditorPreferences(validPrefs)

    expect(result).toEqual({ success: true })
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { editorPreferences: validPrefs },
    })
  })

  it("accepts all valid tab sizes", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    mockUpdate.mockResolvedValue({} as never)

    for (const tabSize of [2, 4, 8]) {
      vi.clearAllMocks()
      mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
      mockUpdate.mockResolvedValue({} as never)
      const result = await updateEditorPreferences({ ...validPrefs, tabSize })
      expect(result).toEqual({ success: true })
    }
  })

  it("accepts all valid themes", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    mockUpdate.mockResolvedValue({} as never)

    for (const theme of ["vs-dark", "monokai", "github-dark"] as const) {
      vi.clearAllMocks()
      mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
      mockUpdate.mockResolvedValue({} as never)
      const result = await updateEditorPreferences({ ...validPrefs, theme })
      expect(result).toEqual({ success: true })
    }
  })

  it("returns error when DB update throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never)
    mockUpdate.mockRejectedValue(new Error("DB error"))

    const result = await updateEditorPreferences(validPrefs)

    expect(result).toEqual({ success: false, error: "Failed to save preferences" })
  })
})
