# Demo API access control

## Plain language

The demo generate API is open for local use, but:

1. **Rate limiting** always applies (default: 30 requests / IP / minute, in-process memory).
2. **Optional API key** — set `GENERATE_API_KEY` when hosting publicly so only people with the key can call the API.

This is still a portfolio demo. For multi-instance production, replace the in-memory limiter with Redis/edge limits and real identity/auth.

## Headers

| Mode | Client sends |
|------|----------------|
| Key unset | nothing extra |
| Key set | `x-api-key: <key>` or `Authorization: Bearer <key>` |

## Env

| Variable | Default | Meaning |
|----------|---------|---------|
| `GENERATE_API_KEY` | (empty) | When set, required for `POST /api/ai/generate` |
| `GENERATE_RATE_LIMIT_MAX` | `30` | Max requests per window per IP key |
| `GENERATE_RATE_LIMIT_WINDOW_MS` | `60000` | Window length in ms |

## Responses

| Status | When |
|--------|------|
| 401 | API key required but missing/invalid |
| 429 | Rate limit exceeded (`Retry-After` header) |

Never put real OpenAI/Anthropic keys in `NEXT_PUBLIC_*`.  
Agent note: [../agents/security.md](../agents/security.md) · Japanese: [../ja/security.md](../ja/security.md)
