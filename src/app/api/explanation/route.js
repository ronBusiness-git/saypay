import { explanationInputSchema } from "@/lib/schemas.js";
import { generateExplanation, GeminiExtractionError } from "@/lib/gemini.js";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON request", retryable: false },
      { status: 400 }
    );
  }

  const input = explanationInputSchema.safeParse(body);

  if (!input.success) {
    return Response.json(
      {
        error: "Invalid explanation request payload",
        details: input.error.format(),
        retryable: false,
      },
      { status: 400 }
    );
  }

  try {
    const result = await generateExplanation(input.data);

    return Response.json({
      explanation: result.explanation,
      status: result.status,
      fallback: result.fallback,
    });
  } catch (error) {
    if (error instanceof GeminiExtractionError) {
      return Response.json(
        {
          error: error.message,
          retryable: error.retryable,
          code: error.code,
        },
        { status: error.status || 503 }
      );
    }

    return Response.json(
      { error: "Failed to generate explanation", retryable: true },
      { status: 500 }
    );
  }
}
