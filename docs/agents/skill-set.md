# Skill set (agents)

**English only.** Human-facing skill tables belong in both halves of root `README.md` (`docs-language` — EN top / JA bottom).  
Stack SSOT: [stack.md](./stack.md). Routing: `.cursor/rules/project-entry.mdc` + `~/.cursor/rules/global-agent-routing.mdc`.

---

## A. Product skills (this repo demonstrates)

| Area | Skills |
|------|--------|
| Backend | Next.js Route Handlers · clean architecture · TextGenerator port |
| API | REST · validation at HTTP boundary · rate limit · optional API key |
| Architecture | Domain ports · usecase · infrastructure (mock LLM + AbortSignal) |
| Integrations | Mock OpenAI/Claude facade; timeout + exponential retry |
| Prompt ops | Externalized system prompts under `src/config/prompts` |
| Frontend | `/ai-chat` generation UI with skeleton/spinner loading |
| Quality | TypeScript strict · `next build` · Vitest |
| Local ops | `npm run dev` · no DB for mock · `.env.example` rate-limit/API key names |

**Out of scope:** real paid API keys for LLM, LINE webhook production auth, multi-tenant billing, Postgres, multi-instance Redis rate limit.

---

## B. Cursor skills (procedures — read when the situation matches)

| Skill | When |
|-------|------|
| `docs-language` | README.md EN top + JA bottom; `docs/en\|ja` one locale; this directory stays English |
| `wsl-agent-invoke` | Shell, git, gh on WSL Ubuntu workspace |
| `bootstrap-project-foundation` | Missing `CONTEXT.md` or `project-entry.mdc` |
| `agent-session-closeout` | Substantial work finished (impl / docs / Git·PR) |
| `skill-learning-retrospective` | User asks for retrospective / skill updates |
| `conventional-pr-title` | Creating or editing GitHub PR titles |
| `distinctive-ui` | Frontend look / layout |
| `portfolio-conventions-audit` | Before claiming portfolio DoD done |
| `verification-before-done` | Before saying done / fixed |

---

## C. Rules (invariants)

### Repo (`.cursor/rules/`)

| Rule | When |
|------|------|
| `project-entry.mdc` | Always |
| `implementation-core.mdc` | Code edits |
| `implementation-review.mdc` | Explicit implementation-review / pre-commit |
| `testing-istqb.mdc` | Tests |
| `security-git.mdc` | Secrets · Git safety |
| `implementation-retrospective.mdc` | After implementation |

### Global (`~/.cursor/rules/`)

| Rule | When |
|------|------|
| `project-foundation.mdc` | Before non-trivial work · CONTEXT · grilling · security |
| `default-stack.mdc` | Defaults; prefer this repo’s [stack.md](./stack.md) + ADRs |
| `global-balanced-defaults.mdc` | Minimal change · quality · safety |
| `agent-wsl-git.mdc` | WSL / UNC shell and git |
| `git-commit-boundary.mdc` | Before commit / push / PR |

---

## D. Hooks (automation, not skills)

| Location | Event | Role |
|----------|-------|------|
| `~/.cursor/hooks.json` → `ensure-project-bootstrapped.sh` | `sessionStart` | Auto foundation bootstrap if CONTEXT / project-entry missing |
| `.cursor/hooks/track-code-edit.sh` | `afterFileEdit` | Track edits for retrospective |
| `.cursor/hooks/stop-retrospective.sh` | `stop` | Prompt post-work retrospective loop |

---

## E. Maintenance

Update section A and both README halves when product scope changes. Keep this file English-only.
