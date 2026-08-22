import { redis } from "@/lib/rate-limit";
import { CHAT_RATE_LIMIT } from "@/constants";

/**
 * Normalizes a student's message so that trivially-different phrasings of
 * the same generic opener ("Nevím jak začít", "nevim jak zacit?", "Nevím,
 * jak na to...") collapse onto the same cache key. Deliberately aggressive —
 * false-positive cache hits on an *opening* message are low-risk because the
 * tutor's first reply is always a generic orienting question anyway, never
 * something that depends on prior conversation state.
 */
function normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cacheKey(taskId: string, message: string): string {
  return `tutor-first-reply:${taskId}:${normalizeMessage(message)}`;
}

export const tutorCache = {
  /**
   * Only meaningful for the *first* message of a chat session — later
   * messages depend on conversation history and must never be cached.
   * Returns `null` (cache miss) whenever Redis isn't configured, which is
   * safe — it just means every request calls Gemini directly.
   */
  async getFirstReply(taskId: string, message: string): Promise<string | null> {
    if (!redis) return null;
    const cached = await redis.get<string>(cacheKey(taskId, message));
    return cached ?? null;
  },

  async setFirstReply(taskId: string, message: string, reply: string): Promise<void> {
    if (!redis) return;
    await redis.set(cacheKey(taskId, message), reply, {
      ex: CHAT_RATE_LIMIT.FIRST_REPLY_CACHE_TTL_SECONDS,
    });
  },
};
