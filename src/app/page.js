"use client";

import React from "react";
import Link from "next/link";

/**
 * SayPay Dashboard Page
 * Exact UI based on the design mockup and reference HTML.
 */
export default function DashboardPage({ onOpenDemoLab }) {
  const recentChecks = [
    {
      id: "chk_demo_204",
      timestamp: "24 May 2024, 14:32",
      counterparty: "GreenLeaf Demo Store",
      amount: "USD 12.50",
      matchCheck: {
        text: "CLEAR",
        className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      },
      payment: {
        text: "COMPLETED",
        subtext: null,
        className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      },
      href: "/checks/chk_demo_204",
    },
    {
      id: "chk_demo_203",
      timestamp: "24 May 2024, 11:15",
      counterparty: "Aura Cloud Hosting",
      amount: "USD 125.00",
      matchCheck: {
        text: "REVIEW",
        className: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
      },
      payment: {
        text: "Not started",
        subtext: null,
        className: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
      },
      href: "/checks/chk_demo_203",
    },
    {
      id: "chk_demo_202",
      timestamp: "23 May 2024, 18:40",
      counterparty: "Untrusted Escrow Node 7",
      amount: "USD 50.00",
      matchCheck: {
        text: "BLOCKED",
        className: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      },
      payment: {
        text: "Not started",
        subtext: null,
        className: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
      },
      href: "/checks/chk_demo_202",
    },
    {
      id: "chk_demo_201",
      timestamp: "23 May 2024, 16:05",
      counterparty: "Artisan Roast Roastery",
      amount: "USD 34.00",
      matchCheck: {
        text: "CLEAR",
        className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      },
      payment: {
        text: "CANCELLED",
        subtext: "By voice command",
        className: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
      },
      href: "/checks/chk_demo_201",
    },
    {
      id: "chk_demo_200",
      timestamp: "22 May 2024, 09:20",
      counterparty: "QuickSaaS Global",
      amount: "USD 89.00",
      matchCheck: {
        text: "CLEAR",
        className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      },
      payment: {
        text: "UNKNOWN",
        subtext: "Pending sync",
        className: "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]",
      },
      href: "/checks/chk_demo_200",
    },
    {
      id: "chk_demo_199",
      timestamp: "21 May 2024, 15:45",
      counterparty: "SwiftParcel Deliveries",
      amount: "USD 18.20",
      matchCheck: {
        text: "CLEAR",
        className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      },
      payment: {
        text: "COMPLETED",
        subtext: null,
        className: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      },
      href: "/checks/chk_demo_199",
    },
  ];

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-space-xl">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-space-lg mb-space-lg border-b border-[#DFE5E8]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-headline-lg text-headline-lg text-[#15232D] tracking-tight">
              Welcome back
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF7F1] text-[#107E3E] text-label-sm font-label-sm border border-[#A7F3D0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#107E3E] animate-pulse"></span>
              Demo Workspace Active
            </span>
          </div>
          <p className="font-body-md text-body-md text-secondary">
            Compare payment details before you continue to PayPal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/new-check"
            className="min-h-[44px] bg-primary-container text-white px-6 rounded-[10px] font-label-md text-label-md flex items-center gap-2 hover:bg-[#066653] active:scale-[0.98] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            + New Payment Check
          </Link>
        </div>
      </div>

      {/* Five Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md mb-space-xl">
        {/* Four Screening Metric Cards (Span 8 Cols on desktop) */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-space-md bg-[#FFFFFF] p-space-md rounded-[16px] border border-[#DFE5E8] shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
          {/* 1. Total Checks */}
          <div className="flex flex-col justify-between p-space-sm border-r border-[#F7F8FA] last:border-r-0">
            <span className="font-label-md text-label-md text-secondary mb-2">Total checks</span>
            <div>
              <span className="font-headline-lg text-headline-lg text-[#15232D] font-bold">34</span>
              <span className="block font-body-sm text-body-sm text-secondary mt-1">Logged sessions</span>
            </div>
          </div>
          {/* 2. Cleared */}
          <div className="flex flex-col justify-between p-space-sm border-r border-[#F7F8FA] last:border-r-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-secondary">Cleared</span>
              <span className="w-2 h-2 rounded-full bg-[#107E3E]"></span>
            </div>
            <div>
              <span className="font-headline-lg text-headline-lg text-[#107E3E] font-bold">19</span>
              <span className="block font-body-sm text-body-sm text-secondary mt-1">Clean telemetry</span>
            </div>
          </div>
          {/* 3. Needs Review */}
          <div className="flex flex-col justify-between p-space-sm border-r border-[#F7F8FA] last:border-r-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-secondary">Needs review</span>
              <span className="w-2 h-2 rounded-full bg-[#B45309]"></span>
            </div>
            <div>
              <span className="font-headline-lg text-headline-lg text-[#B45309] font-bold">9</span>
              <span className="block font-body-sm text-body-sm text-secondary mt-1">Prompt variance</span>
            </div>
          </div>
          {/* 4. Blocked */}
          <div className="flex flex-col justify-between p-space-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-secondary">Blocked</span>
              <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
            </div>
            <div>
              <span className="font-headline-lg text-headline-lg text-[#DC2626] font-bold">6</span>
              <span className="block font-body-sm text-body-sm text-secondary mt-1">Halted pre-auth</span>
            </div>
          </div>
        </div>

        {/* Fifth Card: Completed Sandbox Payments (Span 4 Cols on desktop, elevated & visually separated) */}
        <div className="md:col-span-4 bg-[#FFFFFF] p-space-lg rounded-[16px] border border-[#BFDBFE] bg-gradient-to-br from-[#FFFFFF] to-[#EFF6FF] shadow-[0_4px_6px_-1px_rgba(21,35,45,0.06),0_10px_24px_-2px_rgba(21,35,45,0.08)] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-label-md text-label-md text-primary font-semibold">
                  Completed Sandbox payments
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display-lg text-display-lg text-[#15232D] font-bold">12</span>
                <span className="font-label-sm text-label-sm text-secondary">of 34 checks</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF7F1] text-[#107E3E] text-label-sm font-label-sm border border-[#A7F3D0] shadow-xs">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Verified by backend
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-secondary mt-3 pt-3 border-t border-[#DFE5E8]/60">
            Authenticated subset of attempts reaching final execution state without client aborts.
          </p>
        </div>
      </div>

      {/* Main Section: Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* 8-Column Left: Recent Attempts Table */}
        <section className="lg:col-span-8 bg-[#FFFFFF] rounded-[16px] border border-[#DFE5E8] shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)] flex flex-col">
          {/* Table Header */}
          <div className="p-space-lg border-b border-[#DFE5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-[#15232D]">
                Recent payment checks
              </h2>
              <p className="font-body-sm text-body-sm text-secondary">
                Screening results and backend settlement status
              </p>
            </div>
            <span className="font-code-sm text-code-sm text-secondary bg-[#F7F8FA] px-2.5 py-1 rounded border border-[#DFE5E8]">
              Auto-sync: Active
            </span>
          </div>

          {/* Responsive Table Container */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-[#DFE5E8] bg-[#F7F8FA]/60">
                  <th className="py-3 px-space-md font-label-sm text-label-sm text-secondary">
                    CHECK ID
                  </th>
                  <th className="py-3 px-space-md font-label-sm text-label-sm text-secondary">
                    TIMESTAMP
                  </th>
                  <th className="py-3 px-space-md font-label-sm text-label-sm text-secondary">
                    COUNTERPARTY
                  </th>
                  <th className="py-3 px-space-md font-label-sm text-label-sm text-secondary text-right">
                    AMOUNT
                  </th>
                  <th className="py-3 px-space-md font-label-sm text-label-sm text-secondary text-center">
                    MATCHCHECK
                  </th>
                  <th className="py-3 px-space-md font-label-sm text-label-sm text-secondary text-center">
                    PAYMENT
                  </th>
                  <th className="py-3 px-space-md font-label-sm text-label-sm text-secondary text-right">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE5E8]">
                {recentChecks.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F7F8FA]/80 transition-colors duration-100"
                  >
                    <td className="py-3.5 px-space-md font-code-md text-code-md text-[#15232D]">
                      {row.id}
                    </td>
                    <td className="py-3.5 px-space-md font-body-sm text-body-sm text-secondary">
                      {row.timestamp}
                    </td>
                    <td className="py-3.5 px-space-md font-body-md text-body-md font-medium text-[#15232D]">
                      {row.counterparty}
                    </td>
                    <td className="py-3.5 px-space-md font-code-md text-code-md font-semibold text-[#15232D] text-right">
                      {row.amount}
                    </td>
                    <td className="py-3.5 px-space-md text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm border ${row.matchCheck.className}`}
                      >
                        {row.matchCheck.text}
                      </span>
                    </td>
                    <td className="py-3.5 px-space-md text-center">
                      {row.payment.subtext ? (
                        <div className="flex flex-col items-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm border ${row.payment.className}`}
                          >
                            {row.payment.text}
                          </span>
                          <span className="text-[10px] text-secondary mt-0.5">
                            {row.payment.subtext}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm border ${row.payment.className}`}
                        >
                          {row.payment.text}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-space-md text-right">
                      <Link
                        className="text-primary hover:text-[#066653] font-label-sm text-label-sm inline-flex items-center gap-0.5 font-medium"
                        href={row.href}
                      >
                        Open{" "}
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_forward
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-space-md border-t border-[#DFE5E8] bg-[#F7F8FA]/30 flex items-center justify-between text-secondary">
            <span className="font-body-sm text-body-sm">Showing 6 recent simulated actions</span>
            <Link
              className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 font-semibold"
              href="/history"
            >
              View full historical log
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>
        </section>

        {/* 4-Column Right: Contextual Panels (Safety Insight & Demo Lab) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Safety Insight Card (Mismatches & warnings) */}
          <div className="bg-[#FFFFFF] p-space-lg rounded-[16px] border border-[#DFE5E8] shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <h3 className="font-headline-sm text-headline-sm text-[#15232D]">
                  Mismatches &amp; warnings
                </h3>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-[#F3F4F6] text-secondary border border-[#E5E7EB]">
                  Demo data
                </span>
              </div>

              {/* Textual Breakdown */}
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#B45309] text-[18px] mt-0.5">
                    difference
                  </span>
                  <span className="font-body-sm text-body-sm text-[#15232D]">
                    <strong className="font-semibold">3 amount discrepancies</strong> intercepted this week.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#DC2626] text-[18px] mt-0.5">
                    shield_with_house
                  </span>
                  <span className="font-body-sm text-body-sm text-[#15232D]">
                    <strong className="font-semibold">2 untrusted beneficiary descriptors</strong> flagged before checkout.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                    verified_user
                  </span>
                  <span className="font-body-sm text-body-sm text-[#15232D]">
                    <strong className="font-semibold">Zero override bypasses</strong> permitted across tests.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-space-lg pt-space-md border-t border-[#DFE5E8]">
              <p className="font-body-sm text-body-sm text-secondary">
                All attempts are logged · No subjective fraud scores or probability ratings.
              </p>
            </div>
          </div>

          {/* Demo Lab Panel (Demo Scenarios) */}
          <div className="bg-[#FFFFFF] p-space-lg rounded-[16px] border border-[#DFE5E8] shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">science</span>
                <h3 className="font-headline-sm text-headline-sm text-[#15232D]">Demo Scenarios</h3>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mb-space-md">
                Trigger voice simulated edge-cases against sandbox accounts.
              </p>

              {/* Scenario Trigger Buttons Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Safe Trigger */}
                <button
                  onClick={onOpenDemoLab}
                  className="text-left p-2.5 rounded-[10px] border border-[#DFE5E8] bg-[#FFFFFF] hover:bg-[#F7F8FA] transition-colors focus:ring-2 focus:ring-primary-container focus:outline-none"
                  type="button"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-md text-label-md text-[#107E3E] font-semibold">
                      Safe
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-[#107E3E]">
                      check_circle
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-[#15232D] truncate">
                    GreenLeaf Demo
                  </p>
                  <span className="font-code-sm text-code-sm text-secondary">$12.50 exact</span>
                </button>

                {/* Mismatch Trigger */}
                <button
                  onClick={onOpenDemoLab}
                  className="text-left p-2.5 rounded-[10px] border border-[#DFE5E8] bg-[#FFFFFF] hover:bg-[#F7F8FA] transition-colors focus:ring-2 focus:ring-primary-container focus:outline-none"
                  type="button"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-md text-label-md text-[#B45309] font-semibold">
                      Mismatch
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-[#B45309]">
                      warning
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-[#15232D] truncate">
                    Aura Cloud
                  </p>
                  <span className="font-code-sm text-code-sm text-secondary">$125 vs $12.50</span>
                </button>

                {/* Duplicate Trigger */}
                <button
                  onClick={onOpenDemoLab}
                  className="text-left p-2.5 rounded-[10px] border border-[#DFE5E8] bg-[#FFFFFF] hover:bg-[#F7F8FA] transition-colors focus:ring-2 focus:ring-primary-container focus:outline-none"
                  type="button"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-md text-label-md text-secondary font-semibold">
                      Duplicate
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      content_copy
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-[#15232D] truncate">
                    Repeat Ref
                  </p>
                  <span className="font-code-sm text-code-sm text-secondary">Invoice conflict</span>
                </button>

                {/* Ambiguous Trigger */}
                <button
                  onClick={onOpenDemoLab}
                  className="text-left p-2.5 rounded-[10px] border border-[#DFE5E8] bg-[#FFFFFF] hover:bg-[#F7F8FA] transition-colors focus:ring-2 focus:ring-primary-container focus:outline-none"
                  type="button"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-md text-label-md text-[#7E22CE] font-semibold">
                      Ambiguous
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-[#7E22CE]">
                      mic
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-[#15232D] truncate">
                    Voice Prompt
                  </p>
                  <span className="font-code-sm text-code-sm text-secondary">Low clarity score</span>
                </button>
              </div>
            </div>

            <div className="mt-space-lg pt-space-md border-t border-[#DFE5E8] flex justify-end">
              <button
                onClick={onOpenDemoLab}
                className="text-primary hover:text-[#066653] font-label-md text-label-md flex items-center gap-1 focus:outline-none font-semibold"
                type="button"
              >
                More scenarios
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
