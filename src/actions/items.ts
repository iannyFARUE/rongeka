"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";

const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.union([z.url("Must be a valid URL"), z.literal(""), z.null()]).optional(),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
});

type DeleteItemResult = { success: true } | { success: false; error: string };

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  const deleted = await dbDeleteItem(session.user.id, itemId);
  if (!deleted) {
    return { success: false, error: "Item not found or access denied." };
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
  }
): Promise<UpdateItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  const parsed = UpdateItemSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: message };
  }

  const { title, description, content, url, language, tags } = parsed.data;

  try {
    const updated = await dbUpdateItem(session.user.id, itemId, {
      title,
      description: description ?? null,
      content: content ?? null,
      url: url || null,
      language: language ?? null,
      tags,
    });

    if (!updated) {
      return { success: false, error: "Item not found or access denied." };
    }

    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to save item." };
  }
}
