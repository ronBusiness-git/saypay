"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";

function TransactionDetailContent({ params }) {
  const resolvedParams = params && typeof params.then === "function" ? React.use(params) : params;
  const checkId = resolvedParams?.checkId || "chk_demo_204";
  const txnId = "txn_demo_204";

  const [copiedId, setCopiedId] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedCapture, setCopiedCapture] = useState(false);

  const copyToClipboard = (text, setter) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    }
  };

  return (
    <main className="flex-1 w-full max-w-[1040px] mx-auto px-4 sm:px-6 md:px-margin-desktop py-space-xl space-y-space-lg">
      {/* Page Header & Metadata Line */}
      <section className="space-y-4">
        {/* Breadcrumb navigation */}
        <div>
          <Link
            className="inline-flex items-center gap-1.5 text-secondary hover:text-primary font-label-md text-label-md transition-colors duration-150"
            href="/history"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to History</span>
          </Link>
        </div>

        {/* Top Title & Quick Actions Flexbox */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                Transaction Details
              </h1>
              {/* Copyable Transaction ID Pill */}
              <div className="inline-flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant">
                <span className="font-code-md text-code-md text-on-surface font-semibold">
                  {txnId}
                </span>
                <button
                  className="text-secondary hover:text-primary p-0.5 rounded transition-colors"
                  onClick={() => copyToClipboard(txnId, setCopiedId)}
                  title="Copy Transaction ID"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {copiedId ? "done" : "content_copy"}
                  </span>
                </button>
              </div>
              <span className="text-outline text-xs">originating:</span>
              <span className="font-code-md text-code-md text-primary font-medium">
                {checkId}
              </span>
            </div>

            {/* Paired Status Badges */}
            <div className="flex items-center gap-2 pt-0.5">
              {/* MatchCheck CLEAR badge */}
              <span className="inline-flex items-center gap-1 bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>MatchCheck: CLEAR</span>
              </span>
              {/* Payment COMPLETED badge */}
              <span className="inline-flex items-center gap-1 bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Payment: COMPLETED</span>
              </span>
            </div>
          </div>

          {/* Right Quick Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/new-check"
              className="inline-flex items-center justify-center gap-2 bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low px-4 py-2.5 rounded-lg font-label-md text-label-md active:scale-[0.98] transition-all shadow-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              <span>Run a similar check</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 1. Receipt Section (Verified Backend Receipt) */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm relative overflow-hidden">
        {/* Top banner / Verified status in Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-[#F7F8FA] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EAF7F1] border border-[#A7F3D0] flex items-center justify-center text-[#107E3E]">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Verified Backend Receipt
                </span>
                <span className="inline-flex items-center gap-1 bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] rounded-full px-2 py-0.5 font-label-sm text-label-sm">
                  PayPal Sandbox
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                Authoritative captured order confirmed via PayPal v2 Checkout API.
              </p>
            </div>
          </div>
          <div className="text-right sm:self-center">
            <span className="font-display-lg text-display-lg font-bold text-primary tracking-tight">
              USD 12.50
            </span>
            <span className="block font-label-sm text-label-sm text-[#107E3E] font-semibold">
              Exact Match Confirmed
            </span>
          </div>
        </div>

        {/* Key attributes grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-5">
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">
              Merchant
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-body-md text-body-md font-semibold text-on-surface">
                GreenLeaf Demo Store
              </span>
              <span
                className="material-symbols-outlined text-[#107E3E] text-[16px]"
                title="Verified Demo Merchant"
              >
                check_circle
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-secondary">
              merchant_gl_sandbox_99
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">
              Invoice Reference
            </span>
            <span className="font-code-md text-code-md font-semibold text-on-surface bg-surface-container px-2 py-0.5 rounded">
              GL-204
            </span>
            <span className="font-body-sm text-body-sm text-secondary block">
              Validated against mock ERP
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">
              Timestamp
            </span>
            <span className="font-body-md text-body-md font-medium text-on-surface">
              24 May 2024, 14:32:08 UTC
            </span>
            <span className="font-code-sm text-code-sm text-secondary block">
              1716561128000
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">
              Confirmation Method
            </span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">mic</span>
              <span className="font-body-md text-body-md font-medium text-on-surface">
                Voice passkey
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-secondary italic">
              &quot;Confirm Pay&quot; authorized by user
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">
              PayPal Order ID
            </span>
            <div className="flex items-center gap-2">
              <span className="font-code-md text-code-md font-semibold text-on-surface">
                ORDER-DEMO-204
              </span>
              <button
                className="text-secondary hover:text-primary"
                onClick={() => copyToClipboard("ORDER-DEMO-204", setCopiedOrder)}
                type="button"
                title="Copy PayPal Order ID"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copiedOrder ? "done" : "content_copy"}
                </span>
              </button>
            </div>
            <span className="font-body-sm text-body-sm text-secondary">
              v2/checkout/orders
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">
              PayPal Capture ID
            </span>
            <div className="flex items-center gap-2">
              <span className="font-code-md text-code-md font-semibold text-on-surface">
                CAPTURE-DEMO-204
              </span>
              <button
                className="text-secondary hover:text-primary"
                onClick={() => copyToClipboard("CAPTURE-DEMO-204", setCopiedCapture)}
                type="button"
                title="Copy PayPal Capture ID"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copiedCapture ? "done" : "content_copy"}
                </span>
              </button>
            </div>
            <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-[#107E3E] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#107E3E]"></span> Captured and settled in sandbox
            </span>
          </div>
        </div>
      </section>

      {/* 2. StatusTimeline (Sequential stages with timestamps) */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">linear_scale</span>
            <span>Transaction Progression Timeline</span>
          </h2>
          <span className="font-label-sm text-label-sm text-secondary">
            Total processing duration: 27 seconds
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
          {/* Stage 1 */}
          <div className="relative group">
            <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs ring-4 ring-surface-container-lowest">
              <span className="material-symbols-outlined text-[14px]">mic</span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">
                  Stage 1: Intent Spoken
                </h3>
                <span className="font-code-sm text-code-sm text-secondary bg-surface-container-low px-2 py-0.5 rounded">
                  14:31:42 UTC
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface bg-surface-bright p-3 rounded-lg border border-outline-variant italic">
                &quot;I want to pay GreenLeaf Demo Store USD 12.50 for invoice GL-204&quot;
              </p>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="relative group">
            <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs ring-4 ring-surface-container-lowest">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">
                  Stage 2: AI Match &amp; Entity Extraction
                </h3>
                <span className="font-code-sm text-code-sm text-secondary bg-surface-container-low px-2 py-0.5 rounded">
                  14:31:45 UTC
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                Entities extracted:{" "}
                <code className="font-code-sm text-on-surface font-semibold bg-surface-container px-1 py-0.5 rounded">
                  merchant=&quot;GreenLeaf Demo Store&quot;
                </code>
                ,{" "}
                <code className="font-code-sm text-on-surface font-semibold bg-surface-container px-1 py-0.5 rounded">
                  amount=12.50
                </code>
                ,{" "}
                <code className="font-code-sm text-on-surface font-semibold bg-surface-container px-1 py-0.5 rounded">
                  currency=&quot;USD&quot;
                </code>
                ,{" "}
                <code className="font-code-sm text-on-surface font-semibold bg-surface-container px-1 py-0.5 rounded">
                  invoice=&quot;GL-204&quot;
                </code>
              </p>
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-[#107E3E] font-medium">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> 100% confidence score
              </span>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="relative group">
            <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs ring-4 ring-surface-container-lowest">
              <span className="material-symbols-outlined text-[14px]">shield</span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">
                  Stage 3: Deterministic Screening Rules Passed
                </h3>
                <span className="font-code-sm text-code-sm text-secondary bg-surface-container-low px-2 py-0.5 rounded">
                  14:31:46 UTC
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                Hard check rule-matrix executed. Zero delta detected against invoice payload. Status evaluated to{" "}
                <span className="text-[#107E3E] font-semibold">CLEAR</span>.
              </p>
            </div>
          </div>

          {/* Stage 4 */}
          <div className="relative group">
            <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs ring-4 ring-surface-container-lowest">
              <span className="material-symbols-outlined text-[14px]">record_voice_over</span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">
                  Stage 4: Voice Confirmation Recorded
                </h3>
                <span className="font-code-sm text-code-sm text-secondary bg-surface-container-low px-2 py-0.5 rounded">
                  14:32:01 UTC
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                User spoke verification token passkey:{" "}
                <span className="font-semibold text-on-surface">&quot;Confirm Pay&quot;</span>. Biometric voice envelope confirmed valid.
              </p>
            </div>
          </div>

          {/* Stage 5 */}
          <div className="relative group">
            <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs ring-4 ring-surface-container-lowest">
              <span className="material-symbols-outlined text-[14px]">payments</span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">
                  Stage 5: PayPal Sandbox Checkout Authorization &amp; Capture
                </h3>
                <span className="font-code-sm text-code-sm text-secondary bg-surface-container-low px-2 py-0.5 rounded">
                  14:32:08 UTC
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                Gateway captured order under reference{" "}
                <code className="font-code-sm text-code-sm bg-surface-container px-1 py-0.5 rounded text-on-surface font-semibold">
                  CAPTURE-DEMO-204
                </code>
                . HTTP 201 Created.
              </p>
            </div>
          </div>

          {/* Stage 6 */}
          <div className="relative group">
            <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-[#107E3E] text-on-primary flex items-center justify-center text-xs ring-4 ring-surface-container-lowest">
              <span className="material-symbols-outlined text-[14px]">receipt_long</span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">
                  Stage 6: Receipt &amp; Immutable Audit Log Entry Generated
                </h3>
                <span className="font-code-sm text-code-sm text-secondary bg-surface-container-low px-2 py-0.5 rounded">
                  14:32:09 UTC
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                Cryptographically hashed transaction snapshot appended to persistent ledger with identifier{" "}
                <code className="font-code-sm text-code-sm">txn_demo_204</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Read-Only Comparison Snapshot */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-outline-variant gap-2">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">compare_arrows</span>
              <span>Read-Only Comparison Snapshot</span>
            </h2>
            <p className="font-body-sm text-body-sm text-secondary">
              Deterministic parameter alignment between vocal intent and incoming invoice webhook.
            </p>
          </div>
          {/* Match Delta summary chip */}
          <div className="inline-flex items-center gap-1.5 bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] rounded-full px-3 py-1 font-label-md text-label-md font-semibold self-start sm:self-auto">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Match Delta: Exact Match ($0.00 difference)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Spoken Intent Column */}
          <div className="bg-surface-bright border border-outline-variant rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <span className="font-label-md text-label-md font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
                <span>Spoken Intent Extraction</span>
              </span>
              <span className="font-code-sm text-code-sm text-secondary">Audio Ingest</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm py-1 border-b border-surface-container">
                <span className="text-secondary font-label-sm text-label-sm">Merchant</span>
                <span className="font-body-md text-body-md font-semibold text-on-surface">
                  GreenLeaf Demo Store
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 border-b border-surface-container">
                <span className="text-secondary font-label-sm text-label-sm">Authorized Amount</span>
                <span className="font-code-md text-code-md font-bold text-on-surface">
                  USD 12.50
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-secondary font-label-sm text-label-sm">Invoice Ref</span>
                <span className="font-code-md text-code-md font-semibold text-on-surface">
                  GL-204
                </span>
              </div>
            </div>
          </div>

          {/* Merchant Invoice Webhook Payload Column */}
          <div className="bg-surface-bright border border-outline-variant rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <span className="font-label-md text-label-md font-bold text-secondary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">webhook</span>
                <span>Merchant Invoice Webhook Payload</span>
              </span>
              <span className="font-code-sm text-code-sm text-secondary">Payload JSON</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm py-1 border-b border-surface-container">
                <span className="text-secondary font-label-sm text-label-sm">Merchant</span>
                <span className="font-body-md text-body-md font-semibold text-on-surface">
                  GreenLeaf Demo Store
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 border-b border-surface-container">
                <span className="text-secondary font-label-sm text-label-sm">Requested Amount</span>
                <span className="font-code-md text-code-md font-bold text-on-surface">
                  USD 12.50
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-secondary font-label-sm text-label-sm">Invoice Ref</span>
                <span className="font-code-md text-code-md font-semibold text-on-surface">
                  GL-204
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Security, Spam, and Scam Screening Snapshot */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">security</span>
            <span>Security, Spam, and Scam Screening Snapshot</span>
          </h2>
          <span className="font-label-sm text-label-sm text-secondary">
            Engine: Strict Deterministic
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Check 1 */}
          <div className="flex items-center justify-between p-3.5 bg-surface-bright rounded-lg border border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EAF7F1] flex items-center justify-center text-[#107E3E]">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <div>
                <span className="font-label-md text-label-md font-medium text-on-surface block">
                  Recipient Sandbox Identity
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Verified merchant identity registry
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0]">
              PASS
            </span>
          </div>

          {/* Check 2 */}
          <div className="flex items-center justify-between p-3.5 bg-surface-bright rounded-lg border border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EAF7F1] flex items-center justify-center text-[#107E3E]">
                <span className="material-symbols-outlined text-[18px]">price_check</span>
              </div>
              <div>
                <span className="font-label-md text-label-md font-medium text-on-surface block">
                  Amount Authorized vs Requested
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Zero delta verification ($12.50 == $12.50)
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0]">
              PASS
            </span>
          </div>

          {/* Check 3 */}
          <div className="flex items-center justify-between p-3.5 bg-surface-bright rounded-lg border border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EAF7F1] flex items-center justify-center text-[#107E3E]">
                <span className="material-symbols-outlined text-[18px]">receipt</span>
              </div>
              <div>
                <span className="font-label-md text-label-md font-medium text-on-surface block">
                  Invoice Reference Validation
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Validated against mock ERP open ledger
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0]">
              PASS
            </span>
          </div>

          {/* Check 4 */}
          <div className="flex items-center justify-between p-3.5 bg-surface-bright rounded-lg border border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EAF7F1] flex items-center justify-center text-[#107E3E]">
                <span className="material-symbols-outlined text-[18px]">policy</span>
              </div>
              <div>
                <span className="font-label-md text-label-md font-medium text-on-surface block">
                  Sanctions &amp; Blocked List Check
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  OFAC/Mock Global Blocklist scan
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0]">
              PASS
            </span>
          </div>
        </div>
      </section>

      {/* 5. Safety Reasons & Policy Engine Decision */}
      <section className="bg-surface-container-low border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">
            verified_user
          </span>
          <div className="space-y-1.5 flex-1">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Safety Reasons &amp; Policy Engine Decision
            </h2>
            <p className="font-body-md text-body-md text-on-surface">
              Safe to proceed to PayPal Sandbox gateway. No amount delta, no recipient ambiguity, voice passkey matched intent.
            </p>
            <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[16px]">info</span>
              <span className="font-label-md text-label-md text-secondary">
                <span className="font-semibold text-on-surface">Policy Note:</span> CLEAR was deterministic; AI extraction only parsed parameters.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Immutable Audit Log Panel */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-outline-variant gap-2">
          <div className="space-y-0.5">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history_edu</span>
              <span>Immutable Audit Log Panel</span>
            </h2>
            <p className="font-body-sm text-body-sm text-secondary">
              Chronological, millisecond-precision server event log.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-secondary bg-surface-bright px-3 py-1 rounded-full border border-outline-variant">
            <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
            <span>Read-Only Cryptographic Log</span>
          </div>
        </div>

        {/* Notice Bar */}
        <div className="bg-surface-container-low border-l-4 border-primary p-3 rounded-r-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span className="font-body-sm text-body-sm text-on-surface font-medium">
              Authoritative server-persisted audit record. No buyer credentials or sensitive tokens recorded.
            </span>
          </div>
        </div>

        {/* Responsive Audit Log Table */}
        <div className="overflow-x-auto border border-outline-variant rounded-lg">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-label-sm text-label-sm text-secondary">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Event Name</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs font-body-sm text-body-sm">
              <tr className="hover:bg-surface-bright transition-colors">
                <td className="py-2.5 px-3 font-code-sm text-code-sm font-semibold text-primary">
                  evt_204_01
                </td>
                <td className="py-2.5 px-3 font-code-sm text-code-sm text-secondary">
                  14:31:42.108
                </td>
                <td className="py-2.5 px-3 font-semibold text-on-surface">
                  AUDIO_STREAM_INGESTED
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-medium">
                    User
                  </span>
                </td>
                <td className="py-2.5 px-3 text-secondary">
                  Spoken audio payload received (4.2s duration)
                </td>
              </tr>
              <tr className="hover:bg-surface-bright transition-colors">
                <td className="py-2.5 px-3 font-code-sm text-code-sm font-semibold text-primary">
                  evt_204_02
                </td>
                <td className="py-2.5 px-3 font-code-sm text-code-sm text-secondary">
                  14:31:45.312
                </td>
                <td className="py-2.5 px-3 font-semibold text-on-surface">
                  ENTITIES_EXTRACTED
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-medium">
                    System
                  </span>
                </td>
                <td className="py-2.5 px-3 text-secondary">
                  Parsed merchant, amount 12.50 USD, invoice GL-204
                </td>
              </tr>
              <tr className="hover:bg-surface-bright transition-colors">
                <td className="py-2.5 px-3 font-code-sm text-code-sm font-semibold text-primary">
                  evt_204_03
                </td>
                <td className="py-2.5 px-3 font-code-sm text-code-sm text-secondary">
                  14:31:46.044
                </td>
                <td className="py-2.5 px-3 font-semibold text-on-surface">
                  SCREENING_CLEAR
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-[#EAF7F1] text-[#107E3E] font-medium">
                    System
                  </span>
                </td>
                <td className="py-2.5 px-3 text-secondary">
                  Deterministic rule engine passed all 4 checks
                </td>
              </tr>
              <tr className="hover:bg-surface-bright transition-colors">
                <td className="py-2.5 px-3 font-code-sm text-code-sm font-semibold text-primary">
                  evt_204_04
                </td>
                <td className="py-2.5 px-3 font-code-sm text-code-sm text-secondary">
                  14:32:01.890
                </td>
                <td className="py-2.5 px-3 font-semibold text-on-surface">
                  VOICE_PASSKEY_CONFIRMED
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-medium">
                    User
                  </span>
                </td>
                <td className="py-2.5 px-3 text-secondary">
                  Spoken passphrase &quot;Confirm Pay&quot; verified
                </td>
              </tr>
              <tr className="hover:bg-surface-bright transition-colors">
                <td className="py-2.5 px-3 font-code-sm text-code-sm font-semibold text-primary">
                  evt_204_05
                </td>
                <td className="py-2.5 px-3 font-code-sm text-code-sm text-secondary">
                  14:32:08.411
                </td>
                <td className="py-2.5 px-3 font-semibold text-on-surface">
                  GATEWAY_PAYMENT_CAPTURED
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-medium">
                    Gateway
                  </span>
                </td>
                <td className="py-2.5 px-3 text-secondary">
                  PayPal Sandbox order CAPTURE-DEMO-204 executed
                </td>
              </tr>
              <tr className="hover:bg-surface-bright transition-colors">
                <td className="py-2.5 px-3 font-code-sm text-code-sm font-semibold text-primary">
                  evt_204_06
                </td>
                <td className="py-2.5 px-3 font-code-sm text-code-sm text-secondary">
                  14:32:09.115
                </td>
                <td className="py-2.5 px-3 font-semibold text-on-surface">
                  AUDIT_LOG_COMMITTED
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-medium">
                    System
                  </span>
                </td>
                <td className="py-2.5 px-3 text-secondary">
                  Immutable ledger finalized and transaction committed
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Collapsed Technical Details (Accordion / Collapsible Card) */}
      <details className="group bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm transition-all duration-200">
        <summary className="list-none flex items-center justify-between p-5 cursor-pointer hover:bg-surface-container-low transition-colors rounded-xl select-none">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary">code</span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Collapsed Technical Details
            </span>
            <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded ml-2">
              Developer Diagnostics
            </span>
          </div>
          <span className="material-symbols-outlined text-secondary group-open:rotate-180 transition-transform duration-200">
            expand_more
          </span>
        </summary>
        <div className="p-6 pt-0 border-t border-surface-container space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            <div className="p-3 bg-surface-bright rounded-lg border border-outline-variant">
              <span className="font-label-sm text-label-sm text-secondary block">Model Name</span>
              <span className="font-code-md text-code-md font-semibold text-on-surface mt-1 block">
                gemini-1.5-pro-screening-v2
              </span>
            </div>
            <div className="p-3 bg-surface-bright rounded-lg border border-outline-variant">
              <span className="font-label-sm text-label-sm text-secondary block">Prompt Version</span>
              <span className="font-code-md text-code-md font-semibold text-on-surface mt-1 block">
                v4.2.0-deterministic-guard
              </span>
            </div>
            <div className="p-3 bg-surface-bright rounded-lg border border-outline-variant">
              <span className="font-label-sm text-label-sm text-secondary block">
                Voice Audio Engine
              </span>
              <span className="font-code-md text-code-md font-semibold text-on-surface mt-1 block">
                whisper-sandbox-en-v3
              </span>
            </div>
            <div className="p-3 bg-surface-bright rounded-lg border border-outline-variant">
              <span className="font-label-sm text-label-sm text-secondary block">Request ID</span>
              <span className="font-code-md text-code-md font-semibold text-on-surface mt-1 block">
                req_8f902ba14ce
              </span>
            </div>
            <div className="p-3 bg-surface-bright rounded-lg border border-outline-variant">
              <span className="font-label-sm text-label-sm text-secondary block">Gateway Latency</span>
              <span className="font-code-md text-code-md font-semibold text-[#107E3E] mt-1 block">
                284ms
              </span>
            </div>
            <div className="p-3 bg-surface-bright rounded-lg border border-outline-variant">
              <span className="font-label-sm text-label-sm text-secondary block">
                Security Envelope Protocol
              </span>
              <span className="font-code-md text-code-md font-semibold text-on-surface mt-1 block">
                TLS 1.3 / HMAC-SHA256
              </span>
            </div>
          </div>
        </div>
      </details>

      {/* Bottom Footer Page Action Bar */}
      <section className="py-space-md border-t border-outline-variant flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/new-check"
          className="w-full sm:w-auto min-h-[44px] bg-primary-container text-on-primary hover:bg-[#066653] font-label-md text-label-md px-6 py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm font-semibold"
        >
          <span className="material-symbols-outlined text-[18px]">replay</span>
          <span>Run a similar check</span>
        </Link>
        <button
          className="w-full sm:w-auto min-h-[44px] bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low font-label-md text-label-md px-6 py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm font-medium"
          onClick={() => {
            if (typeof window !== "undefined") window.print();
          }}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          <span>Print / Export Receipt</span>
        </button>
      </section>
    </main>
  );
}

export default function CheckDetailPage({ params }) {
  return (
    <Suspense fallback={null}>
      <TransactionDetailContent params={params} />
    </Suspense>
  );
}
