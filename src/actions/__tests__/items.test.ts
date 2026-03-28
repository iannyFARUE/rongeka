import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateItem, deleteItem, createItem, cancelUpload } from "../items";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ updateItem: vi.fn(), deleteItem: vi.fn(), createItem: vi.fn() }));
vi.mock("@/lib/r2", () => ({ deleteFromR2: vi.fn() }));

import { auth } from "@/auth";
import { updateItem as dbUpdateItem, deleteItem as dbDeleteItem, createItem as dbCreateItem } from "@/lib/db/items";
import { deleteFromR2 } from "@/lib/r2";

const mockAuth = vi.mocked(auth);
const mockDbUpdateItem = vi.mocked(dbUpdateItem);
const mockDbDeleteItem = vi.mocked(dbDeleteItem);
const mockDbCreateItem = vi.mocked(dbCreateItem);
const mockDeleteFromR2 = vi.mocked(deleteFromR2);

const validPayload = {
  title: "My Snippet",
  description: "A description",
  content: "console.log('hello')",
  url: "",
  language: "typescript",
  tags: ["react", "hooks"],
};

const mockItem = { id: "item-1", title: "My Snippet" };

describe("updateItem server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await updateItem("item-1", validPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated." });
    expect(mockDbUpdateItem).not.toHaveBeenCalled();
  });

  it("returns error when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);

    const result = await updateItem("item-1", validPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated." });
  });

  it("returns validation error when title is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await updateItem("item-1", { ...validPayload, title: "  " });

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("Title is required");
    expect(mockDbUpdateItem).not.toHaveBeenCalled();
  });

  it("returns validation error when url is invalid", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await updateItem("item-1", { ...validPayload, url: "not-a-url" });

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("valid URL");
  });

  it("calls dbUpdateItem with correct userId and itemId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-abc" } } as never);
    mockDbUpdateItem.mockResolvedValue(mockItem as never);

    await updateItem("item-xyz", validPayload);

    expect(mockDbUpdateItem).toHaveBeenCalledWith(
      "user-abc",
      "item-xyz",
      expect.objectContaining({ title: "My Snippet", tags: ["react", "hooks"] })
    );
  });

  it("returns success with updated item on happy path", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbUpdateItem.mockResolvedValue(mockItem as never);

    const result = await updateItem("item-1", validPayload);

    expect(result).toEqual({ success: true, data: mockItem });
  });

  it("returns error when db throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbUpdateItem.mockRejectedValue(new Error("P2025"));

    const result = await updateItem("item-1", validPayload);

    expect(result).toEqual({ success: false, error: "Failed to save item." });
  });

  it("converts empty url to null before calling db", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbUpdateItem.mockResolvedValue(mockItem as never);

    await updateItem("item-1", { ...validPayload, url: "" });

    expect(mockDbUpdateItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ url: null })
    );
  });
});

// ─── deleteItem ─────────────────────────────────────────────────────────────

describe("deleteItem server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Not authenticated." });
    expect(mockDbDeleteItem).not.toHaveBeenCalled();
  });

  it("returns error when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Not authenticated." });
  });

  it("returns error when item is not found or not owned", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDeleteItem.mockResolvedValue(null as never);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Item not found or access denied." });
  });

  it("calls dbDeleteItem with correct userId and itemId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-abc" } } as never);
    mockDbDeleteItem.mockResolvedValue({ fileUrl: null } as never);

    await deleteItem("item-xyz");

    expect(mockDbDeleteItem).toHaveBeenCalledWith("user-abc", "item-xyz");
  });

  it("returns success when item has no file", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDeleteItem.mockResolvedValue({ fileUrl: null } as never);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
    expect(mockDeleteFromR2).not.toHaveBeenCalled();
  });

  it("calls deleteFromR2 when item has a file", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDeleteItem.mockResolvedValue({ fileUrl: "uploads/user-1/abc.pdf" } as never);
    mockDeleteFromR2.mockResolvedValue(undefined);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
    expect(mockDeleteFromR2).toHaveBeenCalledWith("uploads/user-1/abc.pdf");
  });

  it("returns success even when R2 deletion fails (non-fatal)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDeleteItem.mockResolvedValue({ fileUrl: "uploads/user-1/abc.pdf" } as never);
    mockDeleteFromR2.mockRejectedValue(new Error("R2 error"));

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
  });
});

// ─── createItem ─────────────────────────────────────────────────────────────

