import type { Metadata } from "next";
import Link from "next/link";

import { AiChatPanel } from "@/components/ai/ai-chat-panel";

export const metadata: Metadata = {
  title: "AI Chat | AI Autonomous Backend",
  description: "LLM generation playground with timeout and retry visibility",
};

export default function AiChatPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-[var(--ink)]"
          >
            AI Autonomous Backend
          </Link>
          <span className="text-xs text-[var(--muted)]">
            POST /api/ai/generate
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            生成プレイグラウンド
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            プロンプトは{" "}
            <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[13px]">
              src/config/prompts
            </code>{" "}
            から注入。タイムアウトとリトライはインフラ層で表現しています。
          </p>
        </div>
        <AiChatPanel />
      </main>
    </div>
  );
}
