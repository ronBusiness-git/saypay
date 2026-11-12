import { intentInputSchema } from "@/lib/schemas.js";
import {
  extractIntent,
  GeminiExtractionError,
} from "@/lib/gemini.js";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON", retryable: false },
      { status: 400 }
    );
  }

  const input = intentInputSchema.safeParse(body);

  if (!input.success) {
    return Response.json(
      { error: "Enter valid intent text", retryable: false },
      { status: 400 }
    );
  }

  try {
    const fields = await extractIntent(input.data.text);

    return Response.json({
      fields,
      needsClarification: fields.needsClarification,
      clarificationReason: fields.clarificationReason,
    });
  } catch (error) {
    if (error instanceof GeminiExtractionError) {
      return Response.json(
        {
          error: error.message || "Gemini extraction failed. Please retry.",
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
