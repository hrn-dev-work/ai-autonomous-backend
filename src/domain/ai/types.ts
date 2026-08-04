/**
 * Domain-level AI contracts. No Next.js or vendor SDK types here.
 */

export type LlmProvider = "mock" | "openai" | "claude";

export interface GenerationConstraints {
  /** Soft max output tokens (enforced as character budget in the mock). */
  readonly maxOutputTokens: number;
  /** Hard deadline for a single provider attempt (ms). */
  readonly timeoutMs: number;
  /** Total attempts including the first call. */
  readonly maxAttempts: number;
  /** Base backoff before retry (ms); grows exponentially. */
  readonly retryBaseDelayMs: number;
}

export interface GenerateTextRequest {
  readonly userMessage: string;
  readonly systemPrompt: string;
  readonly promptVersion: string;
  readonly provider: LlmProvider;
  readonly constraints: GenerationConstraints;
  /** Demo switch: force transient failures on early attempts. */
  readonly simulateTransientFailures?: number;
}

export interface GenerateTextResult {
  readonly text: string;
  readonly promptVersion: string;
  readonly provider: LlmProvider;
  readonly attempts: number;
  readonly latencyMs: number;
  readonly usedMock: boolean;
}

export interface LlmCallMetrics {
  readonly attempts: number;
  readonly latencyMs: number;
}
