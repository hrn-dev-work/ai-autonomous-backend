# AI Autonomous Backend

[![日本語](https://img.shields.io/badge/%E6%97%A5%E6%9C%AC%E8%AA%9E-57606a?style=for-the-badge)](./README.md) [![English](https://img.shields.io/badge/English-0969da?style=for-the-badge)](./README.en.md)

## What this is (plain language)

This is a **demo app** that shows how to build a reliable AI reply feature for things like LINE bots and internal tools — not a thin wrapper around ChatGPT.

**In everyday terms, it proves three things:**

1. **Instructions for the AI are kept in one place** (easy to tune without rewriting the whole app).
2. **When the AI service is slow or fails briefly, the system waits with a limit and tries again** (so a single network hiccup does not crash the request).
3. **Business rules and “talking to the AI provider” are separated** (so you can swap mock → real OpenAI/Claude later).

**What you will see here:** a browser screen where you type a request and get a **mock** answer (fake AI with a short delay). No paid API key and **no database** are required.

This repository is a **portfolio sample** for technical review and hiring conversations. It is intentionally small.

**Live demo (mock only, no LLM API secrets):**\
https://ai-autonomous-backend.vercel.app/ai-chat\

- Browser UI: Server Action (no API key in the client)\
- External `POST /api/ai/generate`: requires production `GENERATE_API_KEY`\
- Security notes: [docs/en/security.md](docs/en/security.md)

Source: https://github.com/hrn-dev-work/ai-autonomous-backend

---

## Try it (about 2 minutes)

```bash
npm install
npm run dev
# engineers: npm test
```

1. Open http://localhost:3000 (overview).
2. Open http://localhost:3000/ai-chat (the interactive demo).
3. Type a question → **Generate**. Optional: turn on **Simulate transient failure** to watch automatic retries (the response metadata shows how many attempts ran).

Need a checklist format? [docs/en/getting-started.md](docs/en/getting-started.md)

---

## Who should read which section

| You are… | Read |
|----------|------|
| Non-engineer / client / PM | Sections above — enough to understand the demo purpose and try the UI |
| Engineer / reviewer | Below + [docs/en/](docs/en/) and [docs/agents/](docs/agents/) |

---

## Skill set (for engineering review)

| Area | Skills |
|------|--------|
| Backend | Next.js Route Handlers · clean architecture · TextGenerator port |
| LLM foundation | Mock provider · AbortSignal timeout · exponential retry |
| Prompt ops | `src/config/prompts` externalization |
| Frontend | `/ai-chat` · skeleton loading |
| Access control | In-memory rate limit · optional `GENERATE_API_KEY` |
| Quality | TypeScript strict · `next build` · Vitest (retry / timeout / domain) |

Agent-oriented detail (English): [docs/agents/skill-set.md](docs/agents/skill-set.md)

### API (optional)

```http
POST /api/ai/generate
Content-Type: application/json

{ "userMessage": "…", "simulateTransientFailures": 0 }
```

Set `"simulateTransientFailures": 2` to force the first two attempts to fail so retries appear in the response (`attempts`, `latencyMs`).

With production `GENERATE_API_KEY` set:

```bash
curl -s -X POST https://ai-autonomous-backend.vercel.app/api/ai/generate \
  -H 'Content-Type: application/json' \
  -H "x-api-key: $GENERATE_API_KEY" \
  -d '{"userMessage":"hello"}'
```

### Architecture (engineers)

```
src/app/api/ai/generate   → HTTP boundary
src/usecase/ai            → GenerateText use case (TextGenerator port)
src/domain/ai             → GenerationJob, errors, types, ports
src/infrastructure/llm    → Mock + ResilientLlmClient (timeout abort + retry)
src/infrastructure/http   → Rate limit + optional API key
src/config/prompts        → System prompts (not hard-coded in routes)
```

### More docs

- Human guides (English): [docs/en/README.md](docs/en/README.md)
- Domain glossary (agents): [CONTEXT.md](CONTEXT.md)
- Stack: [docs/agents/stack.md](docs/agents/stack.md)
- Why no DB: [docs/en/local-database.md](docs/en/local-database.md) · [ADR 0001](docs/adr/0001-nextjs-llm-foundation-mock.md)

## License

MIT (sample / portfolio)
