import { describe, expect, it } from "vitest";

import type { TextGenerator } from "@/domain/ai/ports";
import type { GenerateTextResult } from "@/domain/ai/types";
import { GenerateTextUseCase } from "@/usecase/ai/generate-text";

describe("GenerateTextUseCase", () => {
  it("depends on TextGenerator port (injects fake, no infrastructure import required)", async () => {
    const fake: TextGenerator = {
      async generate(): Promise<GenerateTextResult> {
        return {
          text: "from-port",
          promptVersion: "v1.0.0",
          provider: "mock",
          attempts: 1,
          latencyMs: 1,
          usedMock: true,
        };
      },
    };

    const useCase = new GenerateTextUseCase(fake);
    const result = await useCase.execute({ userMessage: "hi" });

    expect(result.text).toBe("from-port");
  });
});
