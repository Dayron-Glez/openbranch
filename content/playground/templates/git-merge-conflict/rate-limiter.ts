interface RateLimiterOpts {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private opts: RateLimiterOpts;
  private counts = new Map<string, { count: number; resetAt: number }>();

  constructor(opts: RateLimiterOpts) {
    this.opts = opts;
  }

  allow(key: string): boolean {
    const now = Date.now();
    const entry = this.counts.get(key);
    if (!entry || now > entry.resetAt) {
      this.counts.set(key, { count: 1, resetAt: now + this.opts.windowMs });
      return true;
    }
    if (entry.count >= this.opts.maxRequests) return false;
    entry.count++;
    return true;
  }
}
