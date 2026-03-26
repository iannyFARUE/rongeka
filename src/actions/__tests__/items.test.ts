import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateItem } from "../items";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ updateItem: vi.fn() }));

import { auth } from "@/auth";
import { updateItem as dbUpdateItem } from "@/lib/db/items";

const mockAuth = vi.mocked(auth);
const mockDbUpdateItem = vi.mocked(dbUpdateItem);

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
