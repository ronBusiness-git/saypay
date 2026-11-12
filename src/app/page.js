"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ChecksBarChart from "../components/dashboard/ChecksBarChart.js";
import ChecksLineChart from "../components/dashboard/ChecksLineChart.js";
import AssistantLiveCard from "../components/dashboard/AssistantLiveCard.js";
import { GridTableSkeleton } from "../components/ui/LoadingSkeletons.js";

const SayPayGrid = dynamic(
  () => import("../components/grid/SayPayGrid.js"),
  {
    ssr: false,
    loading: () => <GridTableSkeleton rows={5} label="Loading recent checks…" />,
  },
);

const METRICS = [
  { label: "Total checks", value: "34", sub: "Logged sessions", icon: "receipt_long", tone: "text-[#15232D]" },
  { label: "Cleared", value: "19", sub: "Clean telemetry", dot: "#107E3E", tone: "text-[#107E3E]" },
  { label: "Needs review", value: "9", sub: "Prompt variance", dot: "#B45309", tone: "text-[#B45309]" },
  { label: "Blocked", value: "6", sub: "Halted pre-auth", dot: "#DC2626", tone: "text-[#DC2626]" },
  { label: "Completed payments", value: "12", sub: "of 34 checks", icon: "verified", tone: "text-[#0F5C4B]", highlight: true },
];

const RECENT_CHECKS = [
  {
    id: "chk_demo_204",
    timestamp: "24 May 2024, 14:32",
    counterparty: "GreenLeaf Demo Store",
    amount: "USD 12.50",
    matchCheck: { label: "CLEAR", className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]", icon: "dot" },
    payment: { label: "COMPLETED", className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]", icon: "check_circle" },
    action: { href: "/checks/chk_demo_204", label: "Open" },
  },
  {
    id: "chk_demo_203",
    timestamp: "24 May 2024, 11:15",
    counterparty: "Aura Cloud Hosting",
    amount: "USD 125.00",
    matchCheck: { label: "REVIEW", className: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]", icon: "warning" },
    payment: { label: "Not started", className: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]", icon: "dot" },
    action: { href: "/checks/chk_demo_203", label: "Open" },
  },
  {
    id: "chk_demo_202",
    timestamp: "23 May 2024, 18:40",
    counterparty: "Untrusted Escrow Node 7",
    amount: "USD 50.00",
    matchCheck: { label: "BLOCKED", className: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]", icon: "block" },
    payment: { label: "Not started", className: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]", icon: "dot" },
    action: { href: "/checks/chk_demo_202", label: "Open" },
  },
  {
    id: "chk_demo_201",
    timestamp: "23 May 2024, 16:05",
    counterparty: "Artisan Roast Roastery",
    amount: "USD 34.00",
    matchCheck: { label: "CLEAR", className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]", icon: "dot" },
    payment: { label: "CANCELLED", className: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]", icon: "cancel", subtext: "By voice command" },
    action: { href: "/checks/chk_demo_201", label: "Open" },
  },
  {
    id: "chk_demo_200",
    timestamp: "22 May 2024, 09:20",
    counterparty: "QuickSaaS Global",
    amount: "USD 89.00",
    matchCheck: { label: "CLEAR", className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]", icon: "dot" },
    payment: { label: "UNKNOWN", className: "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]", icon: "sync", subtext: "Pending sync" },
    action: { href: "/checks/chk_demo_200", label: "Open" },
  },
  {
    id: "chk_demo_199",
    timestamp: "21 May 2024, 15:45",
    counterparty: "SwiftParcel Deliveries",
    amount: "USD 18.20",
    matchCheck: { label: "CLEAR", className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]", icon: "dot" },
    payment: { label: "COMPLETED", className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]", icon: "check_circle" },
    action: { href: "/checks/chk_demo_199", label: "Open" },
  },
];

const SCENARIOS = [
  { label: "Safe", name: "GreenLeaf Demo", meta: "$12.50 exact", tone: "text-[#107E3E]", icon: "check_circle" },
  { label: "Mismatch", name: "Aura Cloud", meta: "$125 vs $12.50", tone: "text-[#B45309]", icon: "warning" },
  { label: "Duplicate", name: "Repeat Ref", meta: "Invoice conflict", tone: "text-secondary", icon: "content_copy" },
  { label: "Ambiguous", name: "Voice Prompt", meta: "Low clarity", tone: "text-[#7E22CE]", icon: "mic" },
];

