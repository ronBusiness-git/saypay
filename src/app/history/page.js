"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const SayPayGrid = dynamic(
  () => import("../../components/grid/SayPayGrid.js"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center bg-[#F7F8FA] text-center">
        <span className="font-body-sm text-body-sm text-secondary">
          Loading transaction history…
        </span>
      </div>
    ),
  },
);

const transactions = [
  {
    id: "chk_demo_204",
    sortDate: "2024-05-24T14:32",
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
    sortDate: "2024-05-24T11:15",
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
    sortDate: "2024-05-23T18:40",
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
    sortDate: "2024-05-23T16:05",
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
    sortDate: "2024-05-22T09:20",
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
    sortDate: "2024-05-21T15:45",
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
    sortDate: "2024-05-21T10:12",
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
    sortDate: "2024-05-20T17:30",
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
    sortDate: "2024-05-19T13:10",
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
    sortDate: "2024-05-18T11:00",
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

/**
 * SayPay Transaction History Page
 * Exact UI based on the design mockup and reference HTML.
 */
export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const gridApiRef = useRef(null);

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

  const gridRows = useMemo(
    () =>
      filteredTransactions.map((row) => ({
        id: row.id,
        sortDate: row.sortDate,
        date: row.date,
        time: row.time,
        initials: row.initials,
        initialsStyle: row.initialsStyle,
        merchant: row.merchant,
        merchantId: row.merchantId,
        reference: row.reference,
        amount: row.amount,
        matchCheck: {
          label: row.matchCheckStatus,
          className: row.matchCheckStyle,
          icon: row.matchCheckIcon,
        },
        payment: {
          label: row.paymentStatus,
          className: row.paymentStyle,
          icon: row.paymentIcon === "dot_gray" ? "dot" : row.paymentIcon,
        },
        action: { href: row.href, label: row.actionLabel },
      })),
    [filteredTransactions],
  );

  useEffect(() => {
    gridApiRef.current?.paginationGoToFirstPage();
  }, [searchTerm, selectedFilter]);

  const handleGridReady = (event) => {
    gridApiRef.current = event.api;
  };

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
            <span>New Payment Check</span>
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

      {/* Comprehensive Transaction History Grid Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
        <div className="p-1.5 sm:p-2">
          <SayPayGrid
            variant="history"
            rowData={gridRows}
            pagination
            paginationPageSize={8}
            onGridReady={handleGridReady}
            ariaLabel="Transaction history"
          />
        </div>

        {/* Summary Footer */}
        <div className="px-5 py-4 bg-surface-container-lowest border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-body-sm text-body-sm text-secondary">
            Showing <span className="font-semibold text-on-surface">{filteredTransactions.length}</span> of{" "}
            <span className="font-semibold text-on-surface">34</span> checks
          </div>
          <div className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
            <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
            Sortable columns · server-backed audit record
          </div>
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
