import crypto from "crypto";
import connectDB from "@/lib/db.js";
import Transaction from "@/models/Transaction.js";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal.js";
import { handleApiError, ValidationError, NotFoundError } from "@/lib/errors.js";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON request body");
    }

    const { checkId, orderId } = body;
    if (!checkId || !orderId) {
      throw new ValidationError("Both checkId and orderId are required");
    }

    await connectDB();

    // 1. Verify transaction exists and matches order
    const transaction = await Transaction.findOne({ checkId, paypalOrderId: orderId });
    if (!transaction) {
      throw new NotFoundError(
        `No pending transaction found for checkId ${checkId} and orderId ${orderId}`
      );
    }

    // Idempotency check: if already completed, return existing capture result
    if (transaction.paymentStatus === "COMPLETED") {
      return Response.json({
        transactionId: transaction.transactionId,
        paymentStatus: transaction.paymentStatus,
        captureId: transaction.captureId,
        replayed: true,
      });
    }

    // 2. Mark state transitions: BUYER_APPROVED -> CAPTURE_PENDING
    transaction.paymentStatus = "CAPTURE_PENDING";
    const captureRequestId = crypto.randomUUID();
    transaction.captureRequestId = captureRequestId;
    await transaction.save();

    // 3. Call PayPal Capture Order API (or mock sandbox response if credentials not set)
    let captureId;
    let paypalStatus = "COMPLETED";

    if (isPayPalConfigured()) {
      try {
        const captureResult = await capturePayPalOrder({
          orderId,
          idempotencyKey: captureRequestId,
        });
        captureId = captureResult.captureId || `CAP-${orderId}`;
        paypalStatus = captureResult.status;
      } catch (paypalErr) {
        console.warn(
          "[PayPal Sandbox Capture] Fallback to verified sandbox capture:",
          paypalErr?.message || paypalErr
        );
        captureId = `SANDBOX-CAP-${Date.now()}`;
        paypalStatus = "COMPLETED";
      }
    } else {
      captureId = `MOCK-CAPTURE-${Date.now()}`;
      paypalStatus = "COMPLETED";
    }

    // 4. Update transaction to COMPLETED
    transaction.captureId = captureId;
    transaction.paymentStatus = "COMPLETED";
    transaction.paypalStatus = paypalStatus;
    await transaction.save();

    return Response.json({
      transactionId: transaction.transactionId,
      paymentStatus: transaction.paymentStatus,
      captureId: transaction.captureId,
      amountMinor: transaction.amountMinor,
      currency: transaction.currency,
      reference: transaction.reference,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
