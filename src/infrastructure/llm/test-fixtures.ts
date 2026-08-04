import type { GenerateTextRequest } from "@/domain/ai/types";

export function baseRequest(
  overrides: Partial<GenerateTextRequest> = {},
): GenerateTextRequest {
  const {
    constraints: constraintOverrides,
    ...rest
  } = overrides;

  return {
    userMessage: "hello",
    systemPrompt: "system",
    promptVersion: "v1.0.0",
    provider: "mock",
    ...rest,
    constraints: {
      maxOutputTokens: 256,
      timeoutMs: 2_000,
      maxAttempts: 3,
      retryBaseDelayMs: 1,
      ...constraintOverrides,
    },
  };
}
