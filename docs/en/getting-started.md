# Getting started (EN)

## What you will get

A local web page that sends your text to a **mock** AI backend and shows the reply. Useful to understand prompt placement and retry behavior without cloud bills.

No database. No OpenAI/Claude API key for the default demo.

## Prerequisites

- Node.js 20 or newer
- npm

## Run (about 2 minutes)

```bash
cd /home/haruna/workspace/ai-autonomous-backend   # or your clone path
npm install
npm run dev
```

1. Open http://localhost:3000 — short product overview.  
2. Open http://localhost:3000/ai-chat — type a message and generate.  
3. Optional: enable “simulate transient failures” to watch retries in the result strip (`attempts`, time).

Stop the server with `Ctrl+C` in the terminal.

## Tests

```bash
npm test
```

Covers `GenerationJob` validation and resilient LLM timeout / retry behavior.

## Related

```bash
curl -s -X POST http://localhost:3000/api/ai/generate \
  -H 'Content-Type: application/json' \
  -d '{"userMessage":"Hello","simulateTransientFailures":0}'
```

## Related

- Why there is no Postgres: [local-database.md](./local-database.md)
- Japanese version: [../ja/getting-started.md](../ja/getting-started.md)
- Full overview: [../../README.md](../../README.md)
