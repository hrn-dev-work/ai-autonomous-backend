# ai-autonomous-backend

Portfolio mock of a commercial-ready LLM backend foundation for LINE bots and internal AI tools: externalized prompts, timeout/retry resilience, and clean architecture — not a thin API wrapper.

Detailed specs live under `docs/`. This file is the **domain glossary** and **implementation traps** for agents— not a spec, not a scratch pad.

**Agents (Cursor, Gemini, others):** read this file + `docs/agents/` before non-trivial work. Committed docs beat chat-only decisions.

---

## Domain Language

**GenerationJob**:
Validated user generation request carrying domain constraints (token budget, timeout, max retries). Created at the use-case boundary via `GenerationJob.create`.
_Avoid_: calling raw HTTP bodies a “job” without validation.

**System prompt (externalized)**:
Instruction text that shapes model behavior, stored under `src/config/prompts` — never inlined in routes or UI.
_Avoid_: hardcoding prompts in `route.ts` or React components.

**Resilient LLM call**:
Single provider attempt with a timeout; retries on transient/timeout errors with exponential backoff, bounded by `maxAttempts`.
_Avoid_: unbounded retries or hang-forever awaits.

**Mock provider**:
Delayed fake completion that stands in for OpenAI/Claude so the portfolio demos resilience without real API keys.
_Avoid_: treating mock output as a real model capability claim.

---

## Relationships

- 1 GenerationJob → 1 GenerateText use case execution
- 1 use case → 1..N resilient provider attempts (until success or exhaust)
- System prompt config → injected into every GenerateTextRequest (not stored on the job entity)

---

## System Architecture & Constraints

**Stack for this repo** (see ADR `docs/adr/0001-nextjs-llm-foundation-mock.md` + `docs/agents/stack.md`):

| Layer | Choice |
|-------|--------|
| App | Next.js 15 App Router (API routes + UI) |
| Language | TypeScript (strict, no `any`) |
| UI | Tailwind CSS 4 · shadcn-style components · Lucide |
| LLM | Mock client + resilient facade (real OpenAI/Claude adapters out of band) |
| Persistence | None (no DB for this sample) |
| Tests | Typecheck via `next build`; expand with Vitest as needed |
| Hosting | Vercel-ready (`npm run build`) |
| Agent host | WSL Ubuntu (`/home/haruna/workspace/ai-autonomous-backend`) |

Layout:

```
src/app/api/...           endpoints
src/domain/ai/...         entities + errors + types
src/usecase/ai/...        generation use cases
src/infrastructure/llm/... mock + timeout/retry + AbortSignal
src/infrastructure/http/... rate limit + optional API key
src/config/prompts/...    externalized system prompts
src/components/...        UI
```

Full detail: [docs/agents/stack.md](docs/agents/stack.md).

---

## Common Ambiguities

- **provider `openai` / `claude`**: rejected at the HTTP boundary in this demo — only `"mock"` is available (no live paid API keys).
- **Prompt version** in API responses is the config constant, not a DB revision history.
- Global default stack (FastAPI + Postgres) does **not** apply here; this sample is Next.js-only by ADR.

---

## Security Guardrails

See [docs/agents/security.md](docs/agents/security.md). Summary:

- Demo API has **in-memory rate limiting** always; optional `GENERATE_API_KEY` for public hosts.
- No real LLM provider keys required for mock; never commit OpenAI/Anthropic secrets if adapters are added.
- Validate input length and types at the route + domain boundary.
- Timeouts **abort** in-flight mock work via `AbortSignal` (not only racing the Promise).

---

## Architecture decisions

- [0001-nextjs-llm-foundation-mock.md](docs/adr/0001-nextjs-llm-foundation-mock.md)

---

## Flagged ambiguities (open)

- Real OpenAI/Claude adapter wiring + secret management
- Multi-instance rate limit store (Redis) if public multi-process host

---

## Decision log

| Date | Decision | Status |
|------|----------|--------|
| 2026-08-04 | Portfolio sample uses Next.js App Router monorepo mock (no Postgres) | Accepted |
| 2026-08-04 | Prompts live in `src/config/prompts`; resilience in infrastructure | Accepted |
| 2026-08-04 | Demo UI path `/ai-chat` | Accepted |
| 2026-08-04 | TextGenerator port; AbortSignal timeouts; rate limit + optional API key | Accepted |
