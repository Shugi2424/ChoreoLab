export interface RateLimitOptions {
  windowMs: number;
  maxAttempts: number;
}

export class MemoryRateLimiter {
  private readonly buckets = new Map<string, number[]>();

  /** Returns true when the attempt is allowed. */
  consume(key: string, options: RateLimitOptions): boolean {
    const now = Date.now();
    const windowStart = now - options.windowMs;
    const recent = (this.buckets.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

    if (recent.length >= options.maxAttempts) {
      this.buckets.set(key, recent);
      return false;
    }

    recent.push(now);
    this.buckets.set(key, recent);
    return true;
  }

  clear(): void {
    this.buckets.clear();
  }
}
