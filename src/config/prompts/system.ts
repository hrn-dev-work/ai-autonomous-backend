/**
 * Why system prompts are externalized (not inlined in route handlers or UI):
 * - Operators can retune LLM behavior without redeploying domain or use-case code.
 * - Reviewers compare prompt revisions independently from business logic diffs.
 * - The same prompt constant can be shared across LINE bot, internal tools, and demo UI.
 *
 * Hardcoding prompts in API routes makes production tuning slow and couples UX copy to transport.
 */

export const GENERATION_SYSTEM_PROMPT = `You are a precise Japanese-capable assistant embedded in business workflows.
Answer clearly, avoid hallucinated facts, and keep the tone professional.
If the user request is ambiguous, state assumptions briefly before answering.
Prefer structured, skimmable output (short paragraphs or bullet points) over walls of text.`;

export const PROMPT_VERSION = "v1.0.0" as const;

/** Registry key for multi-prompt products (LINE bot, internal tools, etc.). */
export type PromptKey = "generation";

export const PROMPTS: Record<PromptKey, string> = {
  generation: GENERATION_SYSTEM_PROMPT,
};
