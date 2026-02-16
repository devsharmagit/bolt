'use server';

import { getChatRateLimitStatus } from '@/lib/rate-limit';

export async function getRateLimitStatusAction() {
  return getChatRateLimitStatus();
}
