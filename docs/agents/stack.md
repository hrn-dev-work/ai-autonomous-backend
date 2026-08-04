# Standard stack (this repository)

**Source of truth for agents** (Cursor, Gemini, and others). Do not invent alternate languages, databases, or frameworks unless an Accepted ADR overrides this file.

Global default (machine-local): `~/.cursor/rules/default-stack.mdc`  
Repo copy (committed): **this file** — prefer this when collaborating across tools.

## Choices

| Layer | Choice |
|-------|--------|
| Backend / API | Next.js App Router Route Handlers (`src/app/api`) |
| Frontend | Next.js 15 + React 19 + TypeScript |
| Styling | Tailwind CSS 4 · shadcn-style primitives · Lucide icons |
| Architecture | Clean layers: domain · usecase · infrastructure · config · app |
| LLM | Mock + resilient client (timeout, exponential retry); real providers optional later |
| DB | None for this portfolio mock (no Postgres requirement) |
| Validation | Domain entity + route boundary checks (no Zod required yet) |
| Packages | npm |
| Tests | Vitest (`npm test`) — domain + resilient LLM retry/timeout |
| Hosting | Vercel (or Node `next start`) |

## Environment

| Concern | Default |
|---------|---------|
| Local web | `npm run dev` → `http://localhost:3000` |
| Health demo | `POST /api/ai/generate` |
| Env files | `.env` ignored; no secrets needed for mock |
| Agent host | WSL Ubuntu |

## Layout

```
src/app/                 # UI + route handlers
src/domain/ai/           # entities, errors, types
src/usecase/ai/          # application services
src/infrastructure/llm/  # mock provider + resilience
src/config/prompts/      # externalized system prompts
docs/                    # agents (EN) · en/ · ja/ · adr/
```

## Exceptions

Default machine stack (FastAPI + PostgreSQL) is **not** used. See ADR `0001-nextjs-llm-foundation-mock.md`.

## Multi-agent (Cursor + Gemini)

- **SSOT:** `CONTEXT.md`, this file, `docs/adr/`, `docs/agents/security.md`
- **Secrets:** never put LLM API keys in `NEXT_PUBLIC_*` or client bundles
- **Doc locales:** human guides in `docs/en` / `docs/ja`; this file stays English
