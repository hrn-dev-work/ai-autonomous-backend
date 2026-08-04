# AI Autonomous Backend

## What this is (plain language)

This is a **demo app** that shows how to build a reliable AI reply feature for things like LINE bots and internal tools — not a thin wrapper around ChatGPT.

**In everyday terms, it proves three things:**

1. **Instructions for the AI are kept in one place** (easy to tune without rewriting the whole app).
2. **When the AI service is slow or fails briefly, the system waits with a limit and tries again** (so a single network hiccup does not crash the request).
3. **Business rules and “talking to the AI provider” are separated** (so you can swap mock → real OpenAI/Claude later).

**What you will see here:** a browser screen where you type a request and get a **mock** answer (fake AI with a short delay). No paid API key and **no database** are required.

This repository is a **portfolio sample** for technical review and hiring conversations. It is intentionally small.

**Live demo (mock only, no LLM API secrets):**  
https://ai-autonomous-backend.vercel.app/ai-chat  

- Browser UI: Server Action (no API key in the client)  
- External `POST /api/ai/generate`: requires production `GENERATE_API_KEY`  
- Security notes: [docs/en/security.md](docs/en/security.md)

Source: https://github.com/hrn-dev-work/ai-autonomous-backend

---

## Try it (about 2 minutes)

```bash
npm install
npm run dev
# engineers: npm test
```

1. Open http://localhost:3000 (overview).
2. Open http://localhost:3000/ai-chat (the interactive demo).
3. Type a question → “生成する”. Optional: turn on **一時障害をシミュレート** to watch automatic retries (the response metadata shows how many attempts ran).

Need a checklist format? [docs/en/getting-started.md](docs/en/getting-started.md)

---

## Who should read which section

| You are… | Read |
|----------|------|
| Non-engineer / client / PM | Sections above — enough to understand the demo purpose and try the UI |
| Engineer / reviewer | Below + [docs/en/](docs/en/) and [docs/agents/](docs/agents/) |

---

## Skill set (for engineering review)

| Area | Skills |
|------|--------|
| Backend | Next.js Route Handlers · clean architecture · TextGenerator port |
| LLM foundation | Mock provider · AbortSignal timeout · exponential retry |
| Prompt ops | `src/config/prompts` externalization |
| Frontend | `/ai-chat` · skeleton loading |
| Access control | In-memory rate limit · optional `GENERATE_API_KEY` |
| Quality | TypeScript strict · `next build` · Vitest (retry / timeout / domain) |

Agent-oriented detail (English): [docs/agents/skill-set.md](docs/agents/skill-set.md)

### API (optional)

```http
POST /api/ai/generate
Content-Type: application/json

{ "userMessage": "…", "simulateTransientFailures": 0 }
```

Set `"simulateTransientFailures": 2` to force the first two attempts to fail so retries appear in the response (`attempts`, `latencyMs`).

With production `GENERATE_API_KEY` set:

```bash
curl -s -X POST https://ai-autonomous-backend.vercel.app/api/ai/generate \
  -H 'Content-Type: application/json' \
  -H "x-api-key: $GENERATE_API_KEY" \
  -d '{"userMessage":"hello"}'
```

### Architecture (engineers)

```
src/app/api/ai/generate   → HTTP boundary
src/usecase/ai            → GenerateText use case (TextGenerator port)
src/domain/ai             → GenerationJob, errors, types, ports
src/infrastructure/llm    → Mock + ResilientLlmClient (timeout abort + retry)
src/infrastructure/http   → Rate limit + optional API key
src/config/prompts        → System prompts (not hard-coded in routes)
```

### More docs

- Human guides (English): [docs/en/README.md](docs/en/README.md)
- Domain glossary (agents): [CONTEXT.md](CONTEXT.md)
- Stack: [docs/agents/stack.md](docs/agents/stack.md)
- Why no DB: [docs/en/local-database.md](docs/en/local-database.md) · [ADR 0001](docs/adr/0001-nextjs-llm-foundation-mock.md)

## License

MIT (sample / portfolio)

---

# AI Autonomous Backend

## これは何か（やさしい説明）

LINEボットや社内ツール向けに、**AIの返答を返す仕組みを、商用でも崩れにくい形で作る見本**です。ChatGPT にただ繋いだだけのサンプルではありません。

