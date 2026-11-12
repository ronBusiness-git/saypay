import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.js";
import Invoice from "@/models/Invoice.js";
import { getSessionUser } from "@/lib/session.js";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const user = getSessionUser(request);

    const query = {};

    if (status && status !== "ALL") {
      query.status = status.toUpperCase();
    }

    if (user) {
      if (user.role === "seller" && user.merchantKey) {
        query.merchantKey = user.merchantKey;
      } else if (user.role === "buyer" && user.email) {
        query.buyerEmail = user.email.toLowerCase();
      }
    } else {
      // Default fallback for demo / unauthenticated preview: show demo buyer's invoices
      query.buyerEmail = "buyer@saypay.app";
    }

    const invoices = await Invoice.find(query).sort({ dueDate: 1, createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      invoices: invoices.map((inv) => ({
        id: inv.invoiceId,
        invoiceId: inv.invoiceId,
        merchantKey: inv.merchantKey,
        merchantName: inv.merchantName,
        buyerEmail: inv.buyerEmail,
        amount: inv.amount,
        currency: inv.currency,
        description: inv.description,
        dueDate: inv.dueDate,
        status: inv.status,
        transactionId: inv.transactionId,
        checkId: inv.checkId,
        createdAt: inv.createdAt,
      })),
    });
  } catch (error) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
