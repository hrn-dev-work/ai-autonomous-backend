import type { TextGenerator } from "@/domain/ai/ports";
import {
  LlmRetryExhaustedError,
  LlmTimeoutError,
  LlmTransientError,
} from "@/domain/ai/errors";
import type {
  GenerateTextRequest,
  GenerateTextResult,
} from "@/domain/ai/types";
import {
  MockLlmClient,
  abortableSleep,
  withTimeout,
} from "./mock-llm-client";
import type { LlmClient } from "./types";

function isRetryable(error: unknown): boolean {
  return error instanceof LlmTimeoutError || error instanceof LlmTransientError;
}

/**
 * Resilient LLM facade: timeout + exponential backoff retries + AbortSignal cancellation.
 *
 * Intent of retry logic:
 * Upstream LLM APIs (and network edges) are flaky — 429s, brief 5xx, slow cold starts.
 * A single failed call should not fail a LINE webhook or internal tool request when a
 * short retry recovers the user experience. Timeouts bound worst-case hang (and abort
 * in-flight work); retries absorb transient faults without unbounded loops.
 */
export class ResilientLlmClient implements TextGenerator {
  constructor(private readonly inner: LlmClient = new MockLlmClient()) {}

  async generate(request: GenerateTextRequest): Promise<GenerateTextResult> {
    const started = Date.now();
    const { maxAttempts, retryBaseDelayMs, timeoutMs } = request.constraints;
    let lastError: unknown;
    let attemptsUsed = 0;
    /** Reflects the concrete client, not the declared provider label. */
    const usedMock = this.inner instanceof MockLlmClient;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      attemptsUsed = attempt + 1;
      try {
        const completion = await withTimeout(
          (signal) => this.inner.complete(request, attempt, signal),
          timeoutMs,
        );

        return {
          text: completion.text,
          promptVersion: request.promptVersion,
          provider: request.provider,
          attempts: attemptsUsed,
          latencyMs: Date.now() - started,
          usedMock,
        };
      } catch (error) {
        lastError = error;
        const canRetry = isRetryable(error) && attempt < maxAttempts - 1;
        if (!canRetry) {
          break;
        }
        const delay = retryBaseDelayMs * 2 ** attempt;
        // Backoff can be interrupted if process shuts down; use a detached short sleep.
        await abortableSleep(delay, new AbortController().signal);
      }
    }

    const message =
      lastError instanceof Error ? lastError.message : "unknown provider error";
    throw new LlmRetryExhaustedError(attemptsUsed, message);
  }
}

export function createDefaultTextGenerator(): TextGenerator {
  return new ResilientLlmClient(new MockLlmClient());
}

/** @deprecated Prefer createDefaultTextGenerator — kept as alias for clarity in older notes. */
export function createDefaultLlmClient(): ResilientLlmClient {
  return new ResilientLlmClient(new MockLlmClient());
}
