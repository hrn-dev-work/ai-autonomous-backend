import { describe, expect, it } from "vitest";

import {
  LlmRetryExhaustedError,
  LlmTimeoutError,
  LlmTransientError,
} from "@/domain/ai/errors";
import type { GenerateTextRequest } from "@/domain/ai/types";
import {
  abortableSleep,
  withTimeout,
} from "@/infrastructure/llm/mock-llm-client";
import { ResilientLlmClient } from "@/infrastructure/llm/resilient-llm-client";
import type { LlmClient, LlmCompletion } from "@/infrastructure/llm/types";
import { baseRequest } from "@/infrastructure/llm/test-fixtures";

class ScriptedLlmClient implements LlmClient {
  readonly calls: number[] = [];
  hangFinished = 0;

  constructor(
    private readonly script: Array<"ok" | "transient" | "hang" | "fatal">,
    private readonly hangMs: number = 50,
  ) {}

  async complete(
    _request: GenerateTextRequest,
    attemptIndex: number,
    signal: AbortSignal,
  ): Promise<LlmCompletion> {
    this.calls.push(attemptIndex);
    const step = this.script[attemptIndex] ?? "ok";

    if (step === "transient") {
      throw new LlmTransientError(`transient at attempt ${attemptIndex}`);
    }
    if (step === "fatal") {
      throw new Error(`fatal at attempt ${attemptIndex}`);
    }
    if (step === "hang") {
      await abortableSleep(this.hangMs, signal);
      this.hangFinished += 1;
      return { text: "late" };
    }
    return { text: `ok-${attemptIndex}` };
  }
}

describe("withTimeout", () => {
  it("rejects with LlmTimeoutError when the operation exceeds the deadline", async () => {
    await expect(
      withTimeout((signal) => abortableSleep(200, signal), 30),
    ).rejects.toBeInstanceOf(LlmTimeoutError);
  });

  it("resolves when the operation finishes before the deadline", async () => {
    await expect(
      withTimeout(async () => "ready", 100),
    ).resolves.toBe("ready");
  });

  it("aborts in-flight work so a long hang does not finish after timeout", async () => {
    let finished = false;
    const started = Date.now();

    await expect(
      withTimeout(async (signal) => {
        await abortableSleep(5_000, signal);
        finished = true;
        return "late";
      }, 40),
    ).rejects.toBeInstanceOf(LlmTimeoutError);

    expect(Date.now() - started).toBeLessThan(500);
    // Allow microtask flush
    await new Promise((r) => setTimeout(r, 20));
    expect(finished).toBe(false);
  });
});

describe("ResilientLlmClient", () => {
  it("retries transient failures and returns success with correct attempts", async () => {
    const inner = new ScriptedLlmClient(["transient", "transient", "ok"]);
    const client = new ResilientLlmClient(inner);

    const result = await client.generate(baseRequest());

    expect(result.text).toBe("ok-2");
    expect(result.attempts).toBe(3);
    expect(inner.calls).toEqual([0, 1, 2]);
  });

  it("throws LlmRetryExhaustedError after maxAttempts of transient failures", async () => {
    const inner = new ScriptedLlmClient(["transient", "transient", "transient"]);
    const client = new ResilientLlmClient(inner);

    await expect(client.generate(baseRequest())).rejects.toBeInstanceOf(
      LlmRetryExhaustedError,
    );
    expect(inner.calls).toEqual([0, 1, 2]);
  });

  it("does not retry non-retryable errors and reports actual attempts", async () => {
    const inner = new ScriptedLlmClient(["fatal", "ok", "ok"]);
    const client = new ResilientLlmClient(inner);

    const error = await client.generate(baseRequest()).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(LlmRetryExhaustedError);
    expect((error as LlmRetryExhaustedError).message).toContain("1 attempt");
    expect(inner.calls).toEqual([0]);
  });

  it("retries on per-attempt timeout and eventually succeeds", async () => {
    const inner = new ScriptedLlmClient(["hang", "ok"], 150);
    const client = new ResilientLlmClient(inner);

    const result = await client.generate(
      baseRequest({
        constraints: {
          maxOutputTokens: 256,
          timeoutMs: 40,
          maxAttempts: 3,
          retryBaseDelayMs: 1,
        },
      }),
    );

    expect(result.text).toBe("ok-1");
    expect(result.attempts).toBe(2);
    expect(inner.calls).toEqual([0, 1]);
    expect(inner.hangFinished).toBe(0);
  });

  it("times out a long hang without waiting for full hang duration", async () => {
    const inner = new ScriptedLlmClient(["hang", "hang", "hang"], 5_000);
    const client = new ResilientLlmClient(inner);
    const started = Date.now();

    await expect(
      client.generate(
        baseRequest({
          constraints: {
            maxOutputTokens: 256,
            timeoutMs: 30,
            maxAttempts: 2,
            retryBaseDelayMs: 1,
          },
        }),
      ),
    ).rejects.toBeInstanceOf(LlmRetryExhaustedError);

    expect(Date.now() - started).toBeLessThan(800);
    expect(inner.hangFinished).toBe(0);
  });

  it("marks usedMock false when the inner client is not MockLlmClient", async () => {
    const inner = new ScriptedLlmClient(["ok"]);
    const client = new ResilientLlmClient(inner);

    const result = await client.generate(baseRequest({ provider: "openai" }));

    expect(result.usedMock).toBe(false);
    expect(result.provider).toBe("openai");
  });
});

describe("ResilientLlmClient + MockLlmClient (integration-ish)", () => {
  it("recovers after simulateTransientFailures using real MockLlmClient", async () => {
    const { MockLlmClient } = await import(
      "@/infrastructure/llm/mock-llm-client"
    );
    const client = new ResilientLlmClient(new MockLlmClient(5));

    const result = await client.generate(
      baseRequest({
        simulateTransientFailures: 2,
        constraints: {
          maxOutputTokens: 256,
          timeoutMs: 2_000,
          maxAttempts: 3,
          retryBaseDelayMs: 1,
        },
      }),
    );

    expect(result.attempts).toBe(3);
    expect(result.usedMock).toBe(true);
    expect(result.text.length).toBeGreaterThan(0);
  });
});
