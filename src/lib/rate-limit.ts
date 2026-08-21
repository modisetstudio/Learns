import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/config/env";
import { CHAT_RATE_LIMIT } from "@/constants";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Per-student daily token budget for the AI tutor. Prevents runaway
 * Gemini spend from a single account (script abuse, infinite chat loops).
 */
export const chatTokenLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(CHAT_RATE_LIMIT.MAX_TOKENS_PER_DAY, CHAT_RATE_LIMIT.WINDOW),
  analytics: true,
  prefix: "ratelimit:chat-tokens",
});

/**
 * Hard cap on AI messages *per task per day* — this is the main cost lever.
 * Keyed by `${studentId}:${taskId}` so it resets per task, but a student
 * can't rack up unlimited messages on a single problem. Once hit, the UI
 * nudges toward "Zobrazit správný výsledek" instead of endless chatting.
 */
export const chatPerTaskLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(CHAT_RATE_LIMIT.MAX_MESSAGES_PER_TASK_PER_DAY, "1 d"),
  analytics: true,
  prefix: "ratelimit:chat-per-task",
});

/**
 * Coarse safety net across all tasks combined, so a student can't sidestep
 * the per-task cap by opening many different tasks in quick succession.
 */
export const chatMessageLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(CHAT_RATE_LIMIT.MAX_MESSAGES_PER_HOUR, "1 h"),
  analytics: true,
  prefix: "ratelimit:chat-messages",
});

/** Generic API rate limiter applied via middleware to all /api/* routes. */
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "ratelimit:api",
});
