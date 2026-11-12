"use client";

import React from "react";
import Link from "next/link";

export default function RecentVerificationsTable({ onSelectCheck }) {
  const verifications = [
    {
      id: "chk_demo_204",
      merchant: "GreenLeaf Demo Store",
      amount: "USD 12.50",
      status: "CLEAR",
      badgeText: "CLEAR",
      badgeClass: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      icon: "check",
      order: "ORDER-DEMO-204",
    },
    {
      id: "chk_demo_203",
      merchant: "Aura Cloud Hosting",
      amount: "USD 125.00",
      status: "REVIEW",
      badgeText: "REVIEW (+USD 112.50)",
      badgeClass: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
      icon: "warning",
      order: "ORDER-DEMO-203",
    },
    {
      id: "chk_demo_202",
      merchant: "Untrusted Escrow Node 7",
      amount: "USD 50.00",
      status: "BLOCKED",
      badgeText: "BLOCKED",
      badgeClass: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      icon: "block",
      order: "— (Restricted)",
    },
  ];

  return (
    <>{/* Rows for recent verifications */}
        {verifications.map((row) => (
          <tr key={row.id} className="hover:bg-surface-bright transition-colors group">
            <td className="py-3.5 px-3 font-code-sm text-code-sm text-primary font-medium">{row.id}</td>
            <td className="py-3.5 px-3 font-medium text-on-surface">{row.merchant}</td>
            <td className="py-3.5 px-3 font-code-md text-code-md text-on-surface font-semibold">{row.amount}</td>
            <td className="py-3.5 px-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-label-sm text-label-sm font-semibold ${row.badgeClass}`}>
                <span className="material-symbols-outlined text-[14px]">{row.icon}</span>
                {row.badgeText}
              </span>
            </td>
            <td className="py-3.5 px-3 font-code-sm text-code-sm text-secondary">{row.order}</td>
            <td className="py-3.5 px-3 text-right">
              <Link href={`/checks/${row.id}`} className="font-label-sm text-label-sm text-primary hover:text-[#066653] font-semibold underline underline-offset-2">
                Inspect
              </Link>
            </td>
          </tr>
        ))}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFE5E8] pb-4">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Recent Sandbox Verifications
          </h2>
          <p className="font-body-sm text-body-sm text-secondary">
            Historical screening sessions executed in current demo container
          </p>
        </div>

        <Link
          href="/history"
          className="font-label-md text-label-md text-primary hover:text-primary-container flex items-center gap-1 transition-colors font-semibold"
        >
          <span>View All Checks</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </Link>
      </div>

      {/* Tabular List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#DFE5E8] text-secondary font-label-sm text-label-sm">
              <th className="py-2.5 px-3 font-semibold">Check ID</th>
              <th className="py-2.5 px-3 font-semibold">Merchant / Recipient</th>
              <th className="py-2.5 px-3 font-semibold">Amount</th>
              <th className="py-2.5 px-3 font-semibold">Safety Status</th>
              <th className="py-2.5 px-3 font-semibold">PayPal Gateway Order</th>
              <th className="py-2.5 px-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE5E8] font-body-md text-body-md">
            {verifications.map((row) => (
              <tr key={row.id} className="hover:bg-surface-bright transition-colors group">
                <td className="py-3.5 px-3 font-code-sm text-code-sm text-primary font-medium">
                  {row.id}
                </td>
                <td className="py-3.5 px-3 font-medium text-on-surface">{row.merchant}</td>
                <td className="py-3.5 px-3 font-code-md text-code-md text-on-surface font-semibold">
                  {row.amount}
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-label-sm text-label-sm font-semibold ${row.badgeClass}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{row.icon}</span>
                    {row.badgeText}
                  </span>
                </td>
                <td className="py-3.5 px-3 font-code-sm text-code-sm text-secondary">
                  {row.order}
                </td>
                <td className="py-3.5 px-3 text-right">
                  <Link
                    href={`/checks/${row.id}`}
                    className="font-label-sm text-label-sm text-primary hover:text-[#066653] font-semibold underline underline-offset-2"
                  >
                    Inspect
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
