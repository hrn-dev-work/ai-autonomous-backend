# データ保存 / ローカル DB

## やさしい説明

このポートフォリオ見本は **データベースを使いません。**

デモでやることは:

- ブラウザ（または API）から文章を受け取り、
- サーバー上のモック AI 処理を動かし、
- テキストの返答を返す。

それだけです。後から見返すための保存はしません。Docker も PostgreSQL も `DATABASE_URL` も **不要** です。

## なぜ DB が無いか（短く）

「プロンプトの置き場所・タイムアウト／リトライ・層の分け方」に絞った LLM 基盤の見本にしているためです。永続化はスコープ外。詳細: [ADR 0001](../adr/0001-nextjs-llm-foundation-mock.md)。

## Compose / Postgres を期待していた場合

他プロダクト用テンプレートに `docker-compose.example.yml` が付くことがあります。**このリポジトリではスタブのみ**で、Postgres を起動する手順はありません。

| 項目 | このプロジェクト |
|------|------------------|
| Postgres / Docker DB | 使わない |
| `npm run dev` に必要なもの | Node.js と npm のみ |
| 秘密情報 / AI キー | モックでは不要 |

## 将来（未実装）

会話履歴やプロンプトの改定履歴などを載せるなら、先に ADR を書いてから Compose / マネージド Postgres を足します。グローバル既定の FastAPI + Postgres 前提にしないで、[stack.md](../agents/stack.md) と揃えてください。

English: [../en/local-database.md](../en/local-database.md)  
エージェント正本: [../agents/stack.md](../agents/stack.md)
