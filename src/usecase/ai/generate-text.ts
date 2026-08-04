import { PROMPTS, PROMPT_VERSION } from "@/config/prompts";
import { GenerationJob } from "@/domain/ai/entities";
import type { TextGenerator } from "@/domain/ai/ports";
import type { GenerateTextResult, LlmProvider } from "@/domain/ai/types";
import { createDefaultTextGenerator } from "@/infrastructure/llm/resilient-llm-client";

export interface GenerateTextInput {
  readonly userMessage: string;
  readonly provider?: LlmProvider;
  readonly simulateTransientFailures?: number;
}

/**
 * Application use case: assemble prompt from config, validate via domain entity,
 * then call a TextGenerator port — never a concrete vendor SDK.
 */
export class GenerateTextUseCase {
  constructor(
    private readonly textGenerator: TextGenerator = createDefaultTextGenerator(),
  ) {}

  async execute(input: GenerateTextInput): Promise<GenerateTextResult> {
    const job = GenerationJob.create({
      userMessage: input.userMessage,
      provider: input.provider ?? "mock",
      simulateTransientFailures: input.simulateTransientFailures,
    });

    /**
     * Prompt injection from config (not hard-coded here):
     * keeps tuning independent from orchestration and retry policy.
     */
    return this.textGenerator.generate({
      userMessage: job.userMessage,
      systemPrompt: PROMPTS.generation,
      promptVersion: PROMPT_VERSION,
      provider: job.provider,
      constraints: job.constraints,
      simulateTransientFailures: job.simulateTransientFailures,
    });
  }
}
