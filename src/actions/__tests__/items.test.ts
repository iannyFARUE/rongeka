import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateItem, deleteItem, createItem } from "../items";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ updateItem: vi.fn(), deleteItem: vi.fn(), createItem: vi.fn() }));

import { auth } from "@/auth";
import { updateItem as dbUpdateItem, deleteItem as dbDeleteItem, createItem as dbCreateItem } from "@/lib/db/items";

const mockAuth = vi.mocked(auth);
const mockDbUpdateItem = vi.mocked(dbUpdateItem);
const mockDbDeleteItem = vi.mocked(dbDeleteItem);
const mockDbCreateItem = vi.mocked(dbCreateItem);

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
    mockAuth.mockResolvedValue(null);

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

  it("returns error when db throws (item not owned by user)", async () => {
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
    mockDbDeleteItem.mockResolvedValue(false);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Item not found or access denied." });
  });

  it("calls dbDeleteItem with correct userId and itemId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-abc" } } as never);
    mockDbDeleteItem.mockResolvedValue(true);

    await deleteItem("item-xyz");

    expect(mockDbDeleteItem).toHaveBeenCalledWith("user-abc", "item-xyz");
  });

  it("returns success when item is deleted", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDeleteItem.mockResolvedValue(true);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
  });
});

describe("createItem server action", () => {
  const validPayload = {
    typeName: "snippet" as const,
    title: "My Snippet",
    description: "",
    content: "console.log('hello')",
    url: "",
    language: "typescript",
    tags: ["react"],
  };

  const mockItem = { id: "item-1", title: "My Snippet" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await createItem(validPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated." });
    expect(mockDbCreateItem).not.toHaveBeenCalled();
  });

  it("returns error when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);

    const result = await createItem(validPayload);

    expect(result).toEqual({ success: false, error: "Not authenticated." });
  });

  it("returns validation error when title is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createItem({ ...validPayload, title: "  " });

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("Title is required");
    expect(mockDbCreateItem).not.toHaveBeenCalled();
  });

  it("returns validation error when link type has no URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createItem({ ...validPayload, typeName: "link", url: "" });

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("URL is required");
  });

  it("returns validation error when URL is invalid", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createItem({ ...validPayload, typeName: "link", url: "not-a-url" });

    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("valid URL");
  });

  it("accepts a valid link with a proper URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreateItem.mockResolvedValue(mockItem as never);

    const result = await createItem({ ...validPayload, typeName: "link", url: "https://example.com" });

    expect(result).toEqual({ success: true, data: mockItem });
  });

  it("calls dbCreateItem with correct userId and payload", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-abc" } } as never);
    mockDbCreateItem.mockResolvedValue(mockItem as never);

    await createItem(validPayload);

    expect(mockDbCreateItem).toHaveBeenCalledWith(
      "user-abc",
      expect.objectContaining({ typeName: "snippet", title: "My Snippet", tags: ["react"] })
    );
  });

  it("returns success with created item on happy path", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreateItem.mockResolvedValue(mockItem as never);

    const result = await createItem(validPayload);

    expect(result).toEqual({ success: true, data: mockItem });
  });

  it("returns error when db returns null (item type not found)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreateItem.mockResolvedValue(null as never);

    const result = await createItem(validPayload);

    expect(result).toEqual({ success: false, error: "Item type not found." });
  });

  it("returns error when db throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreateItem.mockRejectedValue(new Error("DB error"));

    const result = await createItem(validPayload);

    expect(result).toEqual({ success: false, error: "Failed to create item." });
  });
});
