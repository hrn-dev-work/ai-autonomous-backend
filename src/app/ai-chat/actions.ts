"use server";

import { headers } from "next/headers";

import {
  clientRateLimitKeyFromHeaderGet,
  getSharedRateLimiter,
} from "@/infrastructure/http/demo-access";
import { executeGenerateCommand } from "@/usecase/ai/execute-generate-command";

export type GenerateDemoResult =
  | {
      ok: true;
      data: {
        text: string;
        promptVersion: string;
        provider: string;
        attempts: number;
        latencyMs: number;
        usedMock: boolean;
      };
    }
  | {
      ok: false;
      error: { code: string; message: string };
    };

/**
 * Browser UI entry: rate-limited Server Action (no GENERATE_API_KEY in the client).
 * External clients must call POST /api/ai/generate with the server-side API key instead.
 */
export async function generateDemoText(input: {
  userMessage: string;
  simulateTransientFailures?: number;
}): Promise<GenerateDemoResult> {
  const headerStore = await headers();
  const rateKey = clientRateLimitKeyFromHeaderGet((name) =>
    headerStore.get(name),
  );
  const limiter = await getSharedRateLimiter();
  const decision = await limiter.consume(`ui:${rateKey}`);

  if (!decision.allowed) {
    return {
      ok: false,
      error: {
        code: "RATE_LIMITED",
        message: "too many requests; try again later",
      },
    };
  }

  const outcome = await executeGenerateCommand({
    userMessage: input.userMessage,
    simulateTransientFailures: input.simulateTransientFailures,
  });

  if (!outcome.ok) {
    return {
      ok: false,
      error: { code: outcome.code, message: outcome.message },
    };
  }

  return { ok: true, data: outcome.data };
}
