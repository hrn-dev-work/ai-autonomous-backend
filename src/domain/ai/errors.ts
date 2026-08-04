export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class LlmTimeoutError extends DomainError {
  constructor(timeoutMs: number) {
    super(`LLM provider did not respond within ${timeoutMs}ms`, "LLM_TIMEOUT");
    this.name = "LlmTimeoutError";
  }
}

export class LlmRetryExhaustedError extends DomainError {
  constructor(attempts: number, lastMessage: string) {
    super(
      `LLM provider failed after ${attempts} attempt(s): ${lastMessage}`,
      "LLM_RETRY_EXHAUSTED",
    );
    this.name = "LlmRetryExhaustedError";
  }
}

export class LlmTransientError extends DomainError {
  constructor(message: string) {
    super(message, "LLM_TRANSIENT");
    this.name = "LlmTransientError";
  }
}
