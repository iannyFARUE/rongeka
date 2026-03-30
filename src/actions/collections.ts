"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  getSimpleCollections,
} from "@/lib/db/collections";

const CollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
});

type CollectionResult =
  | { success: true; data: { id: string; name: string } }
  | { success: false; error: string };

type DeleteResult = { success: true } | { success: false; error: string };

export async function getCollectionsForPicker(): Promise<{ id: string; name: string }[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getSimpleCollections(session.user.id);
}

export async function createCollection(payload: {
  name: string;
  description: string;
}): Promise<CollectionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  const parsed = CollectionSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: message };
  }

  const { name, description } = parsed.data;

  try {
    const created = await dbCreateCollection(session.user.id, {
      name,
      description: description || null,
    });
    return { success: true, data: { id: created.id, name: created.name } };
  } catch {
    return { success: false, error: "Failed to create collection." };
  }
}

export async function updateCollection(
  collectionId: string,
  payload: { name: string; description: string }
): Promise<CollectionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  const parsed = CollectionSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: message };
  }

  const { name, description } = parsed.data;

  try {
    const updated = await dbUpdateCollection(session.user.id, collectionId, {
      name,
      description: description || null,
    });
    return { success: true, data: { id: updated.id, name: updated.name } };
  } catch {
    return { success: false, error: "Failed to update collection." };
  }
}

export async function deleteCollection(collectionId: string): Promise<DeleteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    await dbDeleteCollection(session.user.id, collectionId);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete collection." };
  }
}
