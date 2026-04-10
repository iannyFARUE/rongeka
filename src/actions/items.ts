"use server";

import { z } from "zod";
import { updateItem as dbUpdateItem, deleteItem as dbDeleteItem, createItem as dbCreateItem, toggleFavoriteItem as dbToggleFavoriteItem, toggleItemPin as dbToggleItemPin } from "@/lib/db/items";
import { deleteFromR2 } from "@/lib/r2";
import type { ItemDetail } from "@/lib/db/items";
import { hasReachedItemLimit, isProOnlyType } from "@/lib/usage-limits";
import { FREE_TIER_ITEM_LIMIT } from "@/lib/constants";
import { requireAuth, formatZodError } from "@/lib/action-utils";

const ITEM_TYPES = ["snippet", "prompt", "command", "note", "link", "file", "image"] as const;
type ItemTypeName = typeof ITEM_TYPES[number];

const CreateItemSchema = z.object({
  typeName: z.enum(ITEM_TYPES, { error: "Invalid item type" }),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  content: z.string().optional(),
  url: z.union([z.url("Must be a valid URL"), z.literal("")]).optional(),
  language: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)),
  collectionIds: z.array(z.string()),
  fileKey: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.typeName === "link" && !data.url) {
    ctx.addIssue({ code: "custom", message: "URL is required for link items", path: ["url"] });
  }
  if ((data.typeName === "file" || data.typeName === "image") && !data.fileKey) {
    ctx.addIssue({ code: "custom", message: "A file is required for this item type", path: ["fileKey"] });
  }
});

type CreateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export async function createItem(payload: {
  typeName: ItemTypeName;
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string[];
  collectionIds: string[];
  fileKey: string | null;
  fileName: string | null;
  fileSize: number | null;
}): Promise<CreateItemResult> {
  const user = await requireAuth();
  if (!user) return { success: false, error: "Not authenticated." };

  const parsed = CreateItemSchema.safeParse(payload);
  if (!parsed.success) return { success: false, error: formatZodError(parsed.error) };

  const { typeName, title, description, content, url, language, tags, collectionIds, fileKey, fileName, fileSize } = parsed.data;

  if (!user.isPro && isProOnlyType(typeName)) {
    return { success: false, error: "File and image uploads require Rongeka Pro." };
  }

  if (!user.isPro) {
    const limited = await hasReachedItemLimit(user.userId);
    if (limited) {
      return {
        success: false,
        error: `Free tier limit reached (${FREE_TIER_ITEM_LIMIT} items). Upgrade to Pro for unlimited items.`,
      };
    }
  }

  try {
    const created = await dbCreateItem(user.userId, {
      typeName,
      title,
      description: description || null,
      content: content || null,
      url: url || null,
      language: language || null,
      tags,
      fileUrl: fileKey ?? null,
      fileName: fileName ?? null,
      fileSize: fileSize ?? null,
      collectionIds,
    });

    if (!created) return { success: false, error: "Item type not found." };
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Failed to create item." };
  }
}

const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.union([z.url("Must be a valid URL"), z.literal(""), z.null()]).optional(),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
  collectionIds: z.array(z.string()),
});

type ToggleFavoriteResult =
  | { success: true; isFavorite: boolean }
  | { success: false; error: string };

type TogglePinResult =
  | { success: true; isPinned: boolean }
  | { success: false; error: string };

export async function toggleItemPin(itemId: string): Promise<TogglePinResult> {
  const user = await requireAuth();
  if (!user) return { success: false, error: "Not authenticated." };

  const result = await dbToggleItemPin(user.userId, itemId);
  if (!result) return { success: false, error: "Item not found or access denied." };
  return { success: true, isPinned: result.isPinned };
}

export async function toggleFavoriteItem(itemId: string): Promise<ToggleFavoriteResult> {
  const user = await requireAuth();
  if (!user) return { success: false, error: "Not authenticated." };

  const result = await dbToggleFavoriteItem(user.userId, itemId);
  if (!result) return { success: false, error: "Item not found or access denied." };
  return { success: true, isFavorite: result.isFavorite };
}

type DeleteItemResult = { success: true } | { success: false; error: string };

export async function cancelUpload(key: string): Promise<void> {
  const user = await requireAuth();
  if (!user) return;

  // Only allow deletion of the requesting user's own keys
  if (!key.startsWith(`uploads/${user.userId}/`)) return;

  try {
    await deleteFromR2(key);
  } catch {
    // Non-fatal
  }
}

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  const user = await requireAuth();
  if (!user) return { success: false, error: "Not authenticated." };

  const deleted = await dbDeleteItem(user.userId, itemId);
  if (!deleted) return { success: false, error: "Item not found or access denied." };

  if (deleted.fileUrl) {
    try {
      await deleteFromR2(deleted.fileUrl);
    } catch {
      console.error("Failed to delete R2 file:", deleted.fileUrl);
    }
  }

  return { success: true };
}

type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export async function updateItem(
  itemId: string,
  payload: {
    title: string;
    description: string;
    content: string;
    url: string;
    language: string;
    tags: string[];
    collectionIds: string[];
  }
): Promise<UpdateItemResult> {
  const user = await requireAuth();
  if (!user) return { success: false, error: "Not authenticated." };

  const parsed = UpdateItemSchema.safeParse(payload);
  if (!parsed.success) return { success: false, error: formatZodError(parsed.error) };

  const { title, description, content, url, language, tags, collectionIds } = parsed.data;

  try {
    const updated = await dbUpdateItem(user.userId, itemId, {
      title,
      description: description ?? null,
      content: content ?? null,
      url: url || null,
      language: language ?? null,
      tags,
      collectionIds,
    });

    if (!updated) return { success: false, error: "Item not found or access denied." };
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to save item." };
  }
}
