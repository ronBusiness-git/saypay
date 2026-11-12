"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TransactionDetailSkeleton } from "../../../components/ui/LoadingSkeletons.js";

function getStatusMeta(paymentStatus, matchCheckStatus) {
  const status = (paymentStatus || "").toUpperCase();
  const check = (matchCheckStatus || "").toUpperCase();

  if (status === "COMPLETED" || status === "PAID") {
    return {
      tone: "emerald",
      badgeClass: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      heroClass: "border-[#A7F3D0] bg-gradient-to-br from-[#FFFFFF] to-[#EAF7F1]",
      iconBg: "bg-[#EAF7F1] border-[#A7F3D0] text-[#107E3E]",
      icon: "verified",
      headline: status === "PAID" ? "Invoice Paid & Settled" : "Payment Verified & Completed",
      description:
        "Authoritative payment record confirmed. Funds settlement and MatchCheck verification are recorded below.",
    };
  }

  if (status === "BLOCKED" || check === "BLOCKED") {
    return {
      tone: "red",
      badgeClass: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      heroClass: "border-[#FECACA] bg-gradient-to-br from-[#FFFFFF] to-[#FEF2F2]",
      iconBg: "bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]",
      icon: "gpp_bad",
      headline: "Payment Blocked by Safety Engine",
      description:
        "MatchCheck flagged high-risk discrepancies or policy violations. No PayPal order was created.",
    };
  }

  if (status === "FAILED") {
    return {
      tone: "red",
      badgeClass: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      heroClass: "border-[#FECACA] bg-gradient-to-br from-[#FFFFFF] to-[#FEF2F2]",
      iconBg: "bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]",
      icon: "error",
      headline: "Payment Capture Failed",
      description:
        "The payment attempt failed during PayPal capture. No funds were settled.",
    };
  }

  if (status === "CANCELLED") {
    return {
      tone: "slate",
      badgeClass: "bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]",
      heroClass: "border-[#DFE5E8] bg-gradient-to-br from-[#FFFFFF] to-[#F7F8FA]",
      iconBg: "bg-[#F3F4F6] border-[#D1D5DB] text-[#4B5563]",
      icon: "cancel",
      headline: "Payment Cancelled",
      description:
        "This transaction was cancelled prior to settlement. No funds were charged.",
    };
  }

  if (status === "APPROVED" && check === "CLEAR") {
    return {
      tone: "emerald",
      badgeClass: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
      heroClass: "border-[#A7F3D0] bg-gradient-to-br from-[#FFFFFF] to-[#EAF7F1]",
      iconBg: "bg-[#EAF7F1] border-[#A7F3D0] text-[#107E3E]",
      icon: "check_circle",
      headline: "MatchCheck Clear · Approved for Payment",
      description:
        "Voice intent and payment request matched cleanly. Ready to complete checkout via PayPal Sandbox.",
    };
  }

  return {
    tone: "amber",
    badgeClass: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
    heroClass: "border-[#FDE68A] bg-gradient-to-br from-[#FFFFFF] to-[#FFFBEB]",
    iconBg: "bg-[#FEF3C7] border-[#FDE68A] text-[#B45309]",
    icon: "pending",
    headline:
      status === "UNPAID"
        ? "Invoice Awaiting Payment"
        : check === "REVIEW"
          ? "Needs Review Before Payment"
          : "Payment Pending Verification",
    description:
      status === "UNPAID"
        ? "This invoice has been issued and is awaiting buyer verification and payment."
        : "This record is pending final review or PayPal capture confirmation.",
  };
}

