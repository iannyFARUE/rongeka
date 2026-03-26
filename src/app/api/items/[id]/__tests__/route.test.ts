import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ getItemById: vi.fn() }));

import { auth } from "@/auth";
import { getItemById } from "@/lib/db/items";

const mockAuth = vi.mocked(auth);
const mockGetItemById = vi.mocked(getItemById);

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/items/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), makeParams("item-1"));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);

    const res = await GET(new Request("http://localhost"), makeParams("item-1"));

    expect(res.status).toBe(401);
  });

  it("returns 404 when item is not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetItemById.mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), makeParams("item-1"));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found" });
  });

  it("returns 200 with the item when found", async () => {
    const mockItem = { id: "item-1", title: "Test Item" };
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetItemById.mockResolvedValue(mockItem as never);

    const res = await GET(new Request("http://localhost"), makeParams("item-1"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockItem);
  });

  it("calls getItemById with the correct userId and itemId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-abc" } } as never);
    mockGetItemById.mockResolvedValue({ id: "item-xyz" } as never);

    await GET(new Request("http://localhost"), makeParams("item-xyz"));

    expect(mockGetItemById).toHaveBeenCalledWith("user-abc", "item-xyz");
  });
});
