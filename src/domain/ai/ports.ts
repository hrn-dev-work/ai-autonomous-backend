import type { GenerateTextRequest, GenerateTextResult } from "./types";

/**
 * Application-facing port for text generation (resilient LLM facade).
 * Use cases depend on this interface; infrastructure supplies the implementation.
 */
export interface TextGenerator {
  generate(request: GenerateTextRequest): Promise<GenerateTextResult>;
}
