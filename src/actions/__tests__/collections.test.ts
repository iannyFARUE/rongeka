import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCollection } from "../collections";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/collections", () => ({ createCollection: vi.fn() }));

import { auth } from "@/auth";
import { createCollection as dbCreateCollection } from "@/lib/db/collections";

const mockAuth = vi.mocked(auth);
const mockDbCreate = vi.mocked(dbCreateCollection);

const mockCollection = { id: "col-1", name: "React Patterns" };

describe("createCollection server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await createCollection({ name: "React", description: "" });

    expect(result).toEqual({ success: false, error: "Not authenticated." });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns error when name is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createCollection({ name: "", description: "" });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns error when name is whitespace only", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createCollection({ name: "   ", description: "" });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("creates collection successfully without description", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreate.mockResolvedValue(mockCollection as never);

    const result = await createCollection({ name: "React Patterns", description: "" });

    expect(result).toEqual({ success: true, data: { id: "col-1", name: "React Patterns" } });
    expect(mockDbCreate).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: null,
    });
  });

  it("creates collection successfully with description", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreate.mockResolvedValue(mockCollection as never);

    const result = await createCollection({ name: "React Patterns", description: "My React stuff" });

    expect(result).toEqual({ success: true, data: { id: "col-1", name: "React Patterns" } });
    expect(mockDbCreate).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: "My React stuff",
    });
  });

  it("returns error when DB throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreate.mockRejectedValue(new Error("DB error"));

    const result = await createCollection({ name: "React Patterns", description: "" });

    expect(result).toEqual({ success: false, error: "Failed to create collection." });
  });
});
