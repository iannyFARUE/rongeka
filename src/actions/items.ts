"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItem as dbUpdateItem, deleteItem as dbDeleteItem, createItem as dbCreateItem } from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";

const ITEM_TYPES = ["snippet", "prompt", "command", "note", "link"] as const;
type ItemTypeName = typeof ITEM_TYPES[number];

const CreateItemSchema = z.object({
  typeName: z.enum(ITEM_TYPES, { error: "Invalid item type" }),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  content: z.string().optional(),
  url: z.union([z.url("Must be a valid URL"), z.literal("")]).optional(),
  language: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)),
}).superRefine((data, ctx) => {
  if (data.typeName === "link" && !data.url) {
    ctx.addIssue({ code: "custom", message: "URL is required for link items", path: ["url"] });
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
}): Promise<CreateItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  const parsed = CreateItemSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: message };
  }

  const { typeName, title, description, content, url, language, tags } = parsed.data;

  try {
    const created = await dbCreateItem(session.user.id, {
      typeName,
      title,
      description: description || null,
      content: content || null,
      url: url || null,
      language: language || null,
      tags,
    });

    if (!created) {
      return { success: false, error: "Item type not found." };
    }

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
