# AI Autonomous Backend（日本語）

[![日本語](https://img.shields.io/badge/%E6%97%A5%E6%9C%AC%E8%AA%9E-0969da?style=for-the-badge)](./README.md) [![English](https://img.shields.io/badge/English-57606a?style=for-the-badge)](./README.en.md)

## これは何か（やさしい説明）

LINEボットや社内ツール向けに、**AIの返答を返す仕組みを、商用でも崩れにくい形で作る見本**です。ChatGPT にただ繋いだだけのサンプルではありません。

**平たい言葉で言うと、次の3点を示します。**

1. **AIへの指示文を一か所で管理**している（アプリ全体を触らずにチューニングしやすい）。
2. **相手側が遅い・一瞬落ちても、待ち時間の上限とやり直しがある**（一度の通信ミスで全滅しにくい）。
3. **業務ルールと「AIサービスへの接続」が分かれている**（いまはモック → あとから OpenAI / Claude に差し替えやすい）。

**実際に見えるもの:** ブラウザで文章を送ると、**モック（本物のAIではない・少し待つだけの応答）**が返ります。有料APIキーも **データベースも不要** です。

ポートフォリオ用の小さな見本です。

**ライブデモ（モックのみ。LLM の秘密鍵は不要）:**\
https://ai-autonomous-backend.vercel.app/ai-chat\

- ブラウザ UI: Server Action（クライアントに API キー無し）\
- 外部 `POST /api/ai/generate`: 本番 `GENERATE_API_KEY` 必須\
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
