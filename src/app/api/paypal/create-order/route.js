import crypto from "crypto";
import connectDB from "@/lib/db.js";
import PaymentCheck from "@/models/PaymentCheck.js";
import Transaction from "@/models/Transaction.js";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal.js";
import { toMinorUnits } from "@/lib/money.js";
import { handleApiError, ValidationError, NotFoundError, ConflictError } from "@/lib/errors.js";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON request body");
    }

    const { checkId } = body;
    if (!checkId || typeof checkId !== "string") {
      throw new ValidationError("checkId is required");
    }

    await connectDB();

    // 1. Authoritative check verification
    let check = await PaymentCheck.findOne({ checkId });
    if (!check) {
      const invId = checkId.startsWith("chk_") ? checkId.replace(/^chk_/, "") : checkId;
      const Invoice = (await import("@/models/Invoice.js")).default;
      const inv = await Invoice.findOne({ invoiceId: invId });
      if (inv) {
        check = await PaymentCheck.findOneAndUpdate(
          { checkId },
          {
            $setOnInsert: {
              checkId,
              invoiceId: inv.invoiceId,
              workspaceId: "demo-workspace",
              intent: {
                recipientName: inv.merchantName,
                merchantKey: inv.merchantKey,
                amount: inv.amount,
                currency: inv.currency,
                reference: inv.invoiceId,
                purpose: inv.description,
              },
              request: {
                recipientName: inv.merchantName,
                amount: inv.amount,
                currency: inv.currency,
                reference: inv.invoiceId,
                purpose: inv.description,
              },
              status: "CLEAR",
              canCreateOrder: true,
              reasonCodes: [],
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    if (!check) {
      throw new NotFoundError(`PaymentCheck ${checkId} not found`);
    }

    if (check.status !== "CLEAR" || !check.canCreateOrder) {
      return Response.json(
        {
          error: "Payment check is not CLEAR. PayPal orders cannot be created for REVIEW or BLOCKED checks.",
          status: check.status,
          reasonCodes: check.reasonCodes,
        },
        { status: 403 }
      );
    }

    // 2. Prevent duplicate order creation for the same check (one order per check)
    const existingTx = await Transaction.findOne({ checkId });
    if (existingTx && existingTx.paypalOrderId) {
      // If already created, return existing orderId or block
      if (existingTx.paymentStatus === "COMPLETED") {
        throw new ConflictError("Payment for this check has already been completed.");
      }
      return Response.json({
        orderId: existingTx.paypalOrderId,
        status: existingTx.paymentStatus,
        reused: true,
      });
    }

    // 3. Authoritative server amounts (never trust client)
    const amountStr = check.intent.amount || check.request.amount;
    const currency = (check.intent.currency || check.request.currency || "USD").toUpperCase();
    const reference = check.intent.reference || check.request.reference || null;
    const merchantKey = check.intent.merchantKey || "unknown-merchant";

    const createRequestId = crypto.randomUUID();
    const transactionId = crypto.randomUUID();

    // Minor units for audit log
    let amountMinor = 0;
    try {
      amountMinor = toMinorUnits(amountStr);
    } catch {
      amountMinor = Math.round(parseFloat(amountStr) * 100);
    }

    // 4. Call PayPal Orders v2 (or mock for sandbox without keys)
    let orderId;
    let paypalStatus = "CREATED";

    if (isPayPalConfigured()) {
      const order = await createPayPalOrder({
        checkId,
        amount: amountStr,
        currency,
        reference,
        idempotencyKey: createRequestId,
      });
      orderId = order.orderId;
      paypalStatus = order.status;
    } else {
      // Mock Sandbox order ID if credentials not yet supplied in demo
      orderId = `MOCK-SANDBOX-ORDER-${Date.now()}`;
      paypalStatus = "CREATED";
    }

    // 5. Persist Transaction in ORDER_CREATED state
    const transaction = await Transaction.create({
      transactionId,
      checkId,
      merchantKey,
      amountMinor,
      currency,
      reference,
      paypalOrderId: orderId,
      createRequestId,
      paymentStatus: "ORDER_CREATED",
      paypalStatus,
    });

    return Response.json({
      orderId: transaction.paypalOrderId,
      transactionId: transaction.transactionId,
      status: transaction.paymentStatus,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
