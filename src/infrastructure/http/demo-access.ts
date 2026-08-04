/**
 * Rate limiting + demo API key helpers for public portfolio host.
 * Prefer Upstash Redis when REST env is set; otherwise process-local memory.
 */

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export interface RateLimiter {
  consume(key: string): Promise<RateLimitDecision>;
}

/**
 * Fixed-window counter store (single Node process / single serverless isolate).
 */
export class MemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
    private readonly now: () => number = () => Date.now(),
  ) {
    if (maxRequests < 1) {
      throw new Error("maxRequests must be >= 1");
    }
    if (windowMs < 1) {
      throw new Error("windowMs must be >= 1");
    }
  }

  async consume(key: string): Promise<RateLimitDecision> {
    const now = this.now();
    const windowStart = now - this.windowMs;
    const prior = this.hits.get(key) ?? [];
    const recent = prior.filter((ts) => ts > windowStart);

    if (recent.length >= this.maxRequests) {
      const oldest = recent[0] ?? now;
      const retryAfterMs = Math.max(1, oldest + this.windowMs - now);
      this.hits.set(key, recent);
      return { allowed: false, remaining: 0, retryAfterMs };
    }

    recent.push(now);
    this.hits.set(key, recent);
    return {
      allowed: true,
      remaining: Math.max(0, this.maxRequests - recent.length),
      retryAfterMs: 0,
    };
  }
}

export type DemoAuthResult =
  | { ok: true }
  | { ok: false; status: 401; message: string };

function keysEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

/**
 * When GENERATE_API_KEY is set, require Bearer or x-api-key on external HTTP API.
 * Browser UI uses a Server Action and never needs this key.
 */
export function checkDemoApiKey(
  request: Request,
  configuredKey: string | undefined,
): DemoAuthResult {
  const expected = configuredKey?.trim();
  if (!expected) {
    return { ok: true };
  }

  const headerKey = request.headers.get("x-api-key")?.trim();
  if (headerKey && keysEqual(headerKey, expected)) {
    return { ok: true };
  }

  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    if (token && keysEqual(token, expected)) {
      return { ok: true };
    }
  }

  return {
    ok: false,
    status: 401,
    message: "missing or invalid API key",
  };
}

export function clientRateLimitKey(request: Request): string {
  return clientRateLimitKeyFromHeaderGet((name) => request.headers.get(name));
}

export function clientRateLimitKeyFromHeaderGet(
  get: (name: string) => string | null,
): string {
  const forwarded = get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return `ip:${first}`;
    }
  }
  const realIp = get("x-real-ip")?.trim();
  if (realIp) {
    return `ip:${realIp}`;
  }
  return "ip:unknown";
}

export function readRateLimitConfig(env: NodeJS.ProcessEnv = process.env): {
  maxRequests: number;
  windowMs: number;
} {
  const maxRaw = env.GENERATE_RATE_LIMIT_MAX;
  const windowRaw = env.GENERATE_RATE_LIMIT_WINDOW_MS;
  const maxRequests = maxRaw ? Number.parseInt(maxRaw, 10) : 30;
  const windowMs = windowRaw ? Number.parseInt(windowRaw, 10) : 60_000;

  return {
    maxRequests: Number.isFinite(maxRequests) && maxRequests > 0 ? maxRequests : 30,
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60_000,
  };
}

export function hasUpstashEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(
    env.UPSTASH_REDIS_REST_URL?.trim() && env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

let sharedLimiter: RateLimiter | null = null;
let sharedLimiterMode: "memory" | "upstash" | null = null;

/**
 * Shared limiter: Upstash when configured, else in-memory fallback.
 */
export async function getSharedRateLimiter(
  env: NodeJS.ProcessEnv = process.env,
): Promise<RateLimiter> {
  const wantUpstash = hasUpstashEnv(env);
  const mode: "memory" | "upstash" = wantUpstash ? "upstash" : "memory";

  if (sharedLimiter && sharedLimiterMode === mode) {
    return sharedLimiter;
  }

  const { maxRequests, windowMs } = readRateLimitConfig(env);

  if (wantUpstash) {
    const { Redis } = await import("@upstash/redis");
    const { Ratelimit } = await import("@upstash/ratelimit");
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL!.trim(),
      token: env.UPSTASH_REDIS_REST_TOKEN!.trim(),
    });
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      analytics: false,
      prefix: "aab-generate",
    });

    sharedLimiter = {
      async consume(key: string): Promise<RateLimitDecision> {
        const result = await ratelimit.limit(key);
        return {
          allowed: result.success,
          remaining: result.remaining,
          retryAfterMs: result.success
            ? 0
            : Math.max(1, result.reset - Date.now()),
        };
      },
    };
    sharedLimiterMode = "upstash";
    return sharedLimiter;
  }

  sharedLimiter = new MemoryRateLimiter(maxRequests, windowMs);
  sharedLimiterMode = "memory";
  return sharedLimiter;
}

export function resetSharedRateLimiterForTests(): void {
  sharedLimiter = null;
  sharedLimiterMode = null;
}
