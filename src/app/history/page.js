"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

/**
 * SayPay Transaction History Page
 * Exact UI based on the design mockup and reference HTML.
 */
export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const transactions = [
    {
      id: "chk_demo_204",
      date: "24 May 2024",
      time: "14:32 UTC",
      initials: "GL",
      initialsStyle: "bg-[#EAF7F1] text-primary border-[#A7F3D0]",
      merchant: "GreenLeaf Demo Store",
      merchantId: "ID: mer_990142",
      reference: "ref: GL-204",
      amount: "USD 12.50",
      matchCheckStatus: "CLEAR",
      matchCheckCategory: "CLEAR",
      matchCheckIcon: "dot",
      matchCheckStyle: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      paymentStatus: "COMPLETED",
      paymentCategory: "COMPLETED",
      paymentIcon: "check_circle",
      paymentStyle: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      actionLabel: "View Receipt & Audit",
      href: "/checks/chk_demo_204",
    },
    {
      id: "chk_demo_203",
      date: "24 May 2024",
      time: "11:15 UTC",
      initials: "AC",
      initialsStyle: "bg-surface-container text-secondary border-outline-variant",
      merchant: "Aura Cloud Hosting",
      merchantId: "ID: mer_182903",
      reference: "ref: AC-901",
      amount: "USD 125.00",
      matchCheckStatus: "REVIEW (Mismatch)",
      matchCheckCategory: "REVIEW",
      matchCheckIcon: "warning",
      matchCheckStyle: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
      paymentStatus: "Not started",
      paymentCategory: "NOT_STARTED",
      paymentIcon: "dot_gray",
      paymentStyle: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
      actionLabel: "View Check",
      href: "/checks/chk_demo_203",
    },
    {
      id: "chk_demo_202",
      date: "23 May 2024",
      time: "18:40 UTC",
      initials: "UE",
      initialsStyle: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      merchant: "Untrusted Escrow Node 7",
      merchantId: "ID: mer_664120",
      reference: "ref: ESC-312",
      amount: "USD 50.00",
      matchCheckStatus: "BLOCKED (Untrusted)",
      matchCheckCategory: "BLOCKED",
      matchCheckIcon: "block",
      matchCheckStyle: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      paymentStatus: "Not started",
      paymentCategory: "NOT_STARTED",
      paymentIcon: "dot_gray",
      paymentStyle: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
      actionLabel: "View Check",
      href: "/checks/chk_demo_202",
    },
    {
      id: "chk_demo_201",
      date: "23 May 2024",
      time: "16:05 UTC",
      initials: "AR",
      initialsStyle: "bg-surface-container text-secondary border-outline-variant",
      merchant: "Artisan Roast Roastery",
      merchantId: "ID: mer_774023",
      reference: "ref: ARR-88",
      amount: "USD 34.00",
      matchCheckStatus: "CLEAR",
      matchCheckCategory: "CLEAR",
      matchCheckIcon: "dot",
      matchCheckStyle: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      paymentStatus: "CANCELLED (Voice reject)",
      paymentCategory: "CANCELLED",
      paymentIcon: "cancel",
      paymentStyle: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
      actionLabel: "View Detail",
      href: "/checks/chk_demo_201",
    },
    {
      id: "chk_demo_200",
      date: "22 May 2024",
      time: "09:20 UTC",
      initials: "QS",
      initialsStyle: "bg-surface-container text-secondary border-outline-variant",
      merchant: "QuickSaaS Global",
      merchantId: "ID: mer_551982",
      reference: "ref: QS-419",
      amount: "USD 89.00",
      matchCheckStatus: "CLEAR",
      matchCheckCategory: "CLEAR",
      matchCheckIcon: "dot",
      matchCheckStyle: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      paymentStatus: "UNKNOWN (Pending Sync)",
      paymentCategory: "UNKNOWN",
      paymentIcon: "sync",
      paymentStyle: "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]",
      actionLabel: "View Status",
      href: "/checks/chk_demo_200",
    },
    {
      id: "chk_demo_199",
      date: "21 May 2024",
      time: "15:45 UTC",
      initials: "SP",
      initialsStyle: "bg-[#EAF7F1] text-primary border-[#A7F3D0]",
      merchant: "SwiftParcel Deliveries",
      merchantId: "ID: mer_309112",
      reference: "ref: SPD-102",
      amount: "USD 18.20",
      matchCheckStatus: "CLEAR",
      matchCheckCategory: "CLEAR",
      matchCheckIcon: "dot",
      matchCheckStyle: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      paymentStatus: "COMPLETED",
      paymentCategory: "COMPLETED",
      paymentIcon: "check_circle",
      paymentStyle: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      actionLabel: "View Receipt",
      href: "/checks/chk_demo_199",
    },
    {
      id: "chk_nts55",
      date: "21 May 2024",
      time: "10:12 UTC",
      initials: "NT",
      initialsStyle: "bg-surface-container text-secondary border-outline-variant",
      merchant: "Nordic Timber Supply",
      merchantId: "ID: mer_880193",
      reference: "ref: NTS-55",
      amount: "USD 440.00",
      matchCheckStatus: "REVIEW (Unverified)",
      matchCheckCategory: "REVIEW",
      matchCheckIcon: "warning",
      matchCheckStyle: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
      paymentStatus: "Not started",
      paymentCategory: "NOT_STARTED",
      paymentIcon: "dot_gray",
      paymentStyle: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
      actionLabel: "View Check",
      href: "/checks/chk_nts55",
    },
    {
      id: "chk_cbr03",
      date: "20 May 2024",
      time: "17:30 UTC",
      initials: "CB",
      initialsStyle: "bg-[#EAF7F1] text-primary border-[#A7F3D0]",
      merchant: "City Bike Repair Hub",
      merchantId: "ID: mer_442998",
      reference: "ref: CBR-03",
      amount: "USD 65.00",
      matchCheckStatus: "CLEAR",
      matchCheckCategory: "CLEAR",
      matchCheckIcon: "dot",
      matchCheckStyle: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      paymentStatus: "COMPLETED",
      paymentCategory: "COMPLETED",
      paymentIcon: "check_circle",
      paymentStyle: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      actionLabel: "View Receipt",
      href: "/checks/chk_cbr03",
    },
    {
      id: "chk_cfa77",
      date: "19 May 2024",
      time: "13:10 UTC",
      initials: "CF",
      initialsStyle: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      merchant: "Cloudflare Sandbox Addon",
      merchantId: "ID: mer_110992",
      reference: "ref: CFA-77",
      amount: "USD 15.00",
      matchCheckStatus: "CLEAR",
      matchCheckCategory: "CLEAR",
      matchCheckIcon: "dot",
      matchCheckStyle: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      paymentStatus: "FAILED (Gateway)",
      paymentCategory: "FAILED",
      paymentIcon: "error",
      paymentStyle: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      actionLabel: "View Detail",
      href: "/checks/chk_cfa77",
    },
    {
      id: "chk_apx99",
      date: "18 May 2024",
      time: "11:00 UTC",
      initials: "AP",
      initialsStyle: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      merchant: "Apex Web Hosting Demo",
      merchantId: "ID: mer_992104",
      reference: "ref: APX-99",
      amount: "USD 29.99",
      matchCheckStatus: "BLOCKED (Pattern)",
      matchCheckCategory: "BLOCKED",
      matchCheckIcon: "block",
      matchCheckStyle: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      paymentStatus: "Not started",
      paymentCategory: "NOT_STARTED",
      paymentIcon: "dot_gray",
      paymentStyle: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
      actionLabel: "View Check",
      href: "/checks/chk_apx99",
    },
  ];

  const filterPills = [
    { label: "All (34)", value: "ALL", count: 34 },
    { label: "CLEAR (20)", value: "CLEAR", count: 20, style: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0] hover:bg-[#d6f2e4]" },
    { label: "REVIEW (6)", value: "REVIEW", count: 6, style: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] hover:bg-[#fde9a8]" },
    { label: "BLOCKED (4)", value: "BLOCKED", count: 4, style: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA] hover:bg-[#fcd0d0]" },
    { label: "Completed (18)", value: "COMPLETED", count: 18, style: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0] hover:bg-[#d6f2e4]" },
    { label: "Cancelled (3)", value: "CANCELLED", count: 3, style: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB] hover:bg-[#e7e9ed]" },
    { label: "Failed (2)", value: "FAILED", count: 2, style: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA] hover:bg-[#fcd0d0]" },
    { label: "Unknown (1)", value: "UNKNOWN", count: 1, style: "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF] hover:bg-[#e9d2fd]" },
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        searchTerm === "" ||
        t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedFilter === "ALL" ||
        t.matchCheckCategory === selectedFilter ||
        t.paymentCategory === selectedFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedFilter]);

  return (
    <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-space-xl">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-code-sm text-code-sm text-secondary uppercase tracking-wider">
              Audit &amp; Telemetry Logs
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-secondary">
              Live Sandbox Flow
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Transaction History
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Showing {filteredTransactions.length} of 34 payment checks and sandbox transaction outcomes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md h-11 px-4 rounded-[10px] transition-colors shadow-sm active:scale-[0.98]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">download</span>
            <span>Export CSV</span>
          </button>
          <Link
            href="/new-check"
            className="inline-flex items-center justify-center gap-2 bg-primary-container hover:bg-[#066653] text-on-primary font-label-md text-label-md h-11 px-5 rounded-[10px] shadow-sm transition-all duration-150 active:scale-[0.98] focus:ring-4 focus:ring-[#EAF7F1]"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>+ New Payment Check</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Surface Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-[16px] p-4 md:p-5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)] mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
              search
            </span>
            <input
              className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest border border-outline-variant rounded-[10px] font-body-md text-body-md text-on-surface placeholder-secondary focus:border-primary-container focus:ring-4 focus:ring-[#EAF7F1] transition-all outline-none"
              placeholder="Search merchant, reference, or check ID..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Controls Cluster: Date Selector & Clear Action */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Picker Selector */}
            <div className="relative">
              <button
                className="h-11 px-3.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low rounded-[10px] flex items-center gap-2 text-on-surface font-label-md text-label-md transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">calendar_today</span>
                <span>Last 30 days</span>
                <span className="material-symbols-outlined text-[18px] text-secondary ml-1">expand_more</span>
              </button>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedFilter("ALL");
              }}
              className="h-11 px-3 text-secondary hover:text-primary font-label-md text-label-md flex items-center gap-1 transition-colors active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Clear filters</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-[#F7F8FA] no-scrollbar">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider pr-1">
            Filter by Status:
          </span>
          {filterPills.map((pill) => {
            const isActive = selectedFilter === pill.value;
            if (pill.value === "ALL") {
              return (
                <button
                  key={pill.value}
                  onClick={() => setSelectedFilter("ALL")}
                  className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary-container text-on-primary shadow-xs"
                      : "bg-[#F3F4F6] text-secondary hover:bg-surface-container-low"
                  }`}
                  type="button"
                >
                  {pill.label}
                </button>
              );
            }
            return (
              <button
                key={pill.value}
                onClick={() => setSelectedFilter(isActive ? "ALL" : pill.value)}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm border transition-colors ${
                  isActive
                    ? "ring-2 ring-primary-container font-semibold " + pill.style
                    : pill.style
                }`}
                type="button"
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Transaction History Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="bg-surface-container-low/70 border-b border-outline-variant">
                <th
                  className="py-3.5 px-5 font-label-md text-label-md text-secondary uppercase tracking-wider"
                  scope="col"
                >
                  Date &amp; Time
                </th>
                <th
                  className="py-3.5 px-5 font-label-md text-label-md text-secondary uppercase tracking-wider"
                  scope="col"
                >
                  Merchant
                </th>
                <th
                  className="py-3.5 px-5 font-label-md text-label-md text-secondary uppercase tracking-wider"
                  scope="col"
                >
                  Reference
                </th>
                <th
                  className="py-3.5 px-5 font-label-md text-label-md text-secondary uppercase tracking-wider text-right"
                  scope="col"
                >
                  Amount
                </th>
                <th
                  className="py-3.5 px-5 font-label-md text-label-md text-secondary uppercase tracking-wider"
                  scope="col"
                >
                  MatchCheck Status
                </th>
                <th
                  className="py-3.5 px-5 font-label-md text-label-md text-secondary uppercase tracking-wider"
                  scope="col"
                >
                  Payment Status
                </th>
                <th
                  className="py-3.5 px-5 font-label-md text-label-md text-secondary uppercase tracking-wider text-right"
                  scope="col"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 font-body-md text-body-md text-on-surface">
              {filteredTransactions.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-surface-container-low/40 transition-colors group"
                >
                  {/* Date & Time */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="font-body-md text-body-md text-on-surface font-medium">
                      {row.date}
                    </div>
                    <div className="font-code-sm text-code-sm text-secondary">
                      {row.time}
                    </div>
                  </td>

                  {/* Merchant */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${row.initialsStyle}`}
                      >
                        {row.initials}
                      </div>
                      <div>
                        <div className="font-label-lg text-label-lg text-on-surface font-semibold group-hover:text-primary transition-colors">
                          {row.merchant}
                        </div>
                        <div className="font-body-sm text-body-sm text-secondary">
                          {row.merchantId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Reference */}
                  <td className="py-4 px-5 whitespace-nowrap font-code-md text-code-md text-secondary">
                    {row.reference}
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-5 whitespace-nowrap text-right">
                    <span className="font-code-md text-code-md font-semibold text-on-surface">
                      {row.amount}
                    </span>
                  </td>

                  {/* MatchCheck Status */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm border font-medium ${row.matchCheckStyle}`}
                    >
                      {row.matchCheckIcon === "dot" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#107E3E]"></span>
                      )}
                      {row.matchCheckIcon === "warning" && (
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                      )}
                      {row.matchCheckIcon === "block" && (
                        <span className="material-symbols-outlined text-[14px]">block</span>
                      )}
                      {row.matchCheckStatus}
                    </span>
                  </td>

                  {/* Payment Status */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm border font-medium ${row.paymentStyle}`}
                    >
                      {row.paymentIcon === "check_circle" && (
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      )}
                      {row.paymentIcon === "dot_gray" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280]"></span>
                      )}
                      {row.paymentIcon === "cancel" && (
                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                      )}
                      {row.paymentIcon === "sync" && (
                        <span className="material-symbols-outlined text-[14px]">sync</span>
                      )}
                      {row.paymentIcon === "error" && (
                        <span className="material-symbols-outlined text-[14px]">error</span>
                      )}
                      {row.paymentStatus}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-5 whitespace-nowrap text-right">
                    <Link
                      className="inline-flex items-center gap-1 text-primary hover:text-[#066653] font-label-md text-label-md font-semibold hover:underline"
                      href={row.href}
                    >
                      <span>{row.actionLabel}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-4 bg-surface-container-lowest border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-body-sm text-body-sm text-secondary">
            Showing <span className="font-semibold text-on-surface">1 - {filteredTransactions.length}</span> of{" "}
            <span className="font-semibold text-on-surface">34</span> checks
          </div>

          {/* Controls: Previous, Pages, Next */}
          <nav aria-label="Pagination" className="flex items-center gap-1.5">
            <button
              className="h-9 px-3 rounded-[8px] border border-outline-variant bg-surface-container-low text-secondary/40 font-label-md text-label-md flex items-center gap-1 cursor-not-allowed"
              disabled
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span className="hidden sm:inline">Previous</span>
            </button>
            <button
              className="h-9 w-9 rounded-[8px] bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center shadow-xs"
              type="button"
            >
              1
            </button>
            <button
              className="h-9 w-9 rounded-[8px] border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center justify-center transition-colors"
              type="button"
            >
              2
            </button>
            <button
              className="h-9 w-9 rounded-[8px] border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center justify-center transition-colors"
              type="button"
            >
              3
            </button>
            <button
              className="h-9 w-9 rounded-[8px] border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center justify-center transition-colors"
              type="button"
            >
              4
            </button>
            <button
              className="h-9 px-3 rounded-[8px] border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors"
              type="button"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Routing Annotation Note Bar */}
      <div className="mt-6 bg-surface-container-low border border-outline-variant rounded-[12px] p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">
          info
        </span>
        <div className="flex-1 font-body-sm text-body-sm text-secondary">
          <span className="font-semibold text-on-surface">Routing Note:</span> Transactions with a
          PayPal order navigate to Transaction Detail (
          <span className="font-code-sm text-code-sm text-primary font-medium">/transactions/[id]</span>
          ). Screenings blocked or abandoned prior to order creation navigate to read-only AI Match &amp; Safety Check (
          <span className="font-code-sm text-code-sm text-primary font-medium">/checks/[id]</span>
          ).
        </div>
      </div>
    </main>
  );
}
