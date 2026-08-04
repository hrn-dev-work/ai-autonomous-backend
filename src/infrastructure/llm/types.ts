import type { GenerateTextRequest } from "@/domain/ai/types";

export interface LlmCompletion {
  readonly text: string;
}

/**
 * Port for LLM providers. Infrastructure implements this; use cases depend on TextGenerator.
 * Complete accepts AbortSignal so timeouts can cancel in-flight mock/network work.
 */
export interface LlmClient {
  complete(
    request: GenerateTextRequest,
    attemptIndex: number,
    signal: AbortSignal,
  ): Promise<LlmCompletion>;
}
