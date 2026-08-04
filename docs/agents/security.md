# Security (agents)

## Demo surface

- `POST /api/ai/generate` is the only write-ish public API.
- **Always:** in-process rate limit (`MemoryRateLimiter`) keyed by client IP headers.
- **Optional:** `GENERATE_API_KEY` — when set, require Bearer or `x-api-key`.
- LLM providers are mocked by default; no secrets in `NEXT_PUBLIC_*`.

## Env (names only)

- `GENERATE_API_KEY`
- `GENERATE_RATE_LIMIT_MAX` (default 30)
- `GENERATE_RATE_LIMIT_WINDOW_MS` (default 60000)

## Human guides

- English: [../en/security.md](../en/security.md)
- Japanese: [../ja/security.md](../ja/security.md)

## Limits

- Rate limiter is **not** multi-instance-safe (single Node process). Document + ADR if you change that.
- Prompt text must not contain secrets or live PII.
