import connectDB from "@/lib/db.js";
import Transaction from "@/models/Transaction.js";
import PaymentCheck from "@/models/PaymentCheck.js";
import Invoice from "@/models/Invoice.js";
import { handleApiError, NotFoundError } from "@/lib/errors.js";

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId || "").trim();
    if (!id) {
      throw new NotFoundError("Receipt ID is required");
    }

    await connectDB();

    let transaction = await Transaction.findOne({
      $or: [{ transactionId: id }, { checkId: id }, { paypalOrderId: id }],
    }).lean();

    let check = null;
    if (transaction?.checkId) {
      check = await PaymentCheck.findOne({ checkId: transaction.checkId }).lean();
    }
    if (!check) {
      check = await PaymentCheck.findOne({ checkId: id }).lean();
    }

    let invoice = null;
    const invoiceLookupId =
      check?.invoiceId ||
      (id.startsWith("INV-") || id.startsWith("TN-") ? id : null) ||
      transaction?.reference;

    if (invoiceLookupId) {
      invoice = await Invoice.findOne({ invoiceId: invoiceLookupId }).lean();
    }
    if (!invoice) {
      invoice = await Invoice.findOne({
        $or: [{ invoiceId: id }, { transactionId: id }, { checkId: id }],
      }).lean();
    }

    // Backfill transaction or check if we started from an invoice
    if (invoice && !transaction && invoice.transactionId) {
      transaction = await Transaction.findOne({
        transactionId: invoice.transactionId,
      }).lean();
    }
    if (invoice && !check && invoice.checkId) {
      check = await PaymentCheck.findOne({ checkId: invoice.checkId }).lean();
    }

    if (!transaction && !check && !invoice) {
      throw new NotFoundError(`No receipt record found for "${id}"`);
    }

    const currency =
      transaction?.currency ||
      check?.intent?.currency ||
      check?.request?.currency ||
      invoice?.currency ||
      "USD";

    const amountFormatted = transaction
      ? (Number(transaction.amountMinor || 0) / 100).toFixed(2)
      : Number(
          check?.intent?.amount || check?.request?.amount || invoice?.amount || 0,
        ).toFixed(2);

    const matchCheckStatus =
      check?.status ||
      (transaction
        ? "CLEAR"
        : invoice?.status === "PAID"
          ? "SETTLED"
          : invoice?.status === "CANCELLED"
            ? "CANCELLED"
            : "PENDING");

    const paymentStatus =
      transaction?.paymentStatus ||
      (invoice
        ? invoice.status
        : check?.status === "CLEAR"
          ? "APPROVED"
          : check?.status === "BLOCKED"
            ? "BLOCKED"
            : "PENDING");

    const baseId =
      transaction?.transactionId || check?.checkId || invoice?.invoiceId || id;

    const receipt = {
      id,
      receiptNumber: `REC-${baseId.slice(-8).toUpperCase()}`,
      recordType: transaction ? "transaction" : check ? "check" : "invoice",
      transactionId: transaction?.transactionId || invoice?.transactionId || null,
      checkId: check?.checkId || transaction?.checkId || invoice?.checkId || null,
      invoiceId: invoice?.invoiceId || check?.invoiceId || null,
      merchantName:
        invoice?.merchantName ||
        check?.request?.recipientName ||
        check?.intent?.recipientName ||
        transaction?.merchantKey ||
        "GreenLeaf Demo Store",
      merchantKey:
        transaction?.merchantKey ||
        invoice?.merchantKey ||
        check?.intent?.merchantKey ||
        null,
      buyerEmail: invoice?.buyerEmail || null,
      reference:
        transaction?.reference ||
        check?.request?.reference ||
        check?.intent?.reference ||
        invoice?.invoiceId ||
        "—",
      purpose:
        invoice?.description ||
        check?.intent?.purpose ||
        check?.request?.purpose ||
        "Payment verification & settlement",
      currency,
      amountFormatted,
      matchCheckStatus,
      paymentStatus,
      paypalOrderId: transaction?.paypalOrderId || null,
      captureId: transaction?.captureId || null,
      paypalStatus: transaction?.paypalStatus || null,
      reasonCodes: check?.reasonCodes || [],
      comparison: check?.comparison || null,
      intent: check?.intent || null,
      request: check?.request || null,
      createdAt:
        transaction?.createdAt || check?.createdAt || invoice?.createdAt || null,
      updatedAt:
        transaction?.updatedAt || check?.updatedAt || invoice?.updatedAt || null,
    };

    return Response.json({
      success: true,
      receipt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
