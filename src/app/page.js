"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ChecksBarChart from "../components/dashboard/ChecksBarChart.js";
import ChecksLineChart from "../components/dashboard/ChecksLineChart.js";
import AssistantLiveCard from "../components/dashboard/AssistantLiveCard.js";
import { GridTableSkeleton } from "../components/ui/LoadingSkeletons.js";
import { useDemoSession } from "../lib/demoAuth.js";

const SayPayGrid = dynamic(
  () => import("../components/grid/SayPayGrid.js"),
  {
    ssr: false,
    loading: () => <GridTableSkeleton rows={5} label="Loading recent checks…" />,
  },
);

export default function DashboardPage() {
  const session = useDemoSession();

  const [stats, setStats] = useState({
    totals: {
      checks: 0,
      clear: 0,
      review: 0,
      blocked: 0,
      completedPayments: 0,
      volumeMinor: 0,
      unpaidInvoices: 0,
      unpaidMinor: 0,
    },
    daily: [],
    recent: [],
  });
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
  }, []);

  const totals = stats.totals;
  const completedVolumeFormatted = `$${((totals.volumeMinor || 0) / 100).toFixed(2)}`;
  const unpaidVolumeFormatted = `$${((totals.unpaidMinor || 0) / 100).toFixed(2)}`;

  const metrics = [
    {
      label: "Total Screened",
      value: String(totals.checks || 0),
      sub: "Voice & text checks",
      icon: "receipt_long",
      tone: "text-[#0F172A]",
    },
    {
      label: "Safety Cleared",
      value: String(totals.clear || 0),
      sub: "Verified safe",
      dot: "#107E3E",
      tone: "text-[#107E3E]",
    },
    {
      label: "Needs Review",
      value: String(totals.review || 0),
      sub: "Uncertain match",
      dot: "#B45309",
      tone: "text-[#B45309]",
    },
    {
      label: "Blocked",
      value: String(totals.blocked || 0),
      sub: "Prevented risk",
      dot: "#DC2626",
      tone: "text-[#DC2626]",
    },
    {
      label: "PayPal Volume",
      value: completedVolumeFormatted,
      sub: `${totals.completedPayments || 0} completed payments`,
      icon: "verified",
      tone: "text-[#0070BA]",
      highlight: true,
    },
  ];

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8">
      {/* Header with Greeting & Action Buttons */}
      <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
            Welcome, {session?.name || "John Doe"}
          </h1>
          <p className="mt-1 text-xs text-[#64748B]">
            Conversational AI screening and PayPal Sandbox payment dashboard
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/history"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-4 text-xs font-bold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
          >
            <span className="text-sm">📜</span>
            View History
          </Link>
          <Link
            href="/new-check"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-tr from-[#003087] to-[#0070BA] px-5 text-xs font-bold text-white shadow-md shadow-[#0070BA]/20 transition-all hover:scale-102 active:scale-98"
          >
            <span className="text-sm">🎙️</span>
            Ask SayPay (Voice Assist)
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-2xl border p-4.5 transition-all ${
              metric.highlight
                ? "border-[#BAE6FD] bg-gradient-to-br from-white to-[#F0F9FF] shadow-xs"
                : "border-[#E2E8F0] bg-white shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#64748B]">{metric.label}</span>
              {metric.dot ? (
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: metric.dot }} />
              ) : (
                <span className="text-sm">{metric.icon === "verified" ? "🛡️" : "📋"}</span>
              )}
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className={`text-2xl font-black leading-none ${metric.tone}`}>
                {metric.value}
              </span>
            </div>
            <span className="mt-1.5 block text-[11px] text-[#64748B]">{metric.sub}</span>
          </div>
        ))}
      </div>

      {/* Main Grid: Left Charts + Table (8 Cols), Right Assistant + Invoices (4 Cols) */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChecksBarChart data={stats.daily} />
            <ChecksLineChart data={stats.daily} />
          </div>

          {/* Recent Screening Checks Table */}
          <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs">
            <div className="flex flex-col gap-2 border-b border-[#E2E8F0] p-5 sm:flex-row sm:items-center sm:justify-between bg-[#FAFAFA]">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A]">Recent Payment Checks</h2>
                <p className="text-xs text-[#64748B]">
                  Live screening results verified by MatchCheck safety engine
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Atlas Sync
              </span>
            </div>

            <div className="p-2 sm:p-3">
              {stats.recent && stats.recent.length > 0 ? (
                <SayPayGrid variant="dashboard" rowData={stats.recent} ariaLabel="Recent payment checks" />
              ) : (
                <div className="text-center py-8 text-xs text-[#64748B]">
                  No payment checks recorded yet. Start your first check with{" "}
                  <Link href="/new-check" className="text-[#0070BA] font-bold hover:underline">
                    Ask SayPay
                  </Link>
                  .
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3 sm:flex-row sm:items-center sm:justify-between text-xs">
              <span className="text-[#64748B]">
                Showing {stats.recent?.length || 0} recent checks
              </span>
              <Link
                href="/history"
                className="font-semibold text-[#0070BA] hover:underline flex items-center gap-1"
              >
                View full historical log ➔
              </Link>
            </div>
          </section>
        </div>

        {/* Right Sidebar: Assistant Live + Pending Invoices */}
        <div className="space-y-6 xl:col-span-4">
          <AssistantLiveCard />

          {/* Real Unpaid Invoices Ready for Payment */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Unpaid Invoices</h3>
                <p className="text-xs text-[#64748B]">
                  {unpaidInvoices.length} bills pending ({unpaidVolumeFormatted})
                </p>
              </div>
              <Link
                href="/new-check"
                className="text-xs font-bold text-[#0070BA] hover:underline"
              >
                Pay with AI ➔
              </Link>
            </div>

            <div className="space-y-2.5 mt-4">
              {unpaidInvoices.slice(0, 4).map((inv) => (
                <div
                  key={inv.invoiceId}
                  className="p-3 rounded-xl border border-[#E2E8F0] hover:border-[#0070BA] bg-[#F8FAFC] hover:bg-white transition-all flex items-center justify-between group"
                >
                  <div className="pr-2">
                    <p className="text-xs font-bold text-[#0F172A]">{inv.merchantName}</p>
                    <p className="text-[11px] text-[#64748B] truncate max-w-[170px]">
                      {inv.description}
                    </p>
                    <span className="text-[10px] text-[#94A3B8]">Ref: {inv.invoiceId}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-[#0F172A]">${inv.amount}</p>
                    <Link
                      href="/new-check"
                      className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-[#0070BA] text-white font-semibold group-hover:bg-[#005ea6] transition-colors"
                    >
                      Pay
                    </Link>
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
