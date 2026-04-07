import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAutoTags, explainCode } from "../ai";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));
vi.mock("@/lib/openai", () => ({
  getOpenAIClient: vi.fn(),
  AI_MODEL: "gpt-5-nano",
}));

import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getOpenAIClient } from "@/lib/openai";

const mockAuth = vi.mocked(auth);
const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockGetOpenAIClient = vi.mocked(getOpenAIClient);

function makeSession(isPro = true) {
  return { user: { id: "user-1", isPro } } as ReturnType<typeof auth> extends Promise<infer T> ? T : never;
}

function makeClient(outputText: string) {
  return {
    responses: {
      create: vi.fn().mockResolvedValue({ output_text: outputText }),
    },
  };
}

describe("generateAutoTags server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ success: true, reset: 0 });
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await generateAutoTags({ title: "Test" });
    expect(result).toEqual({ success: false, error: "Not authenticated." });
  });

  it("returns error when user is not Pro", async () => {
    mockAuth.mockResolvedValue(makeSession(false));
    const result = await generateAutoTags({ title: "Test" });
    expect(result).toEqual({ success: false, error: "AI features require a Pro subscription." });
  });

  it("returns error when title is empty", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const result = await generateAutoTags({ title: "   " });
    expect(result.success).toBe(false);
  });

  it("returns error when rate limited", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    mockCheckRateLimit.mockResolvedValue({ success: false, reset: Date.now() + 60_000 });
    const result = await generateAutoTags({ title: "Test" });
    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toMatch(/Rate limit/);
  });

  it("returns tags from {tags: [...]} response format", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const client = makeClient(JSON.stringify({ tags: ["react", "hooks", "typescript"] }));
    mockGetOpenAIClient.mockReturnValue(client as never);
    const result = await generateAutoTags({ title: "useCallback snippet" });
    expect(result).toEqual({ success: true, tags: ["react", "hooks", "typescript"] });
  });

  it("returns tags from array response format", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const client = makeClient(JSON.stringify(["python", "async", "io"]));
    mockGetOpenAIClient.mockReturnValue(client as never);
    const result = await generateAutoTags({ title: "Async IO" });
    expect(result).toEqual({ success: true, tags: ["python", "async", "io"] });
  });

  it("normalizes tags to lowercase", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const client = makeClient(JSON.stringify({ tags: ["React", "HOOKS", "TypeScript"] }));
    mockGetOpenAIClient.mockReturnValue(client as never);
    const result = await generateAutoTags({ title: "React hooks" });
    expect(result).toEqual({ success: true, tags: ["react", "hooks", "typescript"] });
  });

  it("caps output at 5 tags", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const client = makeClient(JSON.stringify({ tags: ["a", "b", "c", "d", "e", "f", "g"] }));
    mockGetOpenAIClient.mockReturnValue(client as never);
    const result = await generateAutoTags({ title: "Test" });
    expect(result.success).toBe(true);
    expect((result as { tags: string[] }).tags).toHaveLength(5);
  });

  it("returns error on invalid JSON from AI", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const client = makeClient("not valid json");
    mockGetOpenAIClient.mockReturnValue(client as never);
    const result = await generateAutoTags({ title: "Test" });
    expect(result).toEqual({ success: false, error: "Failed to parse AI response." });
  });

  it("returns error when AI client throws", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const client = {
      responses: { create: vi.fn().mockRejectedValue(new Error("network error")) },
    };
    mockGetOpenAIClient.mockReturnValue(client as never);
    const result = await generateAutoTags({ title: "Test" });
    expect(result).toEqual({ success: false, error: "AI service error. Please try again." });
  });

  it("truncates content to 2000 chars before API call", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const createMock = vi.fn().mockResolvedValue({ output_text: JSON.stringify({ tags: ["x"] }) });
    mockGetOpenAIClient.mockReturnValue({ responses: { create: createMock } } as never);
    const longContent = "a".repeat(5000);
    await generateAutoTags({ title: "Test", content: longContent });
    const callInput: string = createMock.mock.calls[0][0].input;
    expect(callInput).not.toContain("a".repeat(2001));
    expect(callInput).toContain("a".repeat(2000));
  });
});

describe("explainCode server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ success: true, reset: 0 });
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await explainCode({ content: "console.log('hi')" });
    expect(result).toEqual({ success: false, error: "Not authenticated." });
  });

  it("returns error when user is not Pro", async () => {
    mockAuth.mockResolvedValue(makeSession(false));
    const result = await explainCode({ content: "console.log('hi')" });
    expect(result).toEqual({ success: false, error: "AI features require a Pro subscription." });
  });

  it("returns error when content is empty", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const result = await explainCode({ content: "   " });
    expect(result.success).toBe(false);
  });

  it("returns error when rate limited", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    mockCheckRateLimit.mockResolvedValue({ success: false, reset: Date.now() + 60_000 });
    const result = await explainCode({ content: "console.log('hi')" });
    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toMatch(/Rate limit/);
  });

  it("returns explanation on success", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const client = makeClient("This code logs 'hi' to the console.");
    mockGetOpenAIClient.mockReturnValue(client as never);
    const result = await explainCode({ content: "console.log('hi')", language: "javascript" });
    expect(result).toEqual({ success: true, explanation: "This code logs 'hi' to the console." });
  });

  it("returns error when AI returns empty string", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const client = makeClient("   ");
    mockGetOpenAIClient.mockReturnValue(client as never);
    const result = await explainCode({ content: "code" });
    expect(result).toEqual({ success: false, error: "AI returned an empty explanation." });
  });

  it("returns error when AI client throws", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const client = { responses: { create: vi.fn().mockRejectedValue(new Error("network")) } };
    mockGetOpenAIClient.mockReturnValue(client as never);
    const result = await explainCode({ content: "code" });
    expect(result).toEqual({ success: false, error: "AI service error. Please try again." });
  });

  it("includes language and typeName in the prompt", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const createMock = vi.fn().mockResolvedValue({ output_text: "explanation" });
    mockGetOpenAIClient.mockReturnValue({ responses: { create: createMock } } as never);
    await explainCode({ content: "ls -la", language: "bash", typeName: "command" });
    const callInput: string = createMock.mock.calls[0][0].input;
    expect(callInput).toContain("Language: bash");
    expect(callInput).toContain("Type: command");
  });

  it("truncates content to 2000 chars before API call", async () => {
    mockAuth.mockResolvedValue(makeSession(true));
    const createMock = vi.fn().mockResolvedValue({ output_text: "explanation" });
    mockGetOpenAIClient.mockReturnValue({ responses: { create: createMock } } as never);
    await explainCode({ content: "x".repeat(5000) });
    const callInput: string = createMock.mock.calls[0][0].input;
    expect(callInput).not.toContain("x".repeat(2001));
    expect(callInput).toContain("x".repeat(2000));
  });
});
