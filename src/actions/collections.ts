"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createCollection as dbCreateCollection } from "@/lib/db/collections";

const CreateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
});

type CreateCollectionResult =
  | { success: true; data: { id: string; name: string } }
  | { success: false; error: string };

export async function createCollection(payload: {
  name: string;
  description: string;
}): Promise<CreateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  const parsed = CreateCollectionSchema.safeParse(payload);
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
