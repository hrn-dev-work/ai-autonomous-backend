import {
  LlmTimeoutError,
  LlmTransientError,
} from "@/domain/ai/errors";
import type { GenerateTextRequest } from "@/domain/ai/types";
import type { LlmClient, LlmCompletion } from "./types";

/**
 * Sleep that stops early when the attempt is aborted (timeout / cancel).
 */
export function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError());
      return;
    }

    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    function onAbort(): void {
      clearTimeout(timer);
      reject(createAbortError());
    }

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function createAbortError(): Error {
  if (typeof DOMException !== "undefined") {
    return new DOMException("The operation was aborted", "AbortError");
  }
  const error = new Error("The operation was aborted");
  error.name = "AbortError";
  return error;
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof Error && error.name === "AbortError") ||
    (typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      error.name === "AbortError")
  );
}

/**
 * Mock LLM client: emulates network latency and optional transient failures.
 * Swap for real OpenAI/Claude adapters without changing use-case code.
 */
export class MockLlmClient implements LlmClient {
  constructor(private readonly latencyMs: number = 1_200) {}

  async complete(
    request: GenerateTextRequest,
    attemptIndex: number,
    signal: AbortSignal,
  ): Promise<LlmCompletion> {
    const failUntil = request.simulateTransientFailures ?? 0;
    if (attemptIndex < failUntil) {
      await abortableSleep(180, signal);
      throw new LlmTransientError(
        `simulated provider outage (attempt ${attemptIndex + 1})`,
      );
    }

    await abortableSleep(this.latencyMs, signal);

    const charBudget = Math.min(
      request.userMessage.length * 4,
      request.constraints.maxOutputTokens * 4,
    );

    const body = [
      "【モック応答】商用LLM（OpenAI / Claude）の代わりに遅延付きモックが応答しています。",
      "",
      `入力要約: ${request.userMessage.slice(0, 120)}${request.userMessage.length > 120 ? "…" : ""}`,
      "",
      "この基盤ではシステムプロンプトを config から注入し、タイムアウトとリトライをインフラ層で担保しています。",
      `（promptVersion=${request.promptVersion}, provider=${request.provider}）`,
    ].join("\n");

    const text = body.slice(0, Math.max(charBudget, 80));
    return { text };
  }
}

/**
 * Runs work under a deadline and aborts the shared AbortSignal when time is up
 * so in-flight sleeps/fetch can stop early instead of leaking work after timeout.
 */
export async function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    return await run(controller.signal);
  } catch (error) {
    if (timedOut || isAbortError(error) || controller.signal.aborted) {
      throw new LlmTimeoutError(timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
