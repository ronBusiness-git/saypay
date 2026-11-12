import crypto from "crypto";
import connectDB from "@/lib/db.js";
import PaymentCheck from "@/models/PaymentCheck.js";
import { runMatchCheck } from "@/lib/matchcheck.js";
import { handleApiError, ValidationError, NotFoundError } from "@/lib/errors.js";

/**
 * POST /api/payment/check
 *
 * Runs the deterministic MatchCheck engine on user intent vs merchant request,
 * generates a unique checkId, saves the PaymentCheck record in MongoDB,
 * and enforces that canCreateOrder is true strictly only when status is 'CLEAR'.
 *
 * Accepts body:
 * {
 *   intentFields: object, // or intent
 *   requestFields: object, // or request
 *   workspaceId: string // optional, default "demo-workspace"
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

    const intentFields = body.intentFields || body.intent;
    const requestFields = body.requestFields || body.request;
    const workspaceId = body.workspaceId || "demo-workspace";

    if (!intentFields || typeof intentFields !== "object") {
      throw new ValidationError("intentFields is required and must be an object");
    }

    if (!requestFields || typeof requestFields !== "object") {
      throw new ValidationError("requestFields is required and must be an object");
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
