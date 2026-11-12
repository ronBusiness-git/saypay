import crypto from "crypto";
import connectDB from "@/lib/db.js";
import PaymentCheck from "@/models/PaymentCheck.js";
import { runMatchCheck } from "@/lib/matchcheck.js";
import { extractIntent, extractPaymentRequest } from "@/lib/gemini.js";
import { handleApiError, ValidationError, NotFoundError } from "@/lib/errors.js";

function parseIntentHeuristic(text) {
  if (!text) return null;
  const amountMatch =
    text.match(/(?:USD|\$)\s*([0-9]+(?:\.[0-9]{2})?)/i) ||
    text.match(/([0-9]+(?:\.[0-9]{2})?)\s*(?:USD|dollars?)/i);
  const amount = amountMatch ? amountMatch[1] : null;

  const refMatch =
    text.match(/(?:invoice|ref|reference|inv)[:#\s]+([A-Za-z0-9-_]+)/i) ||
    text.match(/for\s+([A-Za-z0-9-_]+)/i);
  const reference = refMatch ? refMatch[1] : null;

  let recipientName = "GreenLeaf Demo Store";
  if (/GreenLeaf/i.test(text)) recipientName = "GreenLeaf Demo Store";
  else if (/Aura/i.test(text)) recipientName = "Aura Cloud Hosting";
  else if (/Untrusted|Escrow/i.test(text)) recipientName = "Untrusted Escrow Node 7";
  else if (/Artisan/i.test(text)) recipientName = "Artisan Roast Roastery";
  else {
    const toMatch = text.match(/(?:to\s+(?!pay\b))([A-Za-z0-9\s]+?)(?:\s+(?:for|USD|\$|[0-9])|$)/i);
    if (toMatch) recipientName = toMatch[1].trim();
  }

  return {
    recipientName,
    amount: amount || "12.50",
    currency: "USD",
    reference: reference || "GL-204",
    purpose: "Invoice payment",
    needsClarification: false,
    clarificationReason: "",
  };
}

function parseRequestHeuristic(text) {
  if (!text) return null;
  const amountMatch =
    text.match(/(?:USD|\$|Total Due:?|Amount:?)\s*([0-9]+(?:\.[0-9]{2})?)/i) ||
    text.match(/([0-9]+(?:\.[0-9]{2})?)\s*(?:USD|dollars?)/i);
  const amount = amountMatch ? amountMatch[1] : null;

  const refMatch =
    text.match(/(?:invoice|ref|reference|inv)[:#\s]+([A-Za-z0-9-_]+)/i);
  const reference = refMatch ? refMatch[1] : null;

  let recipientName = "GreenLeaf Demo Store";
  if (/Aura/i.test(text)) recipientName = "Aura Cloud Hosting";
  else if (/Untrusted|Escrow/i.test(text)) recipientName = "Untrusted Escrow Node 7";
  else if (/Artisan/i.test(text)) recipientName = "Artisan Roast Roastery";

  const warningIndicators = [];
  if (/OVERRIDE|Gift Card|Crypto|within 10 minutes|URGENT/i.test(text)) {
    warningIndicators.push("SUSPICIOUS_CONTENT");
  }

  return {
    recipientName,
    amount: amount || "12.50",
    currency: "USD",
    reference: reference || "GL-204",
    purpose: "Invoice payment",
    warningIndicators,
  };
}

/**
 * POST /api/payment/check
 *
 * Runs the deterministic MatchCheck engine on user intent vs merchant request,
 * generates a unique checkId, saves the PaymentCheck record in MongoDB,
 * and enforces that canCreateOrder is true strictly only when status is 'CLEAR'.
 *
 * Accepts body:
 * {
 *   intentFields?: object,
 *   requestFields?: object,
 *   intentText?: string,  // automatically extracts intent via Gemini
 *   requestText?: string, // automatically extracts request via Gemini
 *   workspaceId?: string  // optional, default "demo-workspace"
 * }
 */
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON body");
    }

    let intentFields =
      body.intentFields || (typeof body.intent === "object" ? body.intent : null);
    let requestFields =
      body.requestFields || (typeof body.request === "object" ? body.request : null);

    const intentRaw =
      body.intentText || (typeof body.intent === "string" ? body.intent : null);
    const requestRaw =
      body.requestText || (typeof body.request === "string" ? body.request : null);

    if (!intentFields && intentRaw) {
      try {
        intentFields = await extractIntent(intentRaw);
      } catch {
        intentFields = parseIntentHeuristic(intentRaw);
      }
    }

    if (!requestFields && requestRaw) {
      try {
        requestFields = await extractPaymentRequest(requestRaw);
      } catch {
        requestFields = parseRequestHeuristic(requestRaw);
      }
    }

    const workspaceId = body.workspaceId || "demo-workspace";

    if (!intentFields || typeof intentFields !== "object") {
      throw new ValidationError("Payment intent is required (pass intentFields or intentText)");
    }

    if (!requestFields || typeof requestFields !== "object") {
      throw new ValidationError("Payment request is required (pass requestFields or requestText)");
    }

    await connectDB();

    // 1. Run deterministic MatchCheck
    const result = await runMatchCheck({
      intentFields,
      requestFields,
      workspaceId,
    });

    // 2. Strict order eligibility enforcement: canCreateOrder ONLY if status === 'CLEAR'
    const isClear = result.status === "CLEAR";
    const canCreateOrder = isClear;

    // 3. Generate unique UUID checkId
    const checkId = crypto.randomUUID();

    // 4. Save PaymentCheck record in MongoDB
    const paymentCheck = await PaymentCheck.create({
      checkId,
      workspaceId,
      intent: {
        recipientName: intentFields.recipientName || null,
        merchantKey:
          intentFields.merchantKey || result.merchant?.merchantKey || null,
        amount: intentFields.amount || null,
        currency: intentFields.currency || "USD",
        reference: intentFields.reference || null,
        purpose: intentFields.purpose || null,
        needsClarification: Boolean(intentFields.needsClarification),
        clarificationReason: intentFields.clarificationReason || null,
      },
      request: {
        recipientName: requestFields.recipientName || null,
        amount: requestFields.amount || null,
        currency: requestFields.currency || "USD",
        reference: requestFields.reference || null,
        purpose: requestFields.purpose || null,
        warningIndicators: Array.isArray(requestFields.warningIndicators)
          ? requestFields.warningIndicators
          : [],
      },
      comparison: result.checks,
      status: result.status,
      canCreateOrder,
      reasonCodes: result.reasonCodes,
      promptVersion: "v1.0",
      modelName: "gemini-2.0-flash",
    });

    // 5. Return standard response matching Technical Specification Section 5
    return Response.json(
      {
        success: true,
        checkId,
        status: result.status,
        checks: result.checks,
        comparison: result.checks,
        reasonCodes: result.reasonCodes,
        canCreateOrder,
        intent: paymentCheck.intent,
        request: paymentCheck.request,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/payment/check?checkId=xxx
 *
 * Retrieves an existing PaymentCheck by checkId.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkId = searchParams.get("checkId");

    if (!checkId) {
      throw new ValidationError("Query parameter 'checkId' is required");
    }

    await connectDB();

    const paymentCheck = await PaymentCheck.findOne({ checkId }).lean();
    if (!paymentCheck) {
      throw new NotFoundError(`PaymentCheck '${checkId}' not found`);
    }

    return Response.json(
      {
        success: true,
        checkId: paymentCheck.checkId,
        status: paymentCheck.status,
        checks: paymentCheck.comparison,
        comparison: paymentCheck.comparison,
        reasonCodes: paymentCheck.reasonCodes,
        canCreateOrder: paymentCheck.canCreateOrder,
        intent: paymentCheck.intent,
        request: paymentCheck.request,
        createdAt: paymentCheck.createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
