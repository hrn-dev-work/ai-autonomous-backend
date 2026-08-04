# Security (agents)

## Surfaces

| Surface | Auth | Rate limit |
|---------|------|------------|
| Server Action `generateDemoText` | None (browser UI) | Yes (`ui:` prefix) |
| `POST /api/ai/generate` | `GENERATE_API_KEY` when set | Yes (`api:` prefix) |

## Backends

- **Upstash** when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set (shared across serverless isolates).
- Else **in-memory** `MemoryRateLimiter` (per isolate — not multi-instance strict).

## Env names only

- `GENERATE_API_KEY`
- `GENERATE_RATE_LIMIT_MAX` / `GENERATE_RATE_LIMIT_WINDOW_MS`
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

Never put secrets in `NEXT_PUBLIC_*`. LLM keys are not used in mock mode.

## Human docs

- [../en/security.md](../en/security.md)
- [../ja/security.md](../ja/security.md)

## GitHub / Vercel ops

- Dependabot + CI workflow under `.github/`
- Vercel spend caps: dashboard Billing (document only; not always CLI-configurable)
- Secret scanning / push protection: enable on public repo via UI or GitHub API
