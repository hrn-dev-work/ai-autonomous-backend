# Human documentation (English)

Guides for people reading this portfolio sample (not agent rules).

Agent-facing docs stay English-only at the repo root / `docs/agents/` / `docs/adr/`.  
Japanese human guides: `docs/ja/`.

Do **not** mix English and Japanese inside files under this tree. Root `README.md` is Japanese and `README.en.md` is English, with Japanese-first language buttons at the top of both files. Policy: `docs-language` skill.

## Start here

| Doc | For |
|-----|-----|
| [Getting started](./getting-started.md) | Install, run, open the demo UI |
| [Local database / data store](./local-database.md) | **This sample has no DB** — read this if you expected Postgres |
| [Security / rate limit](./security.md) | Demo API rate limit + optional API key |
| [Reviews](./reviews.md) | Optional engineering review protocol |

## Product in one line

Mock AI generation demo: externalized prompts + timeout/retry + clean layers. No paid LLM key and no Postgres required.

Root overview (bilingual): [../../README.md](../../README.md)
