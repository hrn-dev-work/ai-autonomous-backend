# Agent documentation index

Read in this order before non-trivial implementation:

1. **`CONTEXT.md`** (repo root) — domain language, traps, **security guardrails**, stack summary
2. **[stack.md](./stack.md)** — standard languages / DB / runtime (SSOT for Cursor **and** Gemini)
3. **[security.md](./security.md)** — secrets, OWASP / IPA baseline, static analysis
4. **[skill-set.md](./skill-set.md)** — product skills + Cursor skills/rules/hooks for this repo
5. **`docs/adr/`** — irreversible decisions (if any ADRs exist)
6. **Project specs** — human docs under `docs/en/` (and `docs/ja/` for Japanese readers); root `README.md`
7. **Git / PR playbook** — project-specific link below (if present)

**Language:** Files in this directory, `CONTEXT.md`, and ADRs are **English only**. Do not mix JA into them. Human JA docs live in `docs/ja/`. Policy: `docs-language` skill.

## This repository

| Doc | Purpose |
|-----|---------|
| [Standard stack](./stack.md) | Languages / DB / runtime; multi-agent SSOT (see ADR if exception) |
| [Skill set](./skill-set.md) | Product skills + Cursor skills / rules / hooks inventory |
| [Domain consumer rules](./domain.md) | How to read and update `CONTEXT.md` / ADRs |
| [Reviews (en)](../en/reviews.md) | 7-stage implementation-review; report under `docs/reviews/` |
| [ADR index](../adr/README.md) | Architecture decision records |
| [Getting started (en)](../en/getting-started.md) | First hour in this app repo |
| [Human docs (en)](../en/README.md) | English guides for people |
| [Human docs (ja)](../ja/README.md) | Japanese guides for people |

## Multi-agent handoff (Cursor ↔ Gemini)

| Rule | Detail |
|------|--------|
| SSOT | Committed files in this directory + `CONTEXT.md` + ADRs — not chat alone |
| Before switching tools | Persist decisions (stack exception, auth, API shape) into those files |
| Conflict | Ask the user; do not silently override an Accepted ADR |

## Git & PR (link only — do not duplicate)

Add a row when your project has a playbook:

| Doc | Purpose |
|-----|---------|
| _(none yet)_ | Add `docs/agent-git-playbook.md` or similar when needed |

## Public vs local agent files

Some repos gitignore `AGENTS.md` and `.cursor/`. **Committed** agent entry points are `CONTEXT.md` and this directory (including `stack.md` and `skill-set.md`).

Bootstrap source: `~/.cursor/templates/project-foundation/` via `bootstrap-project-foundation.sh`.
