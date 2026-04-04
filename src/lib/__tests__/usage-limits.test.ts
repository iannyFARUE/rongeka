import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  hasReachedItemLimit,
  hasReachedCollectionLimit,
  isProOnlyType,
} from "@/lib/usage-limits";

vi.mock("@/lib/db", () => ({
  prisma: {
    item: { count: vi.fn() },
    collection: { count: vi.fn() },
  },
}));

import { prisma } from "@/lib/db";

const mockItemCount = prisma.item.count as ReturnType<typeof vi.fn>;
const mockCollectionCount = prisma.collection.count as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("hasReachedItemLimit", () => {
  it("returns false when count is below 50", async () => {
    mockItemCount.mockResolvedValue(49);
    expect(await hasReachedItemLimit("user1")).toBe(false);
  });

  it("returns true when count equals 50", async () => {
    mockItemCount.mockResolvedValue(50);
    expect(await hasReachedItemLimit("user1")).toBe(true);
  });

  it("returns true when count exceeds 50", async () => {
    mockItemCount.mockResolvedValue(51);
    expect(await hasReachedItemLimit("user1")).toBe(true);
  });
});

describe("hasReachedCollectionLimit", () => {
  it("returns false when count is below 3", async () => {
    mockCollectionCount.mockResolvedValue(2);
    expect(await hasReachedCollectionLimit("user1")).toBe(false);
  });

  it("returns true when count equals 3", async () => {
    mockCollectionCount.mockResolvedValue(3);
    expect(await hasReachedCollectionLimit("user1")).toBe(true);
  });

  it("returns true when count exceeds 3", async () => {
    mockCollectionCount.mockResolvedValue(4);
    expect(await hasReachedCollectionLimit("user1")).toBe(true);
  });
});

describe("isProOnlyType", () => {
  it("returns true for 'file'", () => {
    expect(isProOnlyType("file")).toBe(true);
  });

  it("returns true for 'image'", () => {
    expect(isProOnlyType("image")).toBe(true);
  });

  it("returns false for 'snippet'", () => {
    expect(isProOnlyType("snippet")).toBe(false);
  });

  it("returns false for 'prompt'", () => {
    expect(isProOnlyType("prompt")).toBe(false);
  });

  it("returns false for 'command'", () => {
    expect(isProOnlyType("command")).toBe(false);
  });

  it("returns false for 'note'", () => {
    expect(isProOnlyType("note")).toBe(false);
  });

  it("returns false for 'link'", () => {
    expect(isProOnlyType("link")).toBe(false);
  });
});
