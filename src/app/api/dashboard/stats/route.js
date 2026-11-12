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
    const isSeller = user?.role === "seller";
    const merchantKey = user?.merchantKey || (isSeller ? "greenleaf-demo-store" : null);

    if (isSeller) {
      // ----------------- SELLER / MERCHANT DASHBOARD STATS -----------------
      const merchantInvoices = await Invoice.find({ merchantKey })
        .sort({ createdAt: -1 })
        .lean();

      const totalInvoices = merchantInvoices.length;
      const paidInvoicesList = merchantInvoices.filter((i) => i.status === "PAID");
      const unpaidInvoicesList = merchantInvoices.filter((i) => i.status === "UNPAID");

      const revenueMinor = paidInvoicesList.reduce((sum, inv) => {
        return sum + Math.round(parseFloat(inv.amount || "0") * 100);
      }, 0);

      const pendingMinor = unpaidInvoicesList.reduce((sum, inv) => {
        return sum + Math.round(parseFloat(inv.amount || "0") * 100);
      }, 0);

      // 7 days daily series
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

      merchantInvoices.forEach((inv) => {
        const dateStr = new Date(inv.createdAt).toISOString().split("T")[0];
        if (dailyMap[dateStr]) {
          dailyMap[dateStr].checks += 1;
          if (inv.status === "PAID") {
            dailyMap[dateStr].clear += 1;
            dailyMap[dateStr].volumeMinor += Math.round(parseFloat(inv.amount || "0") * 100);
          } else {
            dailyMap[dateStr].review += 1;
          }
        }
      });

      const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

      const recent = merchantInvoices.slice(0, 10).map((inv) => {
        const isPaid = inv.status === "PAID";
        return {
          id: inv.invoiceId,
          timestamp: new Date(inv.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          counterparty: inv.buyerEmail,
          amount: `$${parseFloat(inv.amount).toFixed(2)} ${inv.currency}`,
          matchCheck: {
            label: isPaid ? "SETTLED" : "PENDING",
            className: isPaid
              ? "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]"
              : "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
            icon: isPaid ? "check_circle" : "pending",
          },
          payment: {
            label: inv.status,
            className: isPaid
              ? "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]"
              : "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
            icon: isPaid ? "check_circle" : "dot",
          },
          action: { href: `/new-check`, label: "Manage" },
        };
      });

      return NextResponse.json({
        success: true,
        role: "seller",
        totals: {
          totalInvoices,
          paidInvoices: paidInvoicesList.length,
          revenueMinor,
          unpaidInvoices: unpaidInvoicesList.length,
          pendingMinor,
        },
        daily,
        recent,
      });
    }

    // ----------------- BUYER DASHBOARD STATS -----------------
    const [totalChecks, clearChecks, reviewChecks, blockedChecks] = await Promise.all([
      PaymentCheck.countDocuments(),
      PaymentCheck.countDocuments({ status: "CLEAR" }),
      PaymentCheck.countDocuments({ status: "REVIEW" }),
      PaymentCheck.countDocuments({ status: "BLOCKED" }),
    ]);

    const completedTxs = await Transaction.find({ paymentStatus: "COMPLETED" }).lean();
    const completedPaymentsCount = completedTxs.length;
    const volumeMinor = completedTxs.reduce((sum, tx) => sum + (tx.amountMinor || 0), 0);

    const buyerEmail = user?.email || "buyer@saypay.app";
    const unpaidInvoicesList = await Invoice.find({
      buyerEmail: buyerEmail.toLowerCase(),
      status: "UNPAID",
    }).lean();

    const unpaidCount = unpaidInvoicesList.length;
    const unpaidMinor = unpaidInvoicesList.reduce((sum, inv) => {
      return sum + Math.round(parseFloat(inv.amount || "0") * 100);
    }, 0);

    // 7 days daily series
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
    const recentChecks = await PaymentCheck.find({ createdAt: { $gte: sevenDaysAgo } }).lean();

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

    const latestChecks = await PaymentCheck.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recent = latestChecks.map((c) => {
      const counterparty =
        c.intent?.recipientName || c.request?.recipientName || "GreenLeaf Demo Store";
      const amt = c.intent?.amount || c.request?.amount || "12.50";
      const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const isClear = c.status === "CLEAR";
      const isReview = c.status === "REVIEW";

      return {
        id: c.checkId.slice(0, 12),
        timestamp: formattedDate,
        counterparty,
        amount: `$${parseFloat(amt).toFixed(2)}`,
        matchCheck: {
          label: c.status,
          className: isClear
            ? "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]"
            : isReview
            ? "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
            : "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
          icon: isClear ? "check_circle" : isReview ? "warning" : "block",
        },
        payment: {
          label: isClear ? "APPROVED" : "PENDING",
          className: isClear
            ? "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]"
            : "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
          icon: isClear ? "check_circle" : "dot",
        },
        action: { href: `/new-check`, label: "Pay" },
      };
    });

    return NextResponse.json({
      success: true,
      role: "buyer",
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
