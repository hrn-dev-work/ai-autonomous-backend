import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Shield, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
        <p className="text-sm font-semibold tracking-tight text-[var(--ink)]">
          AI Autonomous Backend
        </p>
        <Link
          href="/ai-chat"
          className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        >
          デモを開く
        </Link>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-16">
          <p className="text-sm font-medium text-[var(--accent)]">
            Portfolio sample · LLM foundation
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl sm:leading-[1.12]">
            AI Autonomous Backend
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            OpenAI / Claude API を見据えた生成AIバックエンド基盤のモック。
            プロンプトとロジックの分離、タイムアウトとリトライによる耐障害性をコードで示します。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/ai-chat"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              生成 UI を試す
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-[var(--ink)] ring-1 ring-[var(--line)] transition-colors hover:bg-[var(--surface)]"
            >
              構成を見る
            </a>
          </div>
        </section>

        <section
          id="architecture"
          className="border-t border-[var(--line)] bg-[var(--surface)]/70"
        >
          <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-3">
            <Feature
              icon={<Layers className="size-5" />}
              title="プロンプト外部化"
              body="src/config/prompts にシステムプロンプトを集約。運用時のチューニングをドメインから切り離します。"
            />
            <Feature
              icon={<Shield className="size-5" />}
              title="タイムアウトとリトライ"
              body="インフラ層で試行ごとに期限を切り、一時障害は指数バックオフで再試行。商用Webhook向きの骨格です。"
            />
            <Feature
              icon={<Sparkles className="size-5" />}
              title="クリーンな層分離"
              body="domain → usecase → infrastructure → app/api。モックLLMを差し替えるだけで実APIへ拡張できます。"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] py-6 text-center text-xs text-[var(--muted)]">
        Next.js · TypeScript · Clean Architecture portfolio mock
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="border-l-2 border-[var(--accent)] pl-4">
      <div className="mb-3 text-[var(--accent)]">{icon}</div>
      <h2 className="text-base font-semibold tracking-tight text-[var(--ink)]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
    </div>
  );
}
