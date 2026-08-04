# 実装反省会ログ

コード実装後の振り返りを蓄積する。エージェントは `.cursor/rules/implementation-retrospective.mdc` に従い **新しいエントリを先頭に追記** する。

再発防止に効く改善は `.cursor/rules/*.mdc` へ反映する（本ログに「→ ルール更新: xxx」と書く）。

---

## テンプレート（コピー用）

```markdown
### YYYY-MM-DD — （変更概要 1 行）

- **変更**: （ファイル / 機能）
- **良かった点**:
- **改善点**:
- **ルール更新**: 無 / `implementation-core.mdc` §…
- **次回テスト**: Component / integration / system のどれを足すか
```

---

<!-- 以下、新しいエントリをこの行の上に追加 -->

### 2026-08-04 — next-phase: abort, port, rate limit

- **変更**: AbortSignal `withTimeout`/`abortableSleep`; `TextGenerator` port; `MemoryRateLimiter` + optional API key; docs
- **良かった点**: Tests prove hang aborts under 500ms; use case injects fake port without infra
- **改善点**: Multi-instance rate limit still needs Redis if public on many workers
- **ルール更新**: 無
- **次回テスト**: optional route-level integration with mocked Request (if needed)

### 2026-08-04 — vitest component tests for retry/timeout

- **変更**: Vitest harness · `ResilientLlmClient` / `withTimeout` / `GenerationJob` tests · `npm test`
- **良かった点**: ScriptedLlmClient isolates retry without real sleep budget; MockLlmClient path still covered
- **改善点**: withTimeout still does not cancel hung promises; no auth rate-limit (demo)
- **ルール更新**: 無
- **次回テスト**: API route component-integration with mocked use case (optional)

### 2026-08-04 — agent-self-review pass on LLM foundation mock

- **変更**: `resilient-llm-client` attempts count + `usedMock`; API invalid JSON → 400; FE response parse guards
- **良かった点**: Layer split (domain/usecase/config/infra) matches CONTEXT; lint+build green; prompts externalized
- **改善点**: No component tests for timeout/retry yet; withTimeout does not cancel inner work; unauthenticated demo API needs rate limit before public host
- **ルール更新**: 無
- **次回テスト**: Component tests for `GenerationJob` + `ResilientLlmClient` retry/timeout (ISTQB component level)

---
