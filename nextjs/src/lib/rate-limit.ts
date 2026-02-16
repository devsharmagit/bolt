import { headers } from 'next/headers';
import { Redis } from '@upstash/redis';

export const CHAT_PROMPT_LIMIT = 3;
const CHAT_PROMPT_WINDOW_SECONDS = 60 * 60 * 24;

// Check if rate limiting is enabled via environment variable
const ENABLE_RATELIMIT = process.env.ENABLE_RATELIMIT === 'true';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : null;

if (!ENABLE_RATELIMIT) {
  console.log('Rate limiting is disabled via ENABLE_RATELIMIT environment variable.');
} else if (!redis) {
  console.warn('Upstash Redis environment variables are missing. Rate limiting is disabled.');
}

export type ChatRateLimitResult = {
  success: boolean;
  remaining: number | null;
  limit: number;
  error?: string;
};

type ChatRateLimitStatus = {
  remaining: number | null;
  limit: number;
};

async function getClientIdentifier() {
  const headerStore = await headers();

  const candidates = [
    headerStore.get('x-forwarded-for'),
    headerStore.get('x-real-ip'),
    headerStore.get('cf-connecting-ip'),
    headerStore.get('fly-client-ip'),
    headerStore.get('x-vercel-forwarded-for')
  ].filter(Boolean) as string[];

  if (candidates.length > 0) {
    return candidates[0].split(',')[0].trim();
  }

  const userAgent = headerStore.get('user-agent') ?? 'unknown-agent';
  return `unknown-ip:${userAgent}`;
}

function getPromptRateLimitKey(clientId: string) {
  return `ratelimit:chat:prompt:${clientId}`;
}

export async function getChatRateLimitStatus(): Promise<ChatRateLimitStatus> {
  // Skip rate limiting if disabled
  if (!ENABLE_RATELIMIT || !redis) {
    return {
      remaining: null,
      limit: CHAT_PROMPT_LIMIT
    };
  }

  const clientId = await getClientIdentifier();
  const key = getPromptRateLimitKey(clientId);
  const count = (await redis.get<number>(key)) ?? 0;
  const remaining = Math.max(CHAT_PROMPT_LIMIT - Number(count), 0);

  return {
    remaining,
    limit: CHAT_PROMPT_LIMIT
  };
}

export async function checkAndConsumeChatRateLimit(): Promise<ChatRateLimitResult> {
  // Skip rate limiting if disabled
  if (!ENABLE_RATELIMIT || !redis) {
    return {
      success: true,
      remaining: null,
      limit: CHAT_PROMPT_LIMIT
    };
  }

  const clientId = await getClientIdentifier();
  const key = getPromptRateLimitKey(clientId);
  const currentCount = await redis.incr(key);

  if (currentCount === 1) {
    await redis.expire(key, CHAT_PROMPT_WINDOW_SECONDS);
  }

  if (currentCount > CHAT_PROMPT_LIMIT) {
    await redis.decr(key);
    return {
      success: false,
      remaining: 0,
      limit: CHAT_PROMPT_LIMIT,
      error: 'Rate limit reached: you have used all 3 prompts for this IP in the current window.'
    };
  }

  return {
    success: true,
    remaining: Math.max(CHAT_PROMPT_LIMIT - currentCount, 0),
    limit: CHAT_PROMPT_LIMIT
  };
}
