# Data store / local database

## Plain language

This portfolio sample **does not use a database**.

The demo only:

- accepts text in the browser (or API),
- runs mock AI logic on the server,
- returns a text response.

Nothing is saved for later. You do **not** need Docker, PostgreSQL, or `DATABASE_URL` to run the app.

## Why (short)

Architecture choice: a focused LLM-foundation mock (prompts + timeout/retry + clean layers). Persistence is out of scope. See [ADR 0001](../adr/0001-nextjs-llm-foundation-mock.md).

## If you expected Compose Postgres

Bootstrap templates sometimes include `docker-compose.example.yml` for other stack defaults. **In this repository that file is a stub only** — starting Postgres is not part of local setup.

| Item | This project |
|------|----------------|
| Postgres / Docker DB | Not used |
| Required for `npm run dev` | Node.js + npm only |
| Secrets / AI keys | Not required for mock mode |

## Later (not implemented)

If the product grows (user history, prompt version history, audit logs), add an ADR first, then compose / managed Postgres per that decision. Do not assume the global default FastAPI+Postgres stack without updating [stack.md](../agents/stack.md).

Japanese: [../ja/local-database.md](../ja/local-database.md)  
Agent SSOT: [../agents/stack.md](../agents/stack.md)