describe("createItem server action", () => {
  const basePayload = {
    typeName: "snippet" as const,
    title: "My Snippet",
    description: "",
    content: "console.log('hello')",
    url: "",
    language: "typescript",
    tags: ["react"],
    fileKey: null,
    fileName: null,
    fileSize: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await createItem(basePayload);

    expect(result).toEqual({ success: false, error: "Not authenticated." });
    expect(mockDbCreateItem).not.toHaveBeenCalled();
  });

  it("returns error when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);

    const result = await createItem(basePayload);

    expect(result).toEqual({ success: false, error: "Not authenticated." });
  });

  it("returns validation error when title is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createItem({ ...basePayload, title: "  " });

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("Title is required");
    expect(mockDbCreateItem).not.toHaveBeenCalled();
  });

  it("returns validation error when link type has no URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createItem({ ...basePayload, typeName: "link", url: "" });

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("URL is required");
  });

  it("returns validation error when URL is invalid", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createItem({ ...basePayload, typeName: "link", url: "not-a-url" });

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("valid URL");
  });

  it("accepts a valid link with a proper URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreateItem.mockResolvedValue(mockItem as never);

    const result = await createItem({ ...basePayload, typeName: "link", url: "https://example.com" });

    expect(result).toEqual({ success: true, data: mockItem });
  });

  it("returns validation error when file type has no fileKey", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createItem({ ...basePayload, typeName: "file", fileKey: null });

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("file is required");
    expect(mockDbCreateItem).not.toHaveBeenCalled();
  });

  it("returns validation error when image type has no fileKey", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createItem({ ...basePayload, typeName: "image", fileKey: null });

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("file is required");
  });

  it("accepts a file type with a valid fileKey", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreateItem.mockResolvedValue(mockItem as never);

    const result = await createItem({
      ...basePayload,
      typeName: "file",
      fileKey: "uploads/user-1/abc.pdf",
      fileName: "document.pdf",
      fileSize: 102400,
    });

    expect(result).toEqual({ success: true, data: mockItem });
    expect(mockDbCreateItem).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        typeName: "file",
        fileUrl: "uploads/user-1/abc.pdf",
        fileName: "document.pdf",
        fileSize: 102400,
      })
    );
  });

  it("accepts an image type with a valid fileKey", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreateItem.mockResolvedValue(mockItem as never);

    const result = await createItem({
      ...basePayload,
      typeName: "image",
      fileKey: "uploads/user-1/photo.png",
      fileName: "photo.png",
      fileSize: 204800,
    });

    expect(result).toEqual({ success: true, data: mockItem });
  });

  it("calls dbCreateItem with correct userId and payload", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-abc" } } as never);
    mockDbCreateItem.mockResolvedValue(mockItem as never);

    await createItem(basePayload);

    expect(mockDbCreateItem).toHaveBeenCalledWith(
      "user-abc",
      expect.objectContaining({ typeName: "snippet", title: "My Snippet", tags: ["react"] })
    );
  });

  it("returns success with created item on happy path", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreateItem.mockResolvedValue(mockItem as never);

    const result = await createItem(basePayload);

    expect(result).toEqual({ success: true, data: mockItem });
  });

  it("returns error when db returns null (item type not found)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreateItem.mockResolvedValue(null as never);

    const result = await createItem(basePayload);

    expect(result).toEqual({ success: false, error: "Item type not found." });
  });

  it("returns error when db throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreateItem.mockRejectedValue(new Error("DB error"));

    const result = await createItem(basePayload);

    expect(result).toEqual({ success: false, error: "Failed to create item." });
  });
});

// ─── cancelUpload ────────────────────────────────────────────────────────────

describe("cancelUpload server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    await cancelUpload("uploads/user-1/abc.pdf");

    expect(mockDeleteFromR2).not.toHaveBeenCalled();
  });

  it("does nothing when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);

    await cancelUpload("uploads/user-1/abc.pdf");

    expect(mockDeleteFromR2).not.toHaveBeenCalled();
  });

  it("does nothing when key does not belong to the requesting user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-2" } } as never);

    await cancelUpload("uploads/user-1/abc.pdf");

    expect(mockDeleteFromR2).not.toHaveBeenCalled();
  });

  it("calls deleteFromR2 with the key when ownership is verified", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteFromR2.mockResolvedValue(undefined);

    await cancelUpload("uploads/user-1/abc.pdf");

    expect(mockDeleteFromR2).toHaveBeenCalledWith("uploads/user-1/abc.pdf");
  });

  it("swallows R2 errors silently", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteFromR2.mockRejectedValue(new Error("R2 unavailable"));

    await expect(cancelUpload("uploads/user-1/abc.pdf")).resolves.toBeUndefined();
  });
});
