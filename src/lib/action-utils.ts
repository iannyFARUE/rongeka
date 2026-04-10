import { auth } from "@/auth";
import { checkRateLimit, retryAfterMinutes } from "@/lib/rate-limit";
import type { ZodError } from "zod";

type LimiterKey = Parameters<typeof checkRateLimit>[0];

/** Resolves the current session and returns { userId, isPro }, or null if unauthenticated. */
export async function requireAuth(): Promise<{ userId: string; isPro: boolean } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { userId: session.user.id, isPro: session.user.isPro ?? false };
}

/** Checks Pro status and rate limit. Returns an error string if either fails, otherwise null. */
export async function requireProWithRateLimit(
  userId: string,
  isPro: boolean,
  key: LimiterKey
): Promise<string | null> {
  if (!isPro) {
    return "AI features require a Pro subscription.";
  }
  const { success, reset } = await checkRateLimit(key, userId);
  if (!success) {
    const minutes = retryAfterMinutes(reset);
    return `Rate limit reached. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`;
  }
  return null;
}

/** Formats a ZodError into a single comma-joined error string. */
export function formatZodError(error: ZodError): string {
  return error.issues.map((e) => e.message).join(", ");
}
