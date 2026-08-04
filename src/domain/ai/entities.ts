import { ValidationError } from "./errors";
import type { GenerationConstraints, LlmProvider } from "./types";

const DEFAULT_CONSTRAINTS: GenerationConstraints = {
  maxOutputTokens: 1024,
  timeoutMs: 8_000,
  maxAttempts: 3,
  retryBaseDelayMs: 300,
};

/**
 * AI generation job entity: validates user intent and holds resilience policy.
 * Behavior knobs (prompts) live in config; this entity owns domain constraints only.
 */
export class GenerationJob {
  readonly userMessage: string;
  readonly provider: LlmProvider;
  readonly constraints: GenerationConstraints;
  readonly simulateTransientFailures: number;

  private constructor(
    userMessage: string,
    provider: LlmProvider,
    constraints: GenerationConstraints,
    simulateTransientFailures: number,
  ) {
    this.userMessage = userMessage;
    this.provider = provider;
    this.constraints = constraints;
    this.simulateTransientFailures = simulateTransientFailures;
  }

  static create(input: {
    userMessage: string;
    provider?: LlmProvider;
    constraints?: Partial<GenerationConstraints>;
    simulateTransientFailures?: number;
  }): GenerationJob {
    const trimmed = input.userMessage.trim();
    if (trimmed.length === 0) {
      throw new ValidationError("userMessage must not be empty");
    }
    if (trimmed.length > 4_000) {
      throw new ValidationError("userMessage must be at most 4000 characters");
    }

    const provider: LlmProvider = input.provider ?? "mock";
    if (provider !== "mock" && provider !== "openai" && provider !== "claude") {
      throw new ValidationError("unsupported provider");
    }

    const failures = input.simulateTransientFailures ?? 0;
    if (!Number.isInteger(failures) || failures < 0 || failures > 5) {
      throw new ValidationError(
        "simulateTransientFailures must be an integer between 0 and 5",
      );
    }

    const constraints: GenerationConstraints = {
      ...DEFAULT_CONSTRAINTS,
      ...input.constraints,
    };

    if (constraints.maxOutputTokens < 16 || constraints.maxOutputTokens > 8_192) {
      throw new ValidationError("maxOutputTokens out of allowed range");
    }
    if (constraints.timeoutMs < 500 || constraints.timeoutMs > 60_000) {
      throw new ValidationError("timeoutMs out of allowed range");
    }
    if (constraints.maxAttempts < 1 || constraints.maxAttempts > 5) {
      throw new ValidationError("maxAttempts out of allowed range");
    }

    return new GenerationJob(trimmed, provider, constraints, failures);
  }
}

export { DEFAULT_CONSTRAINTS };
