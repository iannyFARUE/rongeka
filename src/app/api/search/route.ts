import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireProWithRateLimit } from "@/lib/action-utils";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { smartSearchItems, type SmartSearchFilters } from "@/lib/db/smart-search";

const VALID_TYPES = ["snippet", "prompt", "note", "command", "link", "file", "image"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, isPro } = { userId: session.user.id, isPro: session.user.isPro ?? false };

  const gateError = await requireProWithRateLimit(userId, isPro, "aiSmartSearch");
  if (gateError) {
    return NextResponse.json({ error: gateError }, { status: 403 });
  }

  let query: string;
  try {
    const body = await req.json();
    query = typeof body.query === "string" ? body.query.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  // Use AI to extract structured filters from the natural language query
  let filters: SmartSearchFilters = { keywords: [query] };
  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions: `Extract search intent from a developer's query. Return ONLY valid JSON with this shape:
{ "keywords": string[], "typeFilter": string | null, "tagFilters": string[], "daysAgo": number | null }
- keywords: 1-4 meaningful search terms extracted from the query (no stop words)
- typeFilter: one of [${VALID_TYPES.join(", ")}] if the query implies a specific type, otherwise null
- tagFilters: tag names if explicitly mentioned (e.g. "redis", "hooks"), otherwise []
- daysAgo: number of days if a time reference exists (e.g. "last week" = 7, "yesterday" = 1, "last month" = 30), otherwise null
Return only the JSON object, no explanation.`,
      input: query,
    });

    const raw = response.output_text?.trim() ?? "";
    const parsed = JSON.parse(raw);
    filters = {
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.filter((k: unknown) => typeof k === "string") : [query],
      typeFilter: typeof parsed.typeFilter === "string" && VALID_TYPES.includes(parsed.typeFilter) ? parsed.typeFilter : undefined,
      tagFilters: Array.isArray(parsed.tagFilters) ? parsed.tagFilters.filter((t: unknown) => typeof t === "string") : [],
      daysAgo: typeof parsed.daysAgo === "number" && parsed.daysAgo > 0 ? parsed.daysAgo : undefined,
    };
  } catch {
    // Fall back to plain keyword search if AI parsing fails
    filters = { keywords: query.split(/\s+/).filter(Boolean) };
  }

  const results = await smartSearchItems(userId, filters);
  return NextResponse.json({ results });
}
