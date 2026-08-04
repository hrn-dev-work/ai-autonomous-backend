"use client";

import { useState, type FormEvent } from "react";
import { RefreshCw, Send } from "lucide-react";

import { generateDemoText } from "@/app/ai-chat/actions";
import { ResponseSkeleton } from "@/components/ai/response-skeleton";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type ResultData = {
  text: string;
  promptVersion: string;
  provider: string;
  attempts: number;
  latencyMs: number;
  usedMock: boolean;
};

export function AiChatPanel() {
  const [userMessage, setUserMessage] = useState(
    "社内FAQボット向けに、有給休暇の申請手順を3点で教えてください。",
  );
  const [simulateFailures, setSimulateFailures] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = await generateDemoText({
        userMessage,
        simulateTransientFailures: simulateFailures ? 2 : 0,
      });

      if (!payload.ok) {
        setError(`${payload.error.code}: ${payload.error.message}`);
        return;
      }
      setResult(payload.data);
    } catch {
      setError("リクエストに失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label
            htmlFor="user-message"
            className="text-sm font-medium text-[var(--ink)]"
          >
            ユーザー入力
          </label>
          <Textarea
            id="user-message"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            maxLength={4000}
            required
            disabled={loading}
            placeholder="生成したい内容を入力…"
          />
          <p className="text-xs text-[var(--muted)] tabular-nums">
            {userMessage.length} / 4000
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-[var(--accent)]"
            checked={simulateFailures}
            onChange={(e) => setSimulateFailures(e.target.checked)}
            disabled={loading}
          />
          <span>
            <span className="font-medium text-[var(--ink)]">
              一時障害をシミュレート
            </span>
            <span className="mt-0.5 block text-[var(--muted)]">
              最初の2回を失敗させ、インフラ層のリトライで復帰する様子をデモします。
            </span>
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading || userMessage.trim() === ""}>
            {loading ? (
              <Spinner className="text-[var(--accent-fg)]" />
            ) : (
              <Send className="size-4" />
            )}
            {loading ? "生成中…" : "生成する"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => {
              setResult(null);
              setError(null);
              setUserMessage("");
            }}
          >
            <RefreshCw className="size-4" />
            クリア
          </Button>
        </div>
      </form>

      <section className="min-h-[280px]" aria-label="生成結果">
        {loading && <ResponseSkeleton />}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]"
          >
            {error}
          </div>
        )}

        {!loading && !error && result && (
          <article className="flex h-full flex-col rounded-md border border-[var(--line)] bg-[var(--surface)]">
            <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[var(--line)] px-4 py-2.5 text-xs text-[var(--muted)]">
              <span className="font-medium text-[var(--ink)]">応答</span>
              <span className="tabular-nums">attempts {result.attempts}</span>
              <span className="tabular-nums">{result.latencyMs} ms</span>
              <span>prompt {result.promptVersion}</span>
              <span>{result.usedMock ? "mock provider" : result.provider}</span>
            </header>
            <pre className="flex-1 whitespace-pre-wrap px-4 py-4 font-sans text-sm leading-relaxed text-[var(--ink)]">
              {result.text}
            </pre>
          </article>
        )}

        {!loading && !error && !result && (
          <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-[var(--line)] bg-[var(--surface)]/60 px-6 text-center text-sm text-[var(--muted)]">
            生成結果がここに表示されます。応答待ちはスケルトンで状態を示します。
            ブラウザは Server Action 経由（API キー不要）。curl は
            GENERATE_API_KEY が必要です。
          </div>
        )}
      </section>
    </div>
  );
}
