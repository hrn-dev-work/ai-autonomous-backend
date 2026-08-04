import {
  DomainError,
  ValidationError,
} from "@/domain/ai/errors";
import type { GenerateTextResult } from "@/domain/ai/types";
import { GenerateTextUseCase } from "@/usecase/ai/generate-text";

export type GenerateOutcome =
  | { ok: true; data: GenerateTextResult }
  | { ok: false; code: string; message: string; httpStatus: number };

export interface GenerateCommandInput {
  userMessage: string;
  simulateTransientFailures?: number;
}

/**
 * Shared generation command used by HTTP route and Server Action.
 * Maps domain errors to portable outcomes (no Next.js types).
 */
export async function executeGenerateCommand(
  input: GenerateCommandInput,
): Promise<GenerateOutcome> {
  try {
    if (typeof input.userMessage !== "string") {
      throw new ValidationError("userMessage must be a string");
    }

    let simulate: number | undefined;
    if (input.simulateTransientFailures !== undefined) {
      if (
        typeof input.simulateTransientFailures !== "number" ||
        !Number.isInteger(input.simulateTransientFailures)
      ) {
        throw new ValidationError(
          "simulateTransientFailures must be an integer",
        );
      }
      simulate = input.simulateTransientFailures;
    }

    const useCase = new GenerateTextUseCase();
    const data = await useCase.execute({
      userMessage: input.userMessage,
      provider: "mock",
      simulateTransientFailures: simulate,
    });

    return { ok: true, data };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        ok: false,
        code: error.code,
        message: error.message,
        httpStatus: 400,
      };
    }
    if (error instanceof DomainError) {
      return {
        ok: false,
        code: error.code,
        message: error.message,
        httpStatus: 502,
      };
    }
    return {
      ok: false,
      code: "INTERNAL",
      message: "unexpected server error",
      httpStatus: 500,
    };
  }
}
