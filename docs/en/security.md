# Demo API access control

## Plain language

1. **Browser demo** (`/ai-chat`) uses a **Server Action**. No API key in the browser.
2. **HTTP API** (`POST /api/ai/generate`) requires **`GENERATE_API_KEY`** when that env var is set (recommended on Vercel production).
3. **Rate limiting** always applies. Prefer **Upstash Redis** on multi-instance hosts; otherwise in-memory per isolate.

## Headers (HTTP API)

| Mode | Client sends |
|------|----------------|
| Key unset (local default) | nothing extra |
| Key set (production) | `x-api-key: <key>` or `Authorization: Bearer <key>` |

Never put `GENERATE_API_KEY` in `NEXT_PUBLIC_*`.

## Env

| Variable | Default | Meaning |
|----------|---------|---------|
| `GENERATE_API_KEY` | (empty local) | Required for HTTP API when set |
| `GENERATE_RATE_LIMIT_MAX` | `30` | Max requests per window per key |
| `GENERATE_RATE_LIMIT_WINDOW_MS` | `60000` | Window length in ms |
| `UPSTASH_REDIS_REST_URL` | (empty) | Enables shared rate limit via Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | (empty) | Upstash REST token |

## Cost controls (Vercel)

Dashboard (account owner): **Settings → Billing → Spend management** (or team spend limits).  
Set a monthly soft/hard cap so mock traffic cannot surprise-bill. CLI cannot always set this — check the dashboard after deploy.

Also watch: **Vercel project usage** / hobby plan limits.

## GitHub

- Dependabot: `.github/dependabot.yml`
- CI: `.github/workflows/ci.yml` (lint, test, build)
- Enable **secret scanning** + **push protection** + Dependabot alerts in repo Security settings (or via `gh` API)

## Responses

| Status | When |
|--------|------|
| 401 | API key required but missing/invalid (HTTP API only) |
| 429 | Rate limit exceeded |

Japanese: [../ja/security.md](../ja/security.md) · Agent: [../agents/security.md](../agents/security.md)
