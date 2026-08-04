import { Spinner } from "@/components/ui/spinner";

export function ResponseSkeleton() {
  return (
    <div
      className="space-y-3 rounded-md border border-[var(--line)] bg-[var(--surface)] p-4"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Spinner />
        <span>LLM 応答を待機中（タイムアウト / リトライあり）…</span>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-11/12 animate-pulse rounded-sm bg-[var(--surface-2)]" />
        <div className="h-3 w-9/12 animate-pulse rounded-sm bg-[var(--surface-2)]" />
        <div className="h-3 w-10/12 animate-pulse rounded-sm bg-[var(--surface-2)]" />
        <div className="h-3 w-6/12 animate-pulse rounded-sm bg-[var(--surface-2)]" />
      </div>
    </div>
  );
}
