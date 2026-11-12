import { NextResponse } from "next/server";
import { processAssistantRequest } from "@/lib/assistant.js";
import { getSessionUser } from "@/lib/session.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages = [], context = {}, lang = "en-US" } = body || {};

    const user = getSessionUser(request);

    const result = await processAssistantRequest({
      messages,
      context,
      user,
      lang,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Assistant API route error:", error);
    return NextResponse.json(
      {
        reply: "I encountered a brief hiccup. How can I help you?",
        action: "none",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