**平たい言葉で言うと、次の3点を示します。**

1. **AIへの指示文を一か所で管理**している（アプリ全体を触らずにチューニングしやすい）。
2. **相手側が遅い・一瞬落ちても、待ち時間の上限とやり直しがある**（一度の通信ミスで全滅しにくい）。
3. **業務ルールと「AIサービスへの接続」が分かれている**（いまはモック → あとから OpenAI / Claude に差し替えやすい）。

**実際に見えるもの:** ブラウザで文章を送ると、**モック（本物のAIではない・少し待つだけの応答）**が返ります。有料APIキーも **データベースも不要** です。

ポートフォリオ用の小さな見本です。

**ライブデモ（モックのみ。LLM の秘密鍵は不要）:**  
https://ai-autonomous-backend.vercel.app/ai-chat  

- ブラウザ UI: Server Action（クライアントに API キー無し）  
- 外部 `POST /api/ai/generate`: 本番 `GENERATE_API_KEY` 必須  
- セキュリティ: [docs/ja/security.md](docs/ja/security.md)

ソース: https://github.com/hrn-dev-work/ai-autonomous-backend

---

## まず触る（約2分）

```bash
npm install
npm run dev
# 技術確認: npm test
```

1. http://localhost:3000 （概要）
2. http://localhost:3000/ai-chat （操作デモ）
3. 質問を入力 →「生成する」。任意で **一時障害をシミュレート** をオンにすると、自動リトライの様子が結果メタデータに出ます。

手順の詳細: [docs/ja/getting-started.md](docs/ja/getting-started.md)

---

## 読む人ごとの案内

| あなたは… | ここを読む |
|-----------|------------|
| 非エンジニア / クライアント / PM | 上の説明と「まず触る」だけで十分 |
| エンジニア / レビュア | 下の技術欄 ＋ [docs/ja/](docs/ja/)・[docs/agents/](docs/agents/) |

---

## スキルセット（技術レビュー用）

| 領域 | 内容 |
|------|------|
| Backend | Next.js Route Handlers · クリーンアーキテクチャ · TextGenerator ポート |
| LLM基盤 | モック · Abort 付きタイムアウト · 指数バックオフリトライ |
| プロンプト運用 | `src/config/prompts` への外部化 |
| Frontend | `/ai-chat` · スケルトンローディング |
| アクセス制御 | プロセス内レート制限 · 任意 `GENERATE_API_KEY` |
| Quality | TypeScript strict · `next build` · Vitest |

エージェント向け詳細（英語）: [docs/agents/skill-set.md](docs/agents/skill-set.md)

### API（任意）

```http
POST /api/ai/generate
Content-Type: application/json

{ "userMessage": "…", "simulateTransientFailures": 0 }
```

`"simulateTransientFailures": 2` で最初の2回を失敗させ、レスポンスの `attempts` / `latencyMs` でリトライを確認できます。

本番で `GENERATE_API_KEY` を設定済みの場合:

```bash
curl -s -X POST https://ai-autonomous-backend.vercel.app/api/ai/generate \
  -H 'Content-Type: application/json' \
  -H "x-api-key: $GENERATE_API_KEY" \
  -d '{"userMessage":"hello"}'
```

### アーキテクチャ（エンジニア向け）

```
src/app/api/ai/generate   → HTTP境界
src/usecase/ai            → テキスト生成ユースケース（TextGenerator ポート）
src/domain/ai             → GenerationJob・エラー・型・ポート
src/infrastructure/llm    → モック + ResilientLlmClient（Abort付きタイムアウト / リトライ）
src/infrastructure/http   → レート制限 + 任意 API キー
src/config/prompts        → システムプロンプト（ルートにハードコードしない）
```

### その他ドキュメント

- 人向けガイド（日本語）: [docs/ja/README.md](docs/ja/README.md)
- ドメイン用語（エージェント）: [CONTEXT.md](CONTEXT.md)
- スタック: [docs/agents/stack.md](docs/agents/stack.md)
- DB が無い理由: [docs/ja/local-database.md](docs/ja/local-database.md) · [ADR 0001](docs/adr/0001-nextjs-llm-foundation-mock.md)

## ライセンス

MIT（ポートフォリオサンプル）
