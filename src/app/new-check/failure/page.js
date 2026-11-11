"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewPaymentCheckAiFailurePage() {
  const router = useRouter();

  const [intentText, setIntentText] = useState(
    "I intend to pay USD 12.50 to GreenLeaf Demo Store for invoice GL-204."
  );

  const [payloadText, setPayloadText] = useState(
`{
  "event_type": "INVOICING.INVOICE.CREATED",
  "resource": {
    "id": "INV2-DEMO-GL204",
    "status": "SENT",
    "primary_recipient": {
      "merchant_id": "MERC-GL-98214-TEST",
      "business_name": "GreenLeaf Demo Store"
    },
    "amount": {
      "currency_code": "USD",
      "value": "12.50"
    },
    "metadata": {
      "sandbox_hash": "e98a0f021cfb776",
      "audit_signature_version": "v1.4-beta"
    }
  }
}`
  );

  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      // Navigate to success/normal check flow
      router.push("/checks/chk_demo_204");
    }, 900);
  };

  const handleCopyJson = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(payloadText);
      }
    } catch {}
  };

  return (
    <div className="w-full flex-1 flex flex-col font-body-md text-on-surface antialiased bg-[#F7F8FA] selection:bg-primary selection:text-white">
      {/* Main Canvas Content */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-6 flex flex-col gap-6 pb-32">
        {/* Header Title & Subtitle + FlowStepper & AuditTrail Rail */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#DFE5E8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container border border-[#DFE5E8] text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                Screening Session #CHK-9402
              </span>
              <span className="text-secondary font-body-sm text-body-sm">•</span>
              <span className="text-secondary font-body-sm text-body-sm">Created 2m ago</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              New Payment Check
            </h1>
            <p className="font-body-lg text-body-lg text-secondary mt-1">
              Tell us what you intend to pay, then paste the request you received.
            </p>
          </div>

          {/* Stepper and Audit Trail Rail */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-surface-container-lowest p-3 rounded-xl border border-[#DFE5E8] shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FEE2E2] text-[#BA1A1A] font-label-sm text-label-sm border border-[#FECACA] font-bold">
                1
              </span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                1. Your intent
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] font-label-sm text-label-sm border border-[#E5E7EB]">
                Review needed
              </span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-[#DFE5E8]"></div>
            <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-[#BA1A1A]">flag</span>
              <span className="font-body-sm text-body-sm">
                Audit log starts when you submit ·{" "}
                <strong className="text-[#BA1A1A] font-semibold">Attempt flagged locally</strong>
              </span>
            </div>
          </div>
        </div>

        {/* PROMINENT N3 PERSISTENT AI FAILURE ALERT BANNER */}
        <section
          aria-live="assertive"
          className="w-full bg-[#FDE8E8] border border-red-300 rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden"
          role="alert"
        >
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-red-100 rounded-full blur-2xl pointer-events-none opacity-60"></div>
          <div className="flex flex-col md:flex-row items-start gap-4 relative z-10">
            {/* Error Pill / Icon Badge */}
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#BA1A1A] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">error_outline</span>
            </div>
            <div className="flex-grow space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-headline-sm text-headline-sm text-[#BA1A1A] font-bold tracking-tight">
                  We couldn’t read the payment details right now.
                </h2>
                <div className="flex items-center gap-1.5 bg-[#FEE2E2] border border-[#FECACA] px-2.5 py-0.5 rounded-full text-[#BA1A1A] font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span>PARSER_FAILURE_SCHEMA_MISMATCH</span>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface font-medium">
                Your text has been kept intact. Nothing was paid, and no PayPal transaction was initiated.
              </p>
              <p className="font-body-sm text-body-sm text-secondary">
                The AI parser was unable to extract structured entities from the input. You can edit the text manually or retry parsing.
              </p>

              {/* Explicit Rule Note */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-red-200 text-[#93000A] font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-[#BA1A1A]">lock</span>
                  <span className="font-semibold">Security Gate:</span>
                  <span>No checkout access is permitted until screening passes.</span>
                </div>
              </div>

              {/* Actions Group inside Banner */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="min-h-[44px] px-5 rounded-[10px] bg-primary-container text-white font-label-lg text-label-lg hover:bg-primary transition-colors flex items-center gap-2 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#EAF7F1] active:scale-[0.98] font-semibold"
                  type="button"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isRetrying ? "animate-spin" : ""
                    }`}
                  >
                    refresh
                  </span>
                  <span>{isRetrying ? "Retrying check..." : "Retry payment check"}</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("intent-input");
                    if (el) el.focus();
                  }}
                  className="min-h-[44px] px-5 rounded-[10px] bg-white border border-[#DFE5E8] text-on-surface font-label-lg text-label-lg hover:bg-[#F7F8FA] transition-colors flex items-center gap-2 font-medium"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  <span>Edit text manually</span>
                </button>
                <span className="text-secondary font-code-sm text-code-sm px-2">
                  HTTP 422: Unprocessable Entity
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Section: Card A, Card B & Telemetry Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          {/* Input Verification Section (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* CARD A: User Intent Input */}
            <article className="bg-surface-container-lowest border border-[#DFE5E8] rounded-2xl p-6 shadow-sm relative group focus-within:border-primary-container transition-colors">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F7F8FA]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Card A: Your Intent Declaration
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Spoken instruction or typed objective
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-label-sm text-label-sm font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">flag</span>
                    Unparsed
                  </span>
                </div>
              </div>

              {/* Input Textarea */}
              <div className="flex flex-col gap-2">
                <label
                  className="font-label-md text-label-md text-secondary flex justify-between"
                  htmlFor="intent-input"
                >
                  <span>Natural language payment statement</span>
                  <span className="font-code-sm text-code-sm text-secondary">
                    {intentText.length} characters retained
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    className="w-full rounded-[10px] border border-[#DFE5E8] bg-[#FFFFFF] p-3.5 font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-4 focus:ring-[#EAF7F1] outline-none transition-all resize-y"
                    id="intent-input"
                    rows={3}
                    value={intentText}
                    onChange={(e) => setIntentText(e.target.value)}
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-secondary">
                    <button
                      onClick={() => router.push("/new-check/listening")}
                      className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface"
                      title="Record Voice"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">mic</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-secondary font-body-sm text-body-sm mt-1">
                  <span className="flex items-center gap-1 text-[#DC2626]">
                    <span className="material-symbols-outlined text-[15px]">info</span>
                    Entity extractor could not correlate currency token with merchant account.
                  </span>
                  <span className="text-secondary">Editable</span>
                </div>
              </div>
            </article>

            {/* CARD B: Invoice Webhook Payload / Raw Request */}
            <article className="bg-surface-container-lowest border border-[#DFE5E8] rounded-2xl p-6 shadow-sm relative group focus-within:border-primary-container transition-colors">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F7F8FA]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">code</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Card B: Received Payment Request
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Raw webhook, payment link metadata, or API request invoice
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] font-label-sm text-label-sm font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                    Payload Unmatched
                  </span>
                </div>
              </div>

              {/* Payload Textarea */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label
                    className="font-label-md text-label-md text-secondary"
                    htmlFor="payload-input"
                  >
                    Raw invoice webhook payload (Retained in full)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyJson}
                      className="text-primary hover:underline font-label-sm text-label-sm flex items-center gap-1"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Copy JSON
                    </button>
                    <span className="text-[#DFE5E8]">•</span>
                    <button
                      onClick={() => {}}
                      className="text-secondary hover:underline font-label-sm text-label-sm"
                      type="button"
                    >
                      Format
                    </button>
                  </div>
                </div>
                <textarea
                  className="w-full font-code-md text-code-md text-[#15232D] rounded-[10px] border border-[#DFE5E8] bg-[#F7F8FA] p-3.5 focus:border-primary-container focus:ring-4 focus:ring-[#EAF7F1] outline-none transition-all leading-relaxed"
                  id="payload-input"
                  rows={8}
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                />
                <div className="flex items-center justify-between text-secondary font-body-sm text-body-sm mt-1">
                  <span className="flex items-center gap-1 text-secondary">
                    <span className="material-symbols-outlined text-[15px]">data_object</span>
                    Valid JSON syntax detected, but intent verification pipeline failed during NLP entity reconciliation.
                  </span>
                  <span className="font-code-sm text-code-sm">{payloadText.length} bytes</span>
                </div>
              </div>
            </article>
          </div>

          {/* Telemetry & Diagnostic Sidebar (4 Columns) */}
          <aside className="lg:col-span-4 flex flex-col gap-4">
            {/* Parser Diagnostics Card */}
            <div className="bg-surface-container-lowest border border-[#DFE5E8] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DFE5E8]">
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#BA1A1A]">
                    analytics
                  </span>
                  Audit Telemetry
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#BA1A1A] font-label-sm text-label-sm font-semibold">
                  Parser: Failed
                </span>
              </div>
              <div className="space-y-3 font-body-sm text-body-sm">
                <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#DFE5E8] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary font-label-sm text-label-sm">
                      Natural Language Confidence
                    </span>
                    <span className="text-[#BA1A1A] font-code-sm text-code-sm font-semibold">
                      0.24 (Sub-threshold)
                    </span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#BA1A1A] h-full rounded-full w-[24%]"></div>
                  </div>
                </div>

                <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#DFE5E8] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary font-label-sm text-label-sm">
                      Payload Schema Validation
                    </span>
                    <span className="text-[#107E3E] font-code-sm text-code-sm font-semibold">
                      PASS (1.00)
                    </span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#107E3E] h-full rounded-full w-full"></div>
                  </div>
                </div>

                <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#DFE5E8] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary font-label-sm text-label-sm">
                      Semantic Entity Reconciliation
                    </span>
                    <span className="text-[#BA1A1A] font-code-sm text-code-sm font-semibold">
                      FAILED (TIMEOUT)
                    </span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#BA1A1A] h-full rounded-full w-[12%]"></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DFE5E8]">
                <p className="font-body-sm text-body-sm text-secondary">
                  The AI model timed out after 3,000ms trying to match the semantic invoice ID{" "}
                  <code className="font-code-sm bg-surface-container px-1 py-0.5 rounded text-on-surface font-semibold">
                    GL-204
                  </code>{" "}
                  against payload resource ID{" "}
                  <code className="font-code-sm bg-surface-container px-1 py-0.5 rounded text-on-surface font-semibold">
                    INV2-DEMO-GL204
                  </code>
                  .
                </p>
              </div>
            </div>

            {/* Safety Protocols Card */}
            <div className="bg-surface-container-lowest border border-[#DFE5E8] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-primary font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span>SayPay Guarantee Protocol</span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                Transactions are mathematically barred from dispatching PayPal sandbox tokens unless Card A and Card B produce a mutually verified cryptographic agreement hash.
              </p>
              <div className="p-2.5 rounded-lg bg-surface-container border border-secondary-fixed text-on-secondary-container font-code-sm text-code-sm flex items-center justify-between">
                <span>STATE: SCREENING_HALTED</span>
                <span className="text-[#BA1A1A] font-semibold">BLOCKED</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <aside className="sticky bottom-0 z-40 bg-surface-container-lowest border-t border-[#DFE5E8] shadow-lg py-3 px-4 md:px-margin-desktop">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Readiness Summary Status */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-[#BA1A1A] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">error</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-lg text-label-lg text-on-surface font-bold">
                  Parsing failed — review required
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#BA1A1A] font-label-sm text-label-sm font-semibold">
                  Action needed
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                Check inputs above and click retry to attempt reconciliation again.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            {/* Secondary Action: Clear all */}
            <button
              onClick={() => {
                setIntentText("");
                setPayloadText("");
              }}
              className="min-h-[44px] px-4 rounded-[10px] bg-surface-container-lowest border border-[#DFE5E8] text-secondary font-label-lg text-label-lg hover:text-[#BA1A1A] hover:border-red-300 hover:bg-[#FEE2E2]/20 transition-all flex items-center gap-1.5 active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span>Clear all</span>
            </button>
            {/* Primary Action: Retry check */}
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="min-h-[44px] px-6 rounded-[10px] bg-primary-container hover:bg-primary text-white font-label-lg text-label-lg transition-all flex items-center gap-2 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#EAF7F1] active:scale-[0.98] font-semibold"
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isRetrying ? "animate-spin" : ""
                }`}
              >
                refresh
              </span>
              <span>{isRetrying ? "Retrying..." : "Retry check"}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
