# ai-autonomous-backend — Cursor Rules

| File | Trigger | Purpose |
|------|---------|---------|
| `project-entry.mdc` | Every session (only alwaysApply) | Routing table |
| `implementation-core.mdc` | Code edits (glob) | DDD, naming, loose coupling |
| `implementation-review.mdc` | Explicit **implementation-review** / pre-commit | 7-stage sequential review → `docs/reviews/latest.md` |
| `testing-istqb.mdc` | Test edits (glob) | ISTQB-aligned testing |
| `security-git.mdc` | scripts / env edits (glob) | Secrets and Git safety |
| `implementation-retrospective.mdc` | After impl / stop hook (glob) | Retrospective append |

<!-- Add project-specific rules below -->

## Relationship to global User Rules

- **Canonical globals:** `~/.cursor/rules/` (WSL). Router: `global-agent-routing.mdc`. Mandatory: `global-work-strict.mdc`.
- **Precedence:** globals are **mandatory** for all work. This repo’s `.cursor/rules/` + `docs/` may **add** constraints (or stack via ADR); they must **not** waive global invariants (security, docs-language, WSL, browser-chrome, proceed gate, commit boundary, session SSOT, etc.).
- Detail: `~/.cursor/rules/global-work-strict.mdc`

Template source: `~/.cursor/templates/project-rules/`
