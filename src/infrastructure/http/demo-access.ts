/**
 * Fixed-window counter store for demo API protection (single Node process).
 * Not a substitute for Redis/edge rate limits in multi-instance production.
 */
export class MemoryRateLimiter {
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

  /**
   * Records a hit if under the limit. Returns remaining budget and optional retry-after.
   */
  consume(key: string): {
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
  } {
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

/** Constant-time string compare for API keys (best-effort without crypto subtle). */
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
 * When GENERATE_API_KEY is set, require `Authorization: Bearer <key>` or `x-api-key`.
 * When unset, demo stays open (local-dev friendly) but rate limiting still applies.
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
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return `ip:${first}`;
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
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

/** Process-wide limiter for route handlers (tests can inject their own instance). */
let sharedLimiter: MemoryRateLimiter | null = null;

export function getSharedRateLimiter(
  env: NodeJS.ProcessEnv = process.env,
): MemoryRateLimiter {
  if (!sharedLimiter) {
    const { maxRequests, windowMs } = readRateLimitConfig(env);
    sharedLimiter = new MemoryRateLimiter(maxRequests, windowMs);
  }
  return sharedLimiter;
}

/** Test helper — reset singleton between suites. */
export function resetSharedRateLimiterForTests(): void {
  sharedLimiter = null;
}