export default function DashboardPage({ onOpenDemoLab }) {
  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-8 md:py-space-xl">
      <div className="flex flex-col gap-4 border-b border-[#DFE5E8] pb-space-lg md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg tracking-tight text-[#15232D]">
            Welcome back
          </h1>
          <p className="mt-1 font-body-md text-body-md text-secondary">
            Compare payment details before you continue to PayPal.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/history"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-on-surface transition-colors hover:bg-[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-container"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">history</span>
            View history
          </Link>
          <Link
            href="/new-check"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] bg-primary-container px-5 font-label-md text-label-md font-semibold text-white shadow-sm transition-all hover:bg-[#066653] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-container"
          >
            <span className="material-symbols-outlined text-[19px]">add</span>
            New Payment Check
          </Link>
        </div>
      </div>

      <div className="mt-space-lg grid grid-cols-2 gap-3 sm:gap-space-md lg:grid-cols-5">
        {METRICS.map((metric) => (
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
                <span className={`material-symbols-outlined text-[17px] ${metric.tone}`}>{metric.icon}</span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`whitespace-nowrap text-[28px] font-bold leading-none ${metric.tone}`}>{metric.value}</span>
              {metric.label === "Completed payments" && (
                <span className="whitespace-nowrap font-label-sm text-label-sm text-secondary">of 34</span>
              )}
            </div>
            <span className="mt-1.5 block font-body-sm text-body-sm text-secondary">{metric.sub}</span>
          </div>
        ))}
      </div>

      <div className="mt-space-lg grid grid-cols-1 gap-space-lg xl:grid-cols-12">
        <div className="space-y-space-lg xl:col-span-8">
          <div className="grid gap-space-lg lg:grid-cols-2">
            <ChecksBarChart />
            <ChecksLineChart />
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#DFE5E8] bg-white shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
            <div className="flex flex-col gap-2 border-b border-[#DFE5E8] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-[#15232D]">Recent payment checks</h2>
                <p className="font-body-sm text-body-sm text-secondary">
                  Sortable screening results and backend settlement status
                </p>
              </div>
              <span className="inline-flex items-center gap-1 self-start rounded-full border border-[#DFE5E8] bg-[#F7F8FA] px-2.5 py-1 font-code-sm text-code-sm text-secondary sm:self-auto">
                <span className="h-1.5 w-1.5 rounded-full bg-[#107E3E]" />
                Auto-sync active
              </span>
            </div>

            <div className="p-1.5 sm:p-2.5">
              <SayPayGrid variant="dashboard" rowData={RECENT_CHECKS} ariaLabel="Recent payment checks" />
            </div>

            <div className="flex flex-col gap-2 border-t border-[#DFE5E8] bg-[#F7F8FA]/40 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-body-sm text-body-sm text-secondary">Showing 6 recent simulated actions</span>
              <Link href="/history" className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:underline">
                View full historical log
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-space-lg xl:col-span-4">
          <AssistantLiveCard />

          <section className="rounded-2xl border border-[#DFE5E8] bg-white p-5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[19px] text-primary">science</span>
              <h3 className="font-headline-sm text-headline-sm text-[#15232D]">Demo scenarios</h3>
            </div>
            <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
              Trigger simulated edge cases against sandbox accounts.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {SCENARIOS.map((scenario) => (
                <button
                  key={scenario.label}
                  onClick={onOpenDemoLab}
                  type="button"
                  className="rounded-xl border border-[#DFE5E8] bg-white p-2.5 text-left transition-colors hover:bg-[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-primary-container"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-label-md text-label-md font-semibold ${scenario.tone}`}>{scenario.label}</span>
                    <span className={`material-symbols-outlined text-[15px] ${scenario.tone}`}>{scenario.icon}</span>
                  </div>
                  <p className="mt-1 truncate font-body-sm text-body-sm text-[#15232D]">{scenario.name}</p>
                  <span className="font-code-sm text-[10px] text-secondary">{scenario.meta}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onOpenDemoLab}
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-[#DFE5E8] bg-[#F7F8FA] py-2 font-label-md text-label-md font-semibold text-primary transition-colors hover:bg-[#EAF7F1]"
            >
              Open Demo Lab
              <span className="material-symbols-outlined text-[15px]">open_in_new</span>
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
