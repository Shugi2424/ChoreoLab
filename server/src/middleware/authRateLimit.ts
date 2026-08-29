import { RateLimitError } from "../utils/errors.js";
import { MemoryRateLimiter, type RateLimitOptions } from "../utils/rateLimit.js";

export type AuthRateLimitAction =
  | "login"
  | "signUp"
  | "forgotPassword"
  | "resetPassword"
  | "changePassword";

const limiter = new MemoryRateLimiter();

const AUTH_RATE_LIMITS: Record<AuthRateLimitAction, RateLimitOptions> = {
  login: { windowMs: 15 * 60 * 1000, maxAttempts: 10 },
  signUp: { windowMs: 60 * 60 * 1000, maxAttempts: 5 },
  forgotPassword: { windowMs: 60 * 60 * 1000, maxAttempts: 5 },
  resetPassword: { windowMs: 60 * 60 * 1000, maxAttempts: 10 },
  changePassword: { windowMs: 15 * 60 * 1000, maxAttempts: 10 },
};

export function assertAuthRateLimit(clientIp: string, action: AuthRateLimitAction): void {
  const key = `${action}:${clientIp}`;
  if (!limiter.consume(key, AUTH_RATE_LIMITS[action])) {
    throw new RateLimitError();
  }
}

/** For tests that exercise rate limiting. */
export function clearAuthRateLimits(): void {
  limiter.clear();
}
