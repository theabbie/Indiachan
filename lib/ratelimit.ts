import { Ratelimits } from './db/ratelimits';

interface RateLimitConfig {
  max: number;
  window: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { max: 20, window: 300 },
  register: { max: 10, window: 3600 },
  post: { max: 50, window: 60 },
  thread: { max: 20, window: 300 },
  report: { max: 20, window: 300 },
};

export async function checkRateLimit(identifier: string, action: string): Promise<void> {
  const config = RATE_LIMITS[action];
  if (!config) {
    return;
  }

  const current = await Ratelimits.incrementQuota(identifier, action, 1, config.window);

  if (current > config.max) {
    throw new Error(`Rate limit exceeded. Please wait ${config.window} seconds before trying again.`);
  }
}

export async function resetRateLimit(identifier: string, action: string): Promise<void> {
  await Ratelimits.resetQuota(identifier, action);
}

export function getRateLimitIdentifier(ip: string, userId?: string): string {
  return userId ? `user:${userId}` : `ip:${ip}`;
}
