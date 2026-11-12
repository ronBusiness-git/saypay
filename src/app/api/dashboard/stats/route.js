import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.js";
import PaymentCheck from "@/models/PaymentCheck.js";
import Transaction from "@/models/Transaction.js";
import Invoice from "@/models/Invoice.js";
import { getSessionUser } from "@/lib/session.js";

export async function GET(request) {
  try {
    await connectDB();

    const user = getSessionUser(request);

    // Filter query based on user role if logged in
    const checkQuery = {};
    const invoiceQuery = {};
    const txQuery = {};

    if (user) {
      if (user.role === "seller" && user.merchantKey) {
        checkQuery["intent.merchantKey"] = user.merchantKey;
        invoiceQuery.merchantKey = user.merchantKey;
        txQuery.merchantKey = user.merchantKey;
      }
    }

    // 1. Check Totals
    const [
      totalChecks,
      clearChecks,
      reviewChecks,
      blockedChecks,
    ] = await Promise.all([
      PaymentCheck.countDocuments(checkQuery),
      PaymentCheck.countDocuments({ ...checkQuery, status: "CLEAR" }),
      PaymentCheck.countDocuments({ ...checkQuery, status: "REVIEW" }),
      PaymentCheck.countDocuments({ ...checkQuery, status: "BLOCKED" }),
    ]);

    // 2. Transaction Totals (Completed PayPal payments)
    const completedTxs = await Transaction.find({
      ...txQuery,
      paymentStatus: "COMPLETED",
    }).lean();

    const completedPaymentsCount = completedTxs.length;
    const volumeMinor = completedTxs.reduce((sum, tx) => sum + (tx.amountMinor || 0), 0);

    // 3. Invoice Totals
    const unpaidInvoicesList = await Invoice.find({
      ...invoiceQuery,
      status: "UNPAID",
    }).lean();

    const unpaidCount = unpaidInvoicesList.length;
    const unpaidMinor = unpaidInvoicesList.reduce((sum, inv) => {
      const cents = Math.round(parseFloat(inv.amount || "0") * 100);
      return sum + (isNaN(cents) ? 0 : cents);
    }, 0);

    // 4. Daily series for the past 7 days
    const now = new Date();
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailyMap[dateStr] = {
        date: dateStr,
        checks: 0,
        clear: 0,
        review: 0,
        blocked: 0,
        volumeMinor: 0,
      };
    }

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentChecks = await PaymentCheck.find({
      ...checkQuery,
      createdAt: { $gte: sevenDaysAgo },
    }).lean();

    recentChecks.forEach((c) => {
      const dateStr = new Date(c.createdAt).toISOString().split("T")[0];
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].checks += 1;
        if (c.status === "CLEAR") dailyMap[dateStr].clear += 1;
        else if (c.status === "REVIEW") dailyMap[dateStr].review += 1;
        else if (c.status === "BLOCKED") dailyMap[dateStr].blocked += 1;
      }
    });

    const recentCompletedTxs = await Transaction.find({
      ...txQuery,
      paymentStatus: "COMPLETED",
      createdAt: { $gte: sevenDaysAgo },
    }).lean();

    recentCompletedTxs.forEach((tx) => {
      const dateStr = new Date(tx.createdAt).toISOString().split("T")[0];
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].volumeMinor += tx.amountMinor || 0;
      }
    });

    const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // 5. Recent Activity List (Checks + Transactions)
    const latestChecks = await PaymentCheck.find(checkQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recent = latestChecks.map((c) => {
      const counterparty =
        c.intent?.recipientName || c.request?.recipientName || c.intent?.merchantKey || "GreenLeaf Demo Store";
      const amt = c.intent?.amount || c.request?.amount || "0.00";
      const curr = c.intent?.currency || c.request?.currency || "USD";
      const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const isClear = c.status === "CLEAR";
      const isReview = c.status === "REVIEW";

      const matchCheckChip = {
        label: c.status,
        className: isClear
          ? "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]"
          : isReview
          ? "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
          : "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
        icon: isClear ? "check_circle" : isReview ? "warning" : "block",
      };

      const paymentChip = {
        label: isClear ? "APPROVED" : "PENDING",
        className: isClear
          ? "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]"
          : "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
        icon: isClear ? "check_circle" : "dot",
      };

      return {
        id: c.checkId.slice(0, 12),
        checkId: c.checkId,
        timestamp: formattedDate,
        counterparty,
        amount: `$${parseFloat(amt).toFixed(2)}`,
        amountRaw: amt,
        status: c.status,
        canCreateOrder: c.canCreateOrder,
        invoiceId: c.invoiceId || null,
        matchCheck: matchCheckChip,
        payment: paymentChip,
        action: { href: `/new-check`, label: "Pay" },
      };
    });

    return NextResponse.json({
      success: true,
      totals: {
        checks: totalChecks,
        clear: clearChecks,
        review: reviewChecks,
        blocked: blockedChecks,
        completedPayments: completedPaymentsCount,
        volumeMinor,
        unpaidInvoices: unpaidCount,
        unpaidMinor,
      },
      daily,
      recent,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate dashboard statistics" },
      { status: 500 }
    );
  }
}
