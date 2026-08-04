import { describe, expect, it } from "vitest";

import { GenerationJob } from "@/domain/ai/entities";
import { ValidationError } from "@/domain/ai/errors";

describe("GenerationJob", () => {
  it("creates a valid job with trimmed message and defaults", () => {
    const job = GenerationJob.create({ userMessage: "  hello  " });

    expect(job.userMessage).toBe("hello");
    expect(job.provider).toBe("mock");
    expect(job.constraints.maxAttempts).toBe(3);
    expect(job.simulateTransientFailures).toBe(0);
  });

  it("rejects empty messages", () => {
    expect(() => GenerationJob.create({ userMessage: "   " })).toThrow(
      ValidationError,
    );
  });

  it("rejects overlong messages", () => {
    expect(() =>
      GenerationJob.create({ userMessage: "x".repeat(4001) }),
    ).toThrow(ValidationError);
  });

  it("rejects simulateTransientFailures outside 0-5", () => {
    expect(() =>
      GenerationJob.create({
        userMessage: "ok",
        simulateTransientFailures: 6,
      }),
    ).toThrow(ValidationError);
  });
});
