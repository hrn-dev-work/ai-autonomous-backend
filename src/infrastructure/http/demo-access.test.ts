import { describe, expect, it } from "vitest";

import {
  MemoryRateLimiter,
  checkDemoApiKey,
  clientRateLimitKey,
} from "@/infrastructure/http/demo-access";

describe("MemoryRateLimiter", () => {
  it("allows up to maxRequests within the window then blocks", () => {
    const now = 1_000;
    const limiter = new MemoryRateLimiter(2, 1_000, () => now);

    expect(limiter.consume("a").allowed).toBe(true);
    expect(limiter.consume("a").allowed).toBe(true);
    const blocked = limiter.consume("a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets after the window moves forward", () => {
    let now = 1_000;
    const limiter = new MemoryRateLimiter(1, 500, () => now);

    expect(limiter.consume("b").allowed).toBe(true);
    expect(limiter.consume("b").allowed).toBe(false);
    now = 1_600;
    expect(limiter.consume("b").allowed).toBe(true);
  });
});

describe("checkDemoApiKey", () => {
  it("allows any request when no key is configured", () => {
    const req = new Request("http://localhost/api", { method: "POST" });
    expect(checkDemoApiKey(req, undefined).ok).toBe(true);
    expect(checkDemoApiKey(req, "  ").ok).toBe(true);
  });

  it("accepts x-api-key and Bearer when configured", () => {
    const withHeader = new Request("http://localhost/api", {
      method: "POST",
      headers: { "x-api-key": "secret" },
    });
    expect(checkDemoApiKey(withHeader, "secret").ok).toBe(true);

    const withBearer = new Request("http://localhost/api", {
      method: "POST",
      headers: { authorization: "Bearer secret" },
    });
    expect(checkDemoApiKey(withBearer, "secret").ok).toBe(true);
  });

  it("rejects missing key when configured", () => {
    const req = new Request("http://localhost/api", { method: "POST" });
    const result = checkDemoApiKey(req, "secret");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(401);
    }
  });
});

describe("clientRateLimitKey", () => {
  it("prefers first x-forwarded-for hop", () => {
    const req = new Request("http://localhost/api", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientRateLimitKey(req)).toBe("ip:1.2.3.4");
  });
});
