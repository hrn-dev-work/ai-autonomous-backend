# デモ API のアクセス制御

## やさしい説明

1. **ブラウザデモ**（`/ai-chat`）は **Server Action** 経由。ブラウザに API キーは不要。
2. **HTTP API**（`POST /api/ai/generate`）は、環境変数 **`GENERATE_API_KEY`** があるとき鍵必須（Vercel 本番で推奨）。
3. **レート制限**は常時。複数インスタンスでは **Upstash Redis** 推奨。未設定時はインスタンス内メモリ。

## ヘッダ（HTTP API）

| モード | 送るもの |
|--------|----------|
| キー未設定（ローカル既定） | 追加不要 |
| キー設定あり（本番） | `x-api-key` または `Authorization: Bearer` |

`GENERATE_API_KEY` を `NEXT_PUBLIC_*` に入れないでください。

## 環境変数

| 変数 | 既定 | 意味 |
|------|------|------|
| `GENERATE_API_KEY` | （ローカルは空） | 設定時は HTTP API に必須 |
| `GENERATE_RATE_LIMIT_MAX` | `30` | ウィンドウあたり上限 |
| `GENERATE_RATE_LIMIT_WINDOW_MS` | `60000` | ウィンドウ長 ms |
| `UPSTASH_REDIS_REST_URL` | （空） | 共有レート制限用 |
| `UPSTASH_REDIS_REST_TOKEN` | （空） | Upstash REST トークン |

## コスト上限（Vercel）

ダッシュボード: **Settings → Billing → Spend management**（チームの支出上限）。  
CLI では設定できないことがあるため、デプロイ後にダッシュボードで確認してください。

## GitHub

- Dependabot: `.github/dependabot.yml`
- CI: lint / test / build
- **secret scanning** / **push protection** を Security で有効化

## 応答

| ステータス | いつ |
|------------|------|
| 401 | API キー必須だが不正（HTTP API のみ） |
| 429 | レート制限 |

English: [../en/security.md](../en/security.md)
