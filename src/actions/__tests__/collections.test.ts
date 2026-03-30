import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCollection, updateCollection, deleteCollection } from "../collections";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
}));

import { auth } from "@/auth";
import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
} from "@/lib/db/collections";

const mockAuth = vi.mocked(auth);
const mockDbCreate = vi.mocked(dbCreateCollection);
const mockDbUpdate = vi.mocked(dbUpdateCollection);
const mockDbDelete = vi.mocked(dbDeleteCollection);

const mockCollection = { id: "col-1", name: "React Patterns" };

describe("updateCollection server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await updateCollection("col-1", { name: "New Name", description: "" });

    expect(result).toEqual({ success: false, error: "Not authenticated." });
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("returns error when name is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await updateCollection("col-1", { name: "", description: "" });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("returns error when name is whitespace only", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await updateCollection("col-1", { name: "   ", description: "" });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("updates collection successfully without description", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbUpdate.mockResolvedValue(mockCollection as never);

    const result = await updateCollection("col-1", { name: "New Name", description: "" });

    expect(result).toEqual({ success: true, data: { id: "col-1", name: "React Patterns" } });
    expect(mockDbUpdate).toHaveBeenCalledWith("user-1", "col-1", {
      name: "New Name",
      description: null,
    });
  });

  it("updates collection successfully with description", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbUpdate.mockResolvedValue(mockCollection as never);

    const result = await updateCollection("col-1", { name: "New Name", description: "A desc" });

    expect(result).toEqual({ success: true, data: { id: "col-1", name: "React Patterns" } });
    expect(mockDbUpdate).toHaveBeenCalledWith("user-1", "col-1", {
      name: "New Name",
      description: "A desc",
    });
  });

  it("returns error when DB throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbUpdate.mockRejectedValue(new Error("DB error"));

    const result = await updateCollection("col-1", { name: "New Name", description: "" });

    expect(result).toEqual({ success: false, error: "Failed to update collection." });
  });
});

describe("deleteCollection server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await deleteCollection("col-1");

    expect(result).toEqual({ success: false, error: "Not authenticated." });
    expect(mockDbDelete).not.toHaveBeenCalled();
  });

  it("deletes collection successfully", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDelete.mockResolvedValue(undefined as never);

    const result = await deleteCollection("col-1");

    expect(result).toEqual({ success: true });
    expect(mockDbDelete).toHaveBeenCalledWith("user-1", "col-1");
  });

  it("returns error when DB throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDelete.mockRejectedValue(new Error("DB error"));

    const result = await deleteCollection("col-1");

    expect(result).toEqual({ success: false, error: "Failed to delete collection." });
  });
});

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
