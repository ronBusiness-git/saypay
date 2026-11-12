import connectDB from "@/lib/db.js";
import Transaction from "@/models/Transaction.js";
import PaymentCheck from "@/models/PaymentCheck.js";
import { handleApiError, NotFoundError } from "@/lib/errors.js";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    // Query by transactionId or paypalOrderId
    const transaction = await Transaction.findOne({
      $or: [{ transactionId: id }, { paypalOrderId: id }],
    }).lean();

    if (!transaction) {
      throw new NotFoundError(`Transaction ${id} not found`);
    }

    // Load corresponding check snapshot
    let checkSnapshot = null;
    if (transaction.checkId) {
      checkSnapshot = await PaymentCheck.findOne({ checkId: transaction.checkId }).lean();
    }

    const receipt = {
      receiptId: `REC-${transaction.transactionId.slice(0, 8).toUpperCase()}`,
      amountFormatted: (transaction.amountMinor / 100).toFixed(2),
      currency: transaction.currency,
      merchantKey: transaction.merchantKey,
      reference: transaction.reference,
      paypalOrderId: transaction.paypalOrderId,
      captureId: transaction.captureId,
      status: transaction.paymentStatus,
      paidAt: transaction.updatedAt || transaction.createdAt,
    };

    return Response.json({
      transaction,
      checkSnapshot,
      receipt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
