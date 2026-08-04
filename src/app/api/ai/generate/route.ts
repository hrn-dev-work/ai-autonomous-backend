import { NextResponse } from "next/server";

import {
  DomainError,
  ValidationError,
} from "@/domain/ai/errors";
import type { LlmProvider } from "@/domain/ai/types";
import {
  checkDemoApiKey,
  clientRateLimitKey,
  getSharedRateLimiter,
} from "@/infrastructure/http/demo-access";
import { GenerateTextUseCase } from "@/usecase/ai/generate-text";

export const runtime = "nodejs";

interface GenerateBody {
  userMessage?: unknown;
  provider?: unknown;
  simulateTransientFailures?: unknown;
}

function parseProvider(value: unknown): LlmProvider | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === "mock" || value === "openai" || value === "claude") {
    return value;
  }
  throw new ValidationError("provider must be mock | openai | claude");
}

/**
 * POST /api/ai/generate
 * Boundary: optional API key, rate limit, validates JSON, maps domain errors.
 * Does not embed system prompts.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = checkDemoApiKey(request, process.env.GENERATE_API_KEY);
    if (!auth.ok) {
      return NextResponse.json(
        {
          ok: false as const,
          error: { code: "UNAUTHORIZED", message: auth.message },
        },
        { status: auth.status },
      );
    }

    const limiter = getSharedRateLimiter();
    const decision = limiter.consume(clientRateLimitKey(request));
    if (!decision.allowed) {
      const retryAfterSec = Math.ceil(decision.retryAfterMs / 1000);
      return NextResponse.json(
        {
          ok: false as const,
          error: {
            code: "RATE_LIMITED",
            message: "too many requests; try again later",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    let body: GenerateBody;
    try {
      body = (await request.json()) as GenerateBody;
    } catch {
      throw new ValidationError("request body must be valid JSON");
    }

    if (typeof body.userMessage !== "string") {
      throw new ValidationError("userMessage must be a string");
    }

    // Only mock is wired; refuse openai/claude labels so public demos never imply live paid calls.
    const requestedProvider = parseProvider(body.provider);
    if (requestedProvider !== undefined && requestedProvider !== "mock") {
      throw new ValidationError(
        'only provider "mock" is available in this demo (no live OpenAI/Claude keys)',
      );
    }

    let simulate: number | undefined;
    if (body.simulateTransientFailures !== undefined) {
      if (
        typeof body.simulateTransientFailures !== "number" ||
        !Number.isInteger(body.simulateTransientFailures)
      ) {
        throw new ValidationError(
          "simulateTransientFailures must be an integer",
        );
      }
      simulate = body.simulateTransientFailures;
    }

    const useCase = new GenerateTextUseCase();
    const result = await useCase.execute({
      userMessage: body.userMessage,
      provider: "mock",
      simulateTransientFailures: simulate,
    });

    return NextResponse.json(
      {
        ok: true as const,
        data: result,
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(decision.remaining),
        },
      },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { ok: false as const, error: { code: error.code, message: error.message } },
        { status: 400 },
      );
    }
    if (error instanceof DomainError) {
      return NextResponse.json(
        { ok: false as const, error: { code: error.code, message: error.message } },
        { status: 502 },
      );
    }
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: "INTERNAL", message: "unexpected server error" },
      },
      { status: 500 },
    );
  }
}
