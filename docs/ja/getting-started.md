# はじめ方 (JA)

## できあがるもの

ローカルの Web 画面から文章を送ると、**モック**の AI バックエンドが返答を返す見本です。クラウド課金なしで、「指示文の置き場所」や「失敗時のやり直し」を体験できます。

データベース不要。通常デモでは OpenAI / Claude の API キーも不要です。

## 前提

- Node.js 20 以上
- npm

## 起動（約2分）

```bash
cd /home/haruna/workspace/ai-autonomous-backend   # クローン先のパスに合わせてください
npm install
npm run dev
```

1. http://localhost:3000 — 概要  
2. http://localhost:3000/ai-chat — 文章を入力して生成  
3. 任意: 「一時障害をシミュレート」をオンにすると、結果の `attempts` や所要時間でリトライが見えます  

終了はターミナルで `Ctrl+C`。

## テスト

```bash
npm test
```

`GenerationJob` の検証と、LLM のタイムアウト／リトライ挙動をカバーします。

## 任意: API を直接呼ぶ

```bash
curl -s -X POST http://localhost:3000/api/ai/generate \
  -H 'Content-Type: application/json' \
  -d '{"userMessage":"こんにちは","simulateTransientFailures":0}'
```

## 関連

- Postgres が無い理由: [local-database.md](./local-database.md)
- English: [../en/getting-started.md](../en/getting-started.md)
- 全体の概要: [../../README.md](../../README.md)
