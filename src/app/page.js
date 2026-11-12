"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ChecksBarChart from "../components/dashboard/ChecksBarChart.js";
import ChecksLineChart from "../components/dashboard/ChecksLineChart.js";
import VoiceAssistPanel from "../components/flow/VoiceAssistPanel.js";
import { useRouter } from "next/navigation";
import {
  PageHeaderSkeleton,
  SummaryCardsSkeleton,
  ChartCardSkeleton,
  GridTableSkeleton,
} from "../components/ui/LoadingSkeletons.js";
import { useDemoSession } from "../lib/demoAuth.js";

const SayPayGrid = dynamic(
  () => import("../components/grid/SayPayGrid.js"),
  {
    ssr: false,
    loading: () => <GridTableSkeleton rows={5} label="Loading recent activity…" />,
  },
);

export default function DashboardPage() {
  const router = useRouter();
  const session = useDemoSession();
  const isSeller = session?.role === "seller";

  const [stats, setStats] = useState(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, invoicesRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/invoices?status=UNPAID"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats(statsData);
          }
        }

        if (invoicesRes.ok) {
          const invData = await invoicesRes.json();
          if (invData.success && Array.isArray(invData.invoices)) {
            setUnpaidInvoices(invData.invoices);
          }
        }
      } catch (err) {
        console.warn("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [session?.role]);

  if (loading) {
    return (
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-8 md:py-space-xl space-y-6">
        <PageHeaderSkeleton withActions withEyebrow />
        <SummaryCardsSkeleton count={5} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCardSkeleton variant="bar" />
          <ChartCardSkeleton variant="line" />
        </div>
        <GridTableSkeleton rows={6} label="Loading recent activity…" />
      </main>
    );
  }

  const totals = stats?.totals || {};
  const isMerchant = stats?.role === "seller" || isSeller;

  // Buyer Metrics vs Merchant Metrics
  const metrics = isMerchant
    ? [
        {
          label: "Total Invoices",
          value: String(totals.totalInvoices || 0),
          sub: "Issued bills",
          icon: "receipt_long",
          tone: "text-[#15232D]",
        },
        {
          label: "Collected Revenue",
          value: `$${((totals.revenueMinor || 0) / 100).toFixed(2)}`,
          sub: `${totals.paidInvoices || 0} paid invoices`,
          dot: "#107E3E",
          tone: "text-[#107E3E]",
          highlight: true,
        },
        {
          label: "Awaiting Payment",
          value: `$${((totals.pendingMinor || 0) / 100).toFixed(2)}`,
          sub: `${totals.unpaidInvoices || 0} pending invoices`,
          dot: "#B45309",
          tone: "text-[#B45309]",
        },
        {
          label: "Settled Invoices",
          value: String(totals.paidInvoices || 0),
          sub: "Paid via PayPal",
          dot: "#107E3E",
          tone: "text-[#107E3E]",
        },
        {
          label: "Active Store",
          value: "Active",
          sub: "greenleaf-demo-store",
          icon: "verified",
          tone: "text-[#087F68]",
        },
      ]
    : [
        {
          label: "Total checks",
          value: String(totals.checks || 0),
          sub: "Screened sessions",
          icon: "receipt_long",
          tone: "text-[#15232D]",
        },
        {
          label: "Cleared",
          value: String(totals.clear || 0),
          sub: "Verified safe",
          dot: "#107E3E",
          tone: "text-[#107E3E]",
        },
        {
          label: "Needs review",
          value: String(totals.review || 0),
          sub: "Uncertain match",
          dot: "#B45309",
          tone: "text-[#B45309]",
        },
        {
          label: "Blocked",
          value: String(totals.blocked || 0),
          sub: "Halted pre-auth",
          dot: "#DC2626",
          tone: "text-[#DC2626]",
        },
        {
          label: "Completed payments",
          value: `$${((totals.volumeMinor || 0) / 100).toFixed(2)}`,
          sub: `${totals.completedPayments || 0} settled via PayPal`,
          icon: "verified",
          tone: "text-[#0F5C4B]",
          highlight: true,
        },
      ];

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-8 md:py-space-xl">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-[#DFE5E8] pb-space-lg md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-[#15232D]">
              Welcome back, {session?.name || (isMerchant ? "GreenLeaf Store" : "John Doe")}
            </h1>
            <span className="rounded-full border border-[#DFE5E8] bg-white px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-secondary">
              {isMerchant ? "Merchant Mode" : "Buyer Mode"}
            </span>
          </div>
          <p className="mt-1 font-body-md text-body-md text-secondary">
            {isMerchant
              ? "Issue invoices via voice AI and monitor real-time payment settlements."
              : "Compare payment details before you continue to PayPal."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/history"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-on-surface transition-colors hover:bg-[#F7F8FA]"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">history</span>
            View history
          </Link>
          <Link
            href="/new-check"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] bg-primary-container px-5 font-label-md text-label-md font-semibold text-white shadow-sm transition-all hover:bg-[#066653] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[19px]">
              {isMerchant ? "add_notes" : "record_voice_over"}
            </span>
            {isMerchant ? "Create Invoice (Voice AI)" : "Ask SayPay"}
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="mt-space-lg grid grid-cols-2 gap-3 sm:gap-space-md lg:grid-cols-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-2xl border p-space-md ${
              metric.highlight
                ? "border-[#A7F3D0] bg-gradient-to-br from-[#FFFFFF] to-[#EAF7F1] shadow-[0_4px_6px_-1px_rgba(21,35,45,0.06)]"
                : "border-[#DFE5E8] bg-white shadow-[0_1px_3px_rgba(21,35,45,0.04)]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-label-md text-label-md text-secondary">{metric.label}</span>
              {metric.dot ? (
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: metric.dot }} />
              ) : (
                <span className={`material-symbols-outlined text-[17px] ${metric.tone}`}>
                  {metric.icon}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`whitespace-nowrap text-[28px] font-bold leading-none ${metric.tone}`}>
                {metric.value}
              </span>
            </div>
            <span className="mt-1.5 block font-body-sm text-body-sm text-secondary">{metric.sub}</span>
          </div>
        ))}
      </div>

      {/* Charts & Main Table Grid */}
      <div className="mt-space-lg grid grid-cols-1 gap-space-lg xl:grid-cols-12">
        <div className="space-y-space-lg xl:col-span-8">
          <div className="grid gap-space-lg lg:grid-cols-2">
            <ChecksBarChart data={stats?.daily} />
            <ChecksLineChart data={stats?.daily} />
          </div>

          {/* Recent Table */}
          <section className="overflow-hidden rounded-2xl border border-[#DFE5E8] bg-white shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
            <div className="flex flex-col gap-2 border-b border-[#DFE5E8] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-[#15232D]">
                  {isMerchant ? "Issued Invoices & Settlement" : "Recent payment checks"}
                </h2>
                <p className="font-body-sm text-body-sm text-secondary">
                  {isMerchant
                    ? "Live billing records and buyer payment status from database"
                    : "Sortable screening results and backend settlement status"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 self-start rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2.5 py-1 font-label-sm text-label-sm text-[#107E3E] sm:self-auto font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#107E3E] animate-pulse" />
                Live MongoDB Sync
              </span>
            </div>

            <div className="p-1.5 sm:p-2.5">
              <SayPayGrid
                variant="history"
                rowData={stats?.recent || []}
                ariaLabel="Recent dashboard checks"
              />
            </div>

            <div className="flex flex-col gap-2 border-t border-[#DFE5E8] bg-[#F7F8FA]/40 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-body-sm text-body-sm text-secondary">
                Showing {stats?.recent?.length || 0} live records
              </span>
              <Link
                href="/history"
                className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:underline"
              >
                View full historical log
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>
          </section>
        </div>

        {/* Right Column: Interactive Voice Assistant + Invoices summary */}
        <div className="space-y-space-lg xl:col-span-4">
          <VoiceAssistPanel
            stage={1}
            role={isMerchant ? "seller" : "buyer"}
            greeting={
              isMerchant
                ? "Hi! I’m SayPay Merchant Assist. Say what invoice you’d like to create, or ask to view pending payments."
                : "Hi, I’m SayPay Assist. Tell me what bill you’d like to pay, or ask me to show your unpaid invoices."
            }
            suggestions={
              isMerchant
                ? [
                    "Create invoice for buyer@saypay.app for $45",
                    "Show pending invoices",
                  ]
                : [
                    "Show my unpaid bills",
                    "Pay GreenLeaf coffee order ($12.50)",
                    "Pay TechNova invoice TN-2210",
                  ]
            }
            onAssistantResult={(result) => {
              if (result?.action === "prepare_payment") {
                router.push("/new-check");
              } else if (result?.action === "invoice_created") {
                // Refresh dashboard to show the new invoice
                fetch("/api/dashboard/stats")
                  .then((r) => r.json())
                  .then((data) => data.success && setStats(data));
                fetch("/api/invoices?status=UNPAID")
                  .then((r) => r.json())
                  .then((data) => data.success && setUnpaidInvoices(data.invoices));
              }
            }}
          />

          <section className="rounded-2xl border border-[#DFE5E8] bg-white p-5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[19px] text-primary">
                  {isMerchant ? "inventory_2" : "receipt"}
                </span>
                <h3 className="font-headline-sm text-headline-sm text-[#15232D]">
                  {isMerchant ? "Pending Invoices" : "Unpaid Bills"}
                </h3>
              </div>
              <Link
                href="/new-check"
                className="font-label-sm text-label-sm text-primary font-semibold hover:underline"
              >
                {isMerchant ? "+ Create Invoice" : "Pay with AI ➔"}
              </Link>
            </div>

            <p className="font-body-sm text-body-sm text-secondary mb-3">
              {isMerchant
                ? "Invoices awaiting payment from buyers."
                : "Active invoices ready for voice screening and payment."}
            </p>

            <div className="space-y-2">
              {unpaidInvoices.slice(0, 4).map((inv) => (
                <div
                  key={inv.invoiceId}
                  className="p-3 rounded-xl border border-[#DFE5E8] hover:border-[#087F68] bg-[#F7F8FA] hover:bg-white transition-all flex items-center justify-between"
                >
                  <div className="pr-2">
                    <p className="font-label-md text-label-md font-bold text-[#15232D]">
                      {isMerchant ? inv.buyerEmail : inv.merchantName}
                    </p>
                    <p className="font-body-sm text-[11px] text-secondary truncate max-w-[170px]">
                      {inv.description}
                    </p>
                    <span className="font-code-sm text-[10px] text-secondary">
                      Ref: {inv.invoiceId}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-label-md text-label-md font-bold text-[#15232D]">
                      ${inv.amount}
                    </p>
                    {!isMerchant && (
                      <Link
                        href="/new-check"
                        className="inline-block mt-1 rounded-[6px] bg-primary-container px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-[#066653]"
                      >
                        Pay
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
