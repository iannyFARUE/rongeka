# AI Integration Plan

> Features: auto-tagging, AI summaries, code explanation, prompt optimization  
> Model: `gpt-5-nano` — OpenAI's fastest, most cost-efficient GPT-5 variant ($0.05/1M input, $0.40/1M output, 400k context window). Recommended for speed- and cost-sensitive tasks like tagging, summarization, and explanation.

---

## 1. SDK Setup

Install the OpenAI Node SDK:

```bash
npm install openai
```

Create a singleton client at `src/lib/openai.ts` following the same pattern as `src/lib/stripe.ts`:

```typescript
import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}
```

Add to `.env.local` (and `.env.example`):

```
OPENAI_API_KEY=sk-...
```

The API key must **only** ever be read server-side. Never expose it to the client.

---

## 2. Server Action Pattern

All AI features follow the same server action structure used throughout the codebase.

```typescript
"use server";

import { auth } from "@/auth";
import { getOpenAI } from "@/lib/openai";
import OpenAI from "openai";
import { z } from "zod";

// 1. Auth check
const session = await auth();
if (!session?.user?.id) return { success: false, error: "Not authenticated." };

// 2. Pro gate
if (!session.user.isPro) {
  return { success: false, error: "AI features require Rongeka Pro." };
}

// 3. Zod validation
const parsed = Schema.safeParse(input);
if (!parsed.success) {
  return { success: false, error: parsed.error.issues.map(e => e.message).join(", ") };
}

// 4. OpenAI call wrapped in try/catch
try {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({ ... });
  return { success: true, data: completion.choices[0].message.content };
} catch (err) {
  if (err instanceof OpenAI.APIError) {
    if (err.status === 429) return { success: false, error: "AI rate limit reached. Try again shortly." };
  }
  return { success: false, error: "AI request failed." };
}
```

Return type follows the standard discriminated union:

```typescript
type AIResult<T> = { success: true; data: T } | { success: false; error: string };
```

Place all AI actions in `src/actions/ai.ts`.

---

## 3. Streaming vs Non-Streaming

| Feature | Recommendation | Reason |
|---|---|---|
| Auto-tagging | **Non-streaming** | Short JSON array output; streaming adds complexity |
| AI summaries | **Non-streaming** | 1–3 sentence output; user can wait |
| Code explanation | **Streaming** | Longer output; streaming improves perceived speed |
| Prompt optimization | **Streaming** | Longer output; user wants to see it build |

### Non-streaming (tags, summary)

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-5-nano",
  messages: [{ role: "user", content: prompt }],
  max_tokens: 150,
  temperature: 0.3,
});
const result = completion.choices[0].message.content ?? "";
```

### Streaming (explain, optimize) — use API Route, not Server Action

Server Actions cannot stream to the client. Use an API route at `src/app/api/ai/[feature]/route.ts`:

```typescript
import { openai } from "@/lib/openai";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  if (!session.user.isPro) return new Response("Pro required", { status: 403 });

  const { content } = await req.json();

  const stream = await getOpenAI().chat.completions.create({
    model: "gpt-5-nano",
    messages: [{ role: "user", content: buildPrompt(content) }],
    stream: true,
  });

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) controller.enqueue(new TextEncoder().encode(delta));
        }
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
```

Client reads the stream with `fetch` + `ReadableStream` reader.

---

## 4. Pro User Gating

Matches the existing pattern in `src/actions/items.ts`:

```typescript
const isPro = session.user.isPro;
if (!isPro) {
  return { success: false, error: "AI features require Rongeka Pro." };
}
```

During development, all users are treated as Pro (per project spec). The gate is still coded; it simply evaluates to `true` for everyone until Stripe subscriptions go live.

No new `features.ts` flag is needed — `isPro` on the session is the gate.

---

## 5. Error Handling & Rate Limiting

### OpenAI Errors

```typescript
import OpenAI from "openai";

