import { requestInputSchema } from "@/lib/schemas.js";
import {
  extractPaymentRequest,
  GeminiExtractionError,
} from "@/lib/gemini.js";

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

  const input = requestInputSchema.safeParse(body);

  if (!input.success) {
    return Response.json(
      { error: "Provide valid payment request text", retryable: false },
      { status: 400 }
    );
  }

  try {
    const fields = await extractPaymentRequest(input.data.requestText);

    return Response.json({
      fields,
      needsClarification: fields.needsClarification,
      clarificationReason: fields.clarificationReason,
      warningIndicators: fields.warningIndicators,
    });
  } catch (error) {
    if (error instanceof GeminiExtractionError) {
      return Response.json(
        {
          error:
            error.message ||
            "Could not parse the payment request. Please retry or enter details manually.",
          retryable: error.retryable,
          code: error.code,
        },
        { status: error.status || 503 }
      );
    }

    return Response.json(
      { error: "Request failed", retryable: true },
      { status: 500 }
    );
  }
}
