import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Limits ─────────────────────────────────────────────────────────────────

const LIMITERS = {
  login:          { requests: 5,  window: "15 m" },
  register:       { requests: 3,  window: "1 h"  },
  forgotPassword: { requests: 3,  window: "1 h"  },
  resetPassword:  { requests: 5,  window: "15 m" },
  aiSuggestTags:         { requests: 20, window: "1 h"  },
  aiGenerateDescription: { requests: 20, window: "1 h"  },
  aiExplainCode:         { requests: 20, window: "1 h"  },
  aiOptimizePrompt:      { requests: 20, window: "1 h"  },
  aiSmartSearch:         { requests: 20, window: "1 h"  },
} as const;

type LimiterKey = keyof typeof LIMITERS;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extracts the client IP from request headers (Vercel / standard proxy). */
export function getIp(headers: { get(name: string): string | null }): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";
}

/** Converts an Upstash reset timestamp (ms) to whole minutes until retry. */
export function retryAfterMinutes(reset: number): number {
  return Math.max(1, Math.ceil((reset - Date.now()) / 60_000));
}

// ─── Core ────────────────────────────────────────────────────────────────────

/**
 * Checks a sliding-window rate limit for the given identifier.
 *
 * Fails open — if the Upstash env vars are missing or Redis errors, the
 * request is allowed through so auth is never broken by an infra failure.
 */
export async function checkRateLimit(
  key: LimiterKey,
  identifier: string
): Promise<{ success: boolean; reset: number }> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { success: true, reset: 0 };
  }

  try {
    const cfg = LIMITERS[key];
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      limiter: Ratelimit.slidingWindow(cfg.requests, cfg.window as any),
      prefix: `rl:${key}`,
    });
    const { success, reset } = await ratelimit.limit(identifier);
    return { success, reset };
  } catch {
    // Fail open on Redis errors.
    return { success: true, reset: 0 };
  }
}