try {
  // ... API call
} catch (err) {
  if (err instanceof OpenAI.APIError) {
    if (err.status === 429) return { success: false, error: "AI rate limit reached. Try again shortly." };
    if (err.status === 400) return { success: false, error: "Invalid request to AI service." };
  }
  return { success: false, error: "AI request failed." };
}
```

### Per-User Rate Limiting (optional, add later)

If needed, reuse the existing `src/lib/rate-limit.ts` Upstash sliding-window pattern to cap AI calls per user per minute:

```typescript
const { success } = await rateLimit(`ai:${session.user.id}`, "10 per 1m");
if (!success) return { success: false, error: "You're making AI requests too quickly." };
```

### Input Sanitization

- Truncate `content` before sending to OpenAI (avoid prompt injection + token waste):

```typescript
const MAX_CHARS = 8_000; // ~2k tokens
const safeContent = content.slice(0, MAX_CHARS);
```

- Never include user-controlled data outside of clearly delimited content fields in the prompt.
- Use explicit instruction/content separation in messages:

```typescript
messages: [
  { role: "system", content: "You are a code tagging assistant. ..." },
  { role: "user", content: `Content:\n\`\`\`\n${safeContent}\n\`\`\`` },
]
```

---

## 6. Feature Prompts

### Auto-tagging

```typescript
const systemPrompt = `You are a tagging assistant for a developer knowledge hub.
Return a JSON array of 3–6 short lowercase tag strings relevant to the content.
Respond with ONLY valid JSON, no explanation. Example: ["react","hooks","performance"]`;

const userPrompt = `Tag this content:\n\`\`\`\n${safeContent}\n\`\`\``;
```

Parse the response:
```typescript
const raw = completion.choices[0].message.content ?? "[]";
const tags = JSON.parse(raw) as string[];
```

Wrap in try/catch — LLMs occasionally return malformed JSON.

### AI Summary

```typescript
const systemPrompt = `You are a summarizer for a developer knowledge hub.
Write a 1–2 sentence plain English summary of what the content is and what it does.
Be concise and technical. Do not start with "This is".`;
```

### Code Explanation

```typescript
const systemPrompt = `You are a code explanation assistant.
Explain what the following code does in clear, plain English for a developer audience.
Use bullet points for key points. Be concise.`;
```

### Prompt Optimizer

```typescript
const systemPrompt = `You are an expert prompt engineer.
Rewrite the following AI prompt to be clearer, more specific, and more effective.
Return only the improved prompt text, no explanation or preamble.`;
```

---

## 7. Cost Optimization

| Strategy | Detail |
|---|---|
| Use `gpt-5-nano` | Fastest/cheapest GPT-5 variant — $0.05/1M input tokens, 400k context window |
| Set `max_tokens` | Cap per-feature: tags=100, summary=150, explain=500, optimize=500 |
| Set `temperature` | Lower for structured output (tags: 0.2), higher for creative (optimize: 0.7) |
| Truncate input | 8,000 character cap before sending to avoid runaway token use |
| Cache summaries/tags | Store result on `Item` (add `aiSummary`, `aiTags` columns) to avoid repeat calls |

---

## 8. UI Patterns

### Loading State

Use a boolean `isPending` flag. Disable the trigger button and show a spinner:

```tsx
<Button onClick={handleAI} disabled={isPending}>
  {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
  {isPending ? "Generating..." : "Suggest Tags"}
</Button>
```

### Accept / Reject Suggestions (auto-tagging)

Show suggested tags as a preview below the tag input. Each tag has an Add button:

```
Suggested: [react] [hooks] [performance]   ← click to add individual tags
           [Add all]  [Dismiss]
```

State: `suggestedTags: string[] | null`. Cleared on accept-all or dismiss.

### Streaming Output (explain, optimize)

Stream text into a `useState` string, appending each delta:

```typescript
const reader = response.body!.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  setOutput(prev => prev + decoder.decode(value));
}
```

Display output in a scrollable `<pre>` or MarkdownEditor preview panel.

### Toast on Error

Follow the existing pattern — all AI action errors surface via `sonner` toast:

```typescript
const result = await suggestTags(itemId);
if (!result.success) toast.error(result.error);
```

---

## 9. File Structure

```
src/
├── actions/
│   └── ai.ts               # suggestTags, generateSummary (non-streaming)
├── app/
│   └── api/
│       └── ai/
│           ├── explain/
│           │   └── route.ts    # streaming code explanation
│           └── optimize/
│               └── route.ts    # streaming prompt optimization
└── lib/
    └── openai.ts           # singleton client
```

---

## 10. Security Checklist

- [ ] `OPENAI_API_KEY` only read server-side (never in `NEXT_PUBLIC_*`)
- [ ] All AI routes/actions require authenticated session
- [ ] All AI routes/actions require `isPro === true`
- [ ] User input truncated to `MAX_CHARS` before sending
- [ ] System prompt separated from user content in messages array
- [ ] OpenAI `APIError` caught and mapped to user-friendly messages
- [ ] No raw error details from OpenAI forwarded to client
