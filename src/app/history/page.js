"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { GridTableSkeleton } from "../../components/ui/LoadingSkeletons.js";

const SayPayGrid = dynamic(
  () => import("../../components/grid/SayPayGrid.js"),
  {
    ssr: false,
    loading: () => (
      <GridTableSkeleton rows={8} label="Loading transaction history…" />
    ),
  },
);

const FILTER_PILLS = [
  { label: "All Transactions", value: "ALL", style: "border-[#DFE5E8] bg-white text-secondary" },
  { label: "Completed", value: "COMPLETED", style: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]" },
  { label: "Checked Clear", value: "CHECKED_CLEAR", style: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]" },
  { label: "Review", value: "REVIEW", style: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]" },
  { label: "Blocked", value: "BLOCKED", style: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]" },
];

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [realTransactions, setRealTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const gridApiRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/transactions?limit=100&_t=${Date.now()}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          const mapped = data.items.map((tx) => {
            const dateObj = new Date(tx.createdAt || Date.now());
            const dateStr = dateObj.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const timeStr = dateObj.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const initials = (tx.merchantKey || "GL").slice(0, 2).toUpperCase();
            const amountStr = `${tx.currency || "USD"} ${((tx.amountMinor || 0) / 100).toFixed(2)}`;

            const status = (tx.paymentStatus || "COMPLETED").toUpperCase();
            const isCompleted = status === "COMPLETED";
            const isFailedOrCancelled = status === "FAILED" || status === "CANCELLED";

            return {
              id: tx.checkId || tx.transactionId,
              transactionId: tx.transactionId,
              sortDate: tx.createdAt,
              date: dateStr,
              time: `${timeStr} UTC`,
              initials,
              initialsStyle: "bg-[#EAF7F1] text-primary border-[#A7F3D0]",
              merchant: tx.merchantKey || "GreenLeaf Demo Store",
              merchantId: `ID: ${tx.paypalOrderId || tx.transactionId?.slice(0, 8)}`,
              reference: `ref: ${tx.reference || "GL-1042"}`,
              amount: amountStr,
              matchCheckStatus: "CLEAR",
              matchCheckCategory: "CLEAR",
              matchCheckIcon: "dot",
              matchCheckStyle: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
              paymentStatus: status,
              paymentCategory: status,
              paymentIcon: isCompleted ? "check_circle" : isFailedOrCancelled ? "error" : "warning",
              paymentStyle: isCompleted
                ? "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]"
                : isFailedOrCancelled
                ? "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
                : "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
              actionLabel: "Receipt",
              href: `/receipt/${encodeURIComponent(tx.transactionId || tx.checkId)}`,
            };
          });
          setRealTransactions(mapped);
        }
      })
      .catch((err) => console.warn("Failed to load history:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTransactions = useMemo(() => {
    return realTransactions.filter((t) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        search === "" ||
        t.merchant.toLowerCase().includes(search) ||
        t.reference.toLowerCase().includes(search) ||
        t.id.toLowerCase().includes(search) ||
        (t.transactionId && t.transactionId.toLowerCase().includes(search));

      const matchesStatus =
        selectedFilter === "ALL" ||
        t.paymentCategory === selectedFilter ||
        t.matchCheckCategory === selectedFilter;

      return matchesSearch && matchesStatus;
    });
  }, [realTransactions, searchTerm, selectedFilter]);

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
          icon: row.paymentIcon,
        },
        action: { href: row.href, label: row.actionLabel },
      })),
    [filteredTransactions],
  );

  const handleExportCsv = () => {
    if (gridApiRef.current && typeof gridApiRef.current.exportDataAsCsv === "function") {
      gridApiRef.current.exportDataAsCsv({
        fileName: `saypay_transactions_${new Date().toISOString().split("T")[0]}.csv`,
      });
    } else {
      const headers = ["ID", "Date", "Merchant", "Reference", "Amount", "MatchCheck", "PaymentStatus"];
      const rows = filteredTransactions.map((t) => [
        `"${t.id}"`,
        `"${t.date} ${t.time}"`,
        `"${t.merchant}"`,
        `"${t.reference}"`,
        `"${t.amount}"`,
        `"${t.matchCheckStatus}"`,
        `"${t.paymentStatus}"`,
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `saypay_transactions_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
              Live PayPal Sandbox
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Transaction History
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Showing {filteredTransactions.length} of {realTransactions.length} verified database transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md h-11 px-4 rounded-[10px] transition-colors shadow-sm active:scale-[0.98]"
            type="button"
            title="Download CSV"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">download</span>
            <span>Export CSV</span>
          </button>
          <Link
            href="/new-check"
            className="inline-flex items-center justify-center gap-2 bg-primary-container hover:bg-[#066653] text-on-primary font-label-md text-label-md h-11 px-5 rounded-[10px] shadow-sm transition-all duration-150 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>New Payment Check</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
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

          {/* Clear Filters */}
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

        {/* Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-[#F7F8FA] no-scrollbar">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider pr-1">
            Status:
          </span>
          {FILTER_PILLS.map((pill) => {
            const isActive = selectedFilter === pill.value;
            return (
              <button
                key={pill.value}
                onClick={() => setSelectedFilter(pill.value)}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm border transition-all ${
                  isActive
                    ? "bg-primary-container text-white font-bold border-primary-container shadow-xs"
                    : "bg-white text-secondary hover:bg-surface-container-low " + pill.style
                }`}
                type="button"
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* AG Grid Container with Live Loading & Empty State */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)] min-h-[320px]">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#087F68] border-t-transparent" />
            <p className="font-label-lg text-label-lg font-semibold text-on-surface">
              Fetching latest transaction records…
            </p>
            <p className="font-body-sm text-body-sm text-secondary">
              Synchronizing with MongoDB Atlas transactions collection
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center p-6">
            <span className="material-symbols-outlined text-[48px] text-secondary/60 mb-2">
              receipt_long
            </span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              No records found
            </h3>
            <p className="font-body-sm text-body-sm text-secondary mt-1 max-w-sm">
              {searchTerm || selectedFilter !== "ALL"
                ? "No transactions match your current search or status filter. Try clearing filters."
                : "No completed transactions recorded yet. Complete a payment via PayPal Sandbox to see it here."}
            </p>
            {(searchTerm || selectedFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedFilter("ALL");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-3 py-1.5 font-label-md text-label-md font-semibold text-secondary hover:text-on-surface transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="p-1.5 sm:p-2">
            <SayPayGrid
              variant="history"
              rowData={gridRows}
              pagination
              paginationPageSize={10}
              onGridReady={handleGridReady}
              ariaLabel="Transaction history"
            />
          </div>
        )}

        {/* Summary Footer */}
        <div className="px-5 py-4 bg-surface-container-lowest border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-body-sm text-body-sm text-secondary">
            Showing <span className="font-semibold text-on-surface">{filteredTransactions.length}</span> of{" "}
            <span className="font-semibold text-on-surface">{realTransactions.length}</span> database records
          </div>
          <div className="font-code-sm text-code-sm text-secondary">
            Database: MongoDB Atlas · Collection: transactions
          </div>
        </div>
      </div>
    </main>
  );
}