function getCheckBadgeClass(status) {
  const s = (status || "").toUpperCase();
  if (s === "CLEAR" || s === "SETTLED") {
    return "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]";
  }
  if (s === "BLOCKED" || s === "CANCELLED") {
    return "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]";
  }
  return "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]";
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const handleCopy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-xl border border-[#DFE5E8] bg-[#F6FAFF] p-3">
      <p className="font-label-sm text-label-sm uppercase tracking-wider text-[#52606C]">
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate font-code-md text-[12px] font-semibold text-[#0F1D27]">
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          title={`Copy ${label}`}
          className="shrink-0 rounded p-1 text-[#52606C] transition-colors hover:bg-white hover:text-[#006451]"
        >
          <span className="material-symbols-outlined text-[15px]">
            {copied ? "done" : "content_copy"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function DynamicReceiptPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/receipt/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.receipt) {
          throw new Error(data.error || "Receipt record not found");
        }
        if (active) setReceipt(data.receipt);
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to load receipt");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <TransactionDetailSkeleton />;
  }

  if (error || !receipt) {
    return (
      <main className="mx-auto w-full max-w-[920px] flex-1 px-4 py-10 md:px-margin-desktop">
        <div className="rounded-2xl border border-[#FECACA] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#FECACA] bg-[#FEE2E2] text-[#DC2626]">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-[#0F1D27]">
            Receipt Not Found
          </h1>
          <p className="mt-1 font-body-md text-body-md text-[#52606C]">
            {error || `No receipt record exists for "${id}".`}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-[#0F1D27] hover:bg-[#F7F8FA]"
            >
              <span className="material-symbols-outlined text-[17px]">dashboard</span>
              Dashboard
            </Link>
            <Link
              href="/history"
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#087F68] px-4 font-label-md text-label-md font-semibold text-white hover:bg-[#006451]"
            >
              <span className="material-symbols-outlined text-[17px]">history</span>
              View History
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const meta = getStatusMeta(receipt.paymentStatus, receipt.matchCheckStatus);
  const initials = (receipt.merchantName || "SP").slice(0, 2).toUpperCase();
  const formattedDate = receipt.createdAt
    ? new Date(receipt.createdAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : "—";

  const canCheckout =
    receipt.checkId &&
    receipt.matchCheckStatus === "CLEAR" &&
    receipt.paymentStatus !== "COMPLETED" &&
    receipt.paymentStatus !== "PAID";

  return (
    <main className="mx-auto w-full max-w-[1000px] flex-1 space-y-6 px-4 py-8 sm:px-6 md:px-margin-desktop">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-label-md text-label-md text-[#52606C] transition-colors hover:text-[#006451]"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Dashboard
          </Link>
          <span className="text-[#BDC9C3]">/</span>
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 font-label-md text-label-md text-[#52606C] transition-colors hover:text-[#006451]"
          >
            History
          </Link>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-3.5 font-label-md text-label-md font-semibold text-[#0F1D27] transition-colors hover:bg-[#F6FAFF]"
          >
            <span className="material-symbols-outlined text-[17px] text-[#52606C]">print</span>
            Print Receipt
          </button>
          {canCheckout && (
            <Link
              href={`/checkout/${encodeURIComponent(receipt.checkId)}`}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] bg-[#087F68] px-4 font-label-md text-label-md font-semibold text-white shadow-sm transition-colors hover:bg-[#006451]"
            >
              <span className="material-symbols-outlined text-[17px]">payments</span>
              Continue to PayPal
            </Link>
          )}
        </div>
      </div>

      {/* Status Hero Banner */}
      <section className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${meta.heroClass}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${meta.iconBg}`}
            >
              <span
                className="material-symbols-outlined text-[26px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {meta.icon}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-bold ${meta.badgeClass}`}
                >
                  Payment: {receipt.paymentStatus}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-bold ${getCheckBadgeClass(receipt.matchCheckStatus)}`}
                >
                  MatchCheck: {receipt.matchCheckStatus}
                </span>
              </div>
              <h1 className="mt-2 font-headline-md text-headline-md font-bold text-[#0F1D27]">
                {meta.headline}
              </h1>
              <p className="mt-1 font-body-md text-body-md text-[#52606C]">
                {meta.description}
              </p>
            </div>
          </div>

          <div className="shrink-0 sm:text-right">
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-[#52606C]">
              Total Amount
            </p>
            <p className="mt-0.5 font-display-lg text-display-lg font-bold tracking-tight text-[#006451]">
              {receipt.currency} {receipt.amountFormatted}
            </p>
          </div>
        </div>
      </section>

      {/* Main Receipt Card */}
      <section className="overflow-hidden rounded-2xl border border-[#DFE5E8] bg-white shadow-[0_1px_3px_rgba(15,29,39,0.04),0_4px_12px_rgba(15,29,39,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFE5E8] bg-[#F6FAFF] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#006451]">
              receipt_long
            </span>
            <h2 className="font-headline-sm text-headline-sm font-semibold text-[#0F1D27]">
              Official SayPay Receipt
            </h2>
            <span className="rounded-md border border-[#DFE5E8] bg-white px-2 py-0.5 font-code-sm text-code-sm font-semibold text-[#0F1D27]">
              {receipt.receiptNumber}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-[#107E3E]">
            <span className="material-symbols-outlined text-[13px]">shield</span>
            PayPal Sandbox
          </span>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {/* Merchant & Counterparty Summary */}
          <div className="flex flex-col gap-4 border-b border-[#F0F3F5] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#A7F3D0] bg-[#EAF7F1] font-label-lg text-label-lg font-bold text-[#006451]">
                {initials}
              </span>
              <div>
                <p className="font-label-lg text-label-lg font-bold text-[#0F1D27]">
                  {receipt.merchantName}
                </p>
                <p className="font-code-sm text-code-sm text-[#52606C]">
                  Reference: {receipt.reference}
                  {receipt.buyerEmail ? ` · Buyer: ${receipt.buyerEmail}` : ""}
                </p>
                <p className="mt-0.5 font-body-sm text-body-sm text-[#52606C]">
                  {receipt.purpose}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-[#52606C]">
                Recorded At
              </p>
              <p className="mt-0.5 font-code-md text-[12px] font-medium text-[#0F1D27]">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Copyable Identifiers Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <CopyField label="Receipt ID" value={receipt.receiptNumber} />
            <CopyField label="Transaction ID" value={receipt.transactionId} />
            <CopyField label="Check ID" value={receipt.checkId} />
            <CopyField label="Invoice ID" value={receipt.invoiceId} />
            <CopyField label="PayPal Order ID" value={receipt.paypalOrderId} />
            <CopyField label="PayPal Capture ID" value={receipt.captureId} />
          </div>

          {/* Reason Codes if any */}
          {Array.isArray(receipt.reasonCodes) && receipt.reasonCodes.length > 0 && (
            <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
              <p className="font-label-md text-label-md font-semibold text-[#B45309]">
                MatchCheck Flags
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {receipt.reasonCodes.map((code) => (
                  <span
                    key={code}
                    className="rounded-md border border-[#FDE68A] bg-white px-2.5 py-1 font-code-sm text-code-sm font-medium text-[#B45309]"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Two-Source Comparison if available */}
          {receipt.intent && receipt.request && (
            <div className="rounded-xl border border-[#DFE5E8] bg-[#F6FAFF] p-4">
              <h3 className="font-label-md text-label-md font-semibold text-[#0F1D27]">
                Two-Source Verification Snapshot
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#DFE5E8] bg-white p-3">
                  <p className="font-label-sm text-label-sm uppercase tracking-wider text-[#52606C]">
                    Voice / User Intent
                  </p>
                  <p className="mt-1 font-body-md text-body-md font-semibold text-[#0F1D27]">
                    {receipt.intent.recipientName || receipt.merchantName}
                  </p>
                  <p className="font-code-sm text-code-sm text-[#52606C]">
                    {receipt.intent.currency || receipt.currency}{" "}
                    {receipt.intent.amount || receipt.amountFormatted} · Ref:{" "}
                    {receipt.intent.reference || receipt.reference}
                  </p>
                </div>
                <div className="rounded-lg border border-[#DFE5E8] bg-white p-3">
                  <p className="font-label-sm text-label-sm uppercase tracking-wider text-[#52606C]">
                    Merchant Payment Request
                  </p>
                  <p className="mt-1 font-body-md text-body-md font-semibold text-[#0F1D27]">
                    {receipt.request.recipientName || receipt.merchantName}
                  </p>
                  <p className="font-code-sm text-code-sm text-[#52606C]">
                    {receipt.request.currency || receipt.currency}{" "}
                    {receipt.request.amount || receipt.amountFormatted} · Ref:{" "}
                    {receipt.request.reference || receipt.reference}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="flex flex-col gap-3 border-t border-[#F0F3F5] pt-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <p className="font-body-sm text-body-sm text-[#52606C]">
              Record type: <span className="font-semibold capitalize text-[#0F1D27]">{receipt.recordType}</span> · Backed by live MongoDB & PayPal Sandbox
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {receipt.checkId && (
                <Link
                  href={`/checks/${encodeURIComponent(receipt.checkId)}`}
                  className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-[#006451] hover:underline"
                >
                  View MatchCheck Details
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                </Link>
              )}
              <Link
                href="/new-check"
                className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-[#006451] hover:underline"
              >
                New Payment Check
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
