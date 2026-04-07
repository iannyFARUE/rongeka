"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── Generate Description ────────────────────────────────────────────────────

const GenerateDescriptionSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  typeName: z.string().optional(),
  content: z.string().optional(),
  url: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type GenerateDescriptionResult =
  | { success: true; description: string }
  | { success: false; error: string };

export async function generateDescription(payload: {
  title: string;
  typeName?: string;
  content?: string;
  url?: string;
  tags?: string[];
}): Promise<GenerateDescriptionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  if (!session.user.isPro) {
    return { success: false, error: "AI features require a Pro subscription." };
  }

  const parsed = GenerateDescriptionSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const { success: rateLimitOk, reset } = await checkRateLimit(
    "aiGenerateDescription",
    session.user.id
  );
  if (!rateLimitOk) {
    const minutes = Math.max(1, Math.ceil((reset - Date.now()) / 60_000));
    return { success: false, error: `Rate limit reached. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.` };
  }

  const { title, typeName, content, url, tags } = parsed.data;

  const parts: string[] = [`Title: ${title}`];
  if (typeName) parts.push(`Type: ${typeName}`);
  if (url) parts.push(`URL: ${url}`);
  if (tags && tags.length > 0) parts.push(`Tags: ${tags.join(", ")}`);
  if (content) parts.push(`Content:\n${content.slice(0, 2000)}`);

  const input = parts.join("\n");

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Write a concise 1-2 sentence description for the given item. Be specific and useful. Return only the description text, no quotes or extra formatting.",
      input,
    });

    const description = response.output_text.trim();
    if (!description) {
      return { success: false, error: "AI returned an empty description." };
    }

    return { success: true, description };
  } catch {
    return { success: false, error: "AI service error. Please try again." };
  }
}

const GenerateAutoTagsSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().optional(),
});

type GenerateAutoTagsResult =
  | { success: true; tags: string[] }
  | { success: false; error: string };

export async function generateAutoTags(payload: {
  title: string;
  content?: string;
}): Promise<GenerateAutoTagsResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  if (!session.user.isPro) {
    return { success: false, error: "AI features require a Pro subscription." };
  }

  const parsed = GenerateAutoTagsSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const { success: rateLimitOk, reset } = await checkRateLimit(
    "aiSuggestTags",
    session.user.id
  );
  if (!rateLimitOk) {
    const minutes = Math.max(1, Math.ceil((reset - Date.now()) / 60_000));
    return { success: false, error: `Rate limit reached. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.` };
  }

  const { title, content } = parsed.data;
  const truncatedContent = content ? content.slice(0, 2000) : "";
  const input = truncatedContent
    ? `Suggest tags (return json). Title: ${title}\n\nContent:\n${truncatedContent}`
    : `Suggest tags (return json). Title: ${title}`;

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Suggest 3-5 concise, lowercase tags for the given item. Return JSON in the format {\"tags\": [\"tag1\", \"tag2\"]}.",
      input,
      text: {
        format: { type: "json_object" },
      },
    });

    const raw = response.output_text;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { success: false, error: "Failed to parse AI response." };
    }

    let tags: string[];
    if (Array.isArray(parsed)) {
      tags = parsed;
    } else if (
      parsed &&
      typeof parsed === "object" &&
      "tags" in parsed &&
      Array.isArray((parsed as { tags: unknown }).tags)
    ) {
      tags = (parsed as { tags: unknown[] }).tags as string[];
    } else {
      return { success: false, error: "Unexpected AI response format." };
    }

    const normalizedTags = tags
      .filter((t) => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.toLowerCase().trim())
      .slice(0, 5);

    return { success: true, tags: normalizedTags };
  } catch {
    return { success: false, error: "AI service error. Please try again." };
  }
}
