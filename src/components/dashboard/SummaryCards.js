"use client";

import React from "react";
import Link from "next/link";

export default function SummaryCards({
  stats = {
    total: 34,
    cleared: 24,
    review: 7,
    blocked: 3,
    completed: 18,
  },
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Total Checks */}
      <Link
        href="/history"
        className="bg-surface-container-lowest border border-[#DFE5E8] rounded-[16px] p-4 shadow-[0_1px_3px_rgba(21,35,45,0.04)] hover:border-primary/40 transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-secondary group-hover:text-primary transition-colors">
            Total Checks
          </span>
          <span className="material-symbols-outlined text-secondary text-[20px] group-hover:text-primary transition-colors">
            fact_check
          </span>
        </div>
        <p className="font-display-lg text-[28px] sm:text-[32px] font-bold text-on-surface mt-2">
          {stats.total}
        </p>
        <span className="font-body-sm text-body-sm text-secondary mt-1 block">
          All attempted runs
        </span>
      </Link>

      {/* 2. Cleared */}
      <Link
        href="/history?status=CLEAR"
        className="bg-surface-container-lowest border border-[#DFE5E8] rounded-[16px] p-4 shadow-[0_1px_3px_rgba(21,35,45,0.04)] hover:border-[#107E3E]/40 transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-secondary group-hover:text-[#107E3E] transition-colors">
            Cleared
          </span>
          <span className="material-symbols-outlined text-[#107E3E] text-[20px]">
            check_circle
          </span>
        </div>
        <p className="font-display-lg text-[28px] sm:text-[32px] font-bold text-[#107E3E] mt-2">
          {stats.cleared}
        </p>
        <span className="font-body-sm text-body-sm text-secondary mt-1 block">
          100% parameter match
        </span>
      </Link>

      {/* 3. Needs Review */}
      <Link
        href="/history?status=REVIEW"
        className="bg-surface-container-lowest border border-[#DFE5E8] rounded-[16px] p-4 shadow-[0_1px_3px_rgba(21,35,45,0.04)] hover:border-[#B45309]/40 transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-secondary group-hover:text-[#B45309] transition-colors">
            Needs Review
          </span>
          <span className="material-symbols-outlined text-[#B45309] text-[20px]">
            warning
          </span>
        </div>
        <p className="font-display-lg text-[28px] sm:text-[32px] font-bold text-[#B45309] mt-2">
          {stats.review}
        </p>
        <span className="font-body-sm text-body-sm text-secondary mt-1 block">
          Discrepancies flagged
        </span>
      </Link>

      {/* 4. Blocked */}
      <Link
        href="/history?status=BLOCKED"
        className="bg-surface-container-lowest border border-[#DFE5E8] rounded-[16px] p-4 shadow-[0_1px_3px_rgba(21,35,45,0.04)] hover:border-[#DC2626]/40 transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-secondary group-hover:text-[#DC2626] transition-colors">
            Blocked
          </span>
          <span className="material-symbols-outlined text-[#DC2626] text-[20px]">
            block
          </span>
        </div>
        <p className="font-display-lg text-[28px] sm:text-[32px] font-bold text-[#DC2626] mt-2">
          {stats.blocked}
        </p>
        <span className="font-body-sm text-body-sm text-secondary mt-1 block">
          Policy / scam halted
        </span>
      </Link>

      {/* 5. Completed Sandbox Payments (Visually highlighted / separated) */}
      <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[#EAF7F1] to-surface-container-lowest border border-[#A7F3D0] rounded-[16px] p-4 shadow-[0_1px_3px_rgba(21,35,45,0.04)]">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-primary-container font-semibold">
            Completed Payments
          </span>
          <span className="material-symbols-outlined text-primary-container text-[20px]">
            payments
          </span>
        </div>
        <p className="font-display-lg text-[28px] sm:text-[32px] font-bold text-primary-container mt-2">
          {stats.completed}
        </p>
        <div className="flex items-center gap-1 mt-1 text-[11px] text-[#107E3E] font-medium">
          <span className="material-symbols-outlined text-[13px]">verified</span>
          <span>verified by backend</span>
        </div>
      </div>
    </div>
  );
}
