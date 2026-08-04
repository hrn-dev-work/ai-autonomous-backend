# Domain documentation — consumer rules

## CONTEXT.md

- **Purpose:** Ubiquitous language only. One or two sentences per term + `_Avoid_` list.
- **Not for:** Implementation details, file-by-file specs, ticket backlogs.
- **Update when:** Grilling resolves a new term or kills an ambiguous synonym.
- **Location:** Repository root `CONTEXT.md`.

## ADRs (`docs/adr/`)

Write an ADR only when **all three** are true:

1. Hard to reverse later
2. Surprising without context
3. Result of a real trade-off (alternatives existed)

Format: Context → Decision → Consequences → (optional) Alternatives considered.

Number files: `0001-short-title.md`. Index in `docs/adr/README.md`.

## Spec precedence

Define per project. Default suggestion:

1. Design / visual decisions
2. Requirements / acceptance criteria
3. Architecture / [stack.md](./stack.md)
4. API / schema reference

When specs conflict, update the lower-priority doc— do not duplicate paragraphs across files.

## Multi-agent (Cursor + Gemini)

- Durable decisions belong in `CONTEXT.md`, `stack.md`, or an ADR — not only in one tool's chat.
- Stack changes: update `stack.md` and CONTEXT § Architecture together.
- Do not re-open an Accepted ADR unless the user asks.

## Language

- Agent docs (`CONTEXT.md`, this directory, ADRs): **English only**.
- Human docs: `docs/en/` and `docs/ja/` — one locale per file (see `docs-language` skill).
- Do not use the retired pattern of English + `---` + Japanese in one markdown file.
