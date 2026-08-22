import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/config/env";
import { CHAT_RATE_LIMIT } from "@/constants";

const isRedisConfigured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

/** `null` when Upstash isn't configured - callers (tutor-cache.ts) must check. */
export const redis = isRedisConfigured
  ? new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! })
  : null;

interface SimpleLimiter {
  limit(identifier: string): Promise<{ success: boolean }>;
}

function parseWindowToMs(window: string): number {
  const [amountRaw, unit] = window.split(" ");
  const amount = Number(amountRaw);
  const unitMs: Record<string, number> = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * (unitMs[unit] ?? 60_000);
}

/**
 * In-memory sliding-window fallback, used only when Upstash isn't
 * configured. Good enough for local development on a single process;
 * NOT safe for a multi-instance production deployment (each instance
 * would track its own counters). Configure UPSTASH_REDIS_REST_URL/TOKEN
 * before shipping to production.
 */
function createInMemoryLimiter(maxRequests: number, window: string): SimpleLimiter {
  const windowMs = parseWindowToMs(window);
  const hits = new Map<string, number[]>();

  return {
    async limit(identifier: string) {
      const now = Date.now();
      const recent = (hits.get(identifier) ?? []).filter((timestamp) => now - timestamp < windowMs);

      if (recent.length >= maxRequests) {
        hits.set(identifier, recent);
        return { success: false };
      }

      recent.push(now);
      hits.set(identifier, recent);
      return { success: true };
    },
  };
}

function createLimiter(maxRequests: number, window: string, prefix: string): SimpleLimiter {
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
      analytics: true,
      prefix,
    });
  }
  return createInMemoryLimiter(maxRequests, window);
}

/**
 * Per-student daily token budget for the AI tutor. Prevents runaway
 * Gemini spend from a single account (script abuse, infinite chat loops).
 */
export const chatTokenLimiter = createLimiter(
  CHAT_RATE_LIMIT.MAX_TOKENS_PER_DAY,
  CHAT_RATE_LIMIT.WINDOW,
  "ratelimit:chat-tokens",
);

/**
 * Hard cap on AI messages *per task per day* — this is the main cost lever.
 * Keyed by `${studentId}:${taskId}` so it resets per task, but a student
 * can't rack up unlimited messages on a single problem. Once hit, the UI
 * nudges toward "Zobrazit správný výsledek" instead of endless chatting.
 */
export const chatPerTaskLimiter = createLimiter(
  CHAT_RATE_LIMIT.MAX_MESSAGES_PER_TASK_PER_DAY,
  "1 d",
  "ratelimit:chat-per-task",
);

/**
 * Coarse safety net across all tasks combined, so a student can't sidestep
 * the per-task cap by opening many different tasks in quick succession.
 */
export const chatMessageLimiter = createLimiter(CHAT_RATE_LIMIT.MAX_MESSAGES_PER_HOUR, "1 h", "ratelimit:chat-messages");

/** Generic API rate limiter applied via middleware to all /api/* routes. */
export const apiLimiter = createLimiter(60, "1 m", "ratelimit:api");
