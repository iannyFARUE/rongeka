import { describe, it, expect } from "vitest";
import { sortItems, sortCollections } from "@/lib/favorites-sort";
import type { FavoriteItem, FavoriteCollection } from "@/lib/db/favorites";

function makeItem(overrides: Partial<FavoriteItem> & { title: string }): FavoriteItem {
  return {
    id: overrides.title,
    description: null,
    isFavorite: true,
    isPinned: false,
    lastUsedAt: null,
    content: null,
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: overrides.updatedAt ?? new Date("2026-01-01"),
    itemType: overrides.itemType ?? { id: "1", name: "snippet", icon: "Code", color: "#3b82f6" },
    tags: [],
    ...overrides,
  } as FavoriteItem;
}

function makeCollection(overrides: Partial<FavoriteCollection> & { name: string }): FavoriteCollection {
  return {
    id: overrides.name,
    description: null,
    updatedAt: overrides.updatedAt ?? new Date("2026-01-01"),
    itemCount: 0,
    dominantColor: "#6b7280",
    dominantTypeName: overrides.dominantTypeName ?? "",
    ...overrides,
  };
}

// ─── sortItems ───────────────────────────────────────────────────

describe("sortItems", () => {
  const a = makeItem({ title: "Alpha", itemType: { id: "1", name: "note", icon: "StickyNote", color: "#fde047" }, updatedAt: new Date("2026-01-03") });
  const b = makeItem({ title: "Beta",  itemType: { id: "2", name: "snippet", icon: "Code", color: "#3b82f6" }, updatedAt: new Date("2026-01-02") });
  const c = makeItem({ title: "Gamma", itemType: { id: "3", name: "command", icon: "Terminal", color: "#f97316" }, updatedAt: new Date("2026-01-01") });

  it("sorts by date descending (default)", () => {
    const result = sortItems([c, a, b], "date");
    expect(result.map((i) => i.title)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("sorts by name ascending", () => {
    const result = sortItems([c, b, a], "name");
    expect(result.map((i) => i.title)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("sorts by type name ascending", () => {
    // command < note < snippet
    const result = sortItems([b, a, c], "type");
    expect(result.map((i) => i.itemType.name)).toEqual(["command", "note", "snippet"]);
  });

  it("does not mutate the original array", () => {
    const list = [c, a, b];
    sortItems(list, "name");
    expect(list[0].title).toBe("Gamma");
  });
});

// ─── sortCollections ─────────────────────────────────────────────

describe("sortCollections", () => {
  const a = makeCollection({ name: "Alpha", dominantTypeName: "note",    updatedAt: new Date("2026-01-03") });
  const b = makeCollection({ name: "Beta",  dominantTypeName: "snippet", updatedAt: new Date("2026-01-02") });
  const c = makeCollection({ name: "Gamma", dominantTypeName: "command", updatedAt: new Date("2026-01-01") });

  it("sorts by date descending (default)", () => {
    const result = sortCollections([c, a, b], "date");
    expect(result.map((col) => col.name)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("sorts by name ascending", () => {
    const result = sortCollections([c, b, a], "name");
    expect(result.map((col) => col.name)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("sorts by dominant type name ascending", () => {
    // command < note < snippet
    const result = sortCollections([b, a, c], "type");
    expect(result.map((col) => col.dominantTypeName)).toEqual(["command", "note", "snippet"]);
  });

  it("does not mutate the original array", () => {
    const list = [c, a, b];
    sortCollections(list, "name");
    expect(list[0].name).toBe("Gamma");
  });
});
