# ADR 0001: Next.js LLM foundation mock (no separate API/DB)

## Status

Accepted — 2026-08-04

## Context

Portfolio sample targeting ChatGPT/Claude integration, LINE bots, and internal AI tools.
The narrative is clean architecture + prompt externalization + commercial resilience,
not a full product with persistence.

## Decision

- Ship as a **single Next.js 15 App Router** repo (API routes + demo UI).
- LLM calls are a **mock with latency** behind a resilient facade (timeout + retry).
- **No PostgreSQL / Docker DB** for this sample.
- Deprecate machine default FastAPI+Postgres for this repository only.

## Consequences

- Faster local demo (`npm run dev`) without Compose.
- Real multi-service deploy would require a follow-up ADR (Nest/FastAPI split, secrets, rate limits).
