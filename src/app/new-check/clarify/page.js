"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewPaymentCheckClarifyPage() {
  const router = useRouter();

  const [statement, setStatement] = useState(
    "I intend to pay GreenLeaf Demo Store for invoice GL-204."
  );
  const [missingAmountResolved, setMissingAmountResolved] = useState(false);

  const handleAppendAmount = () => {
    setStatement(
      "I intend to pay USD 12.50 to GreenLeaf Demo Store for invoice GL-204."
    );
    setMissingAmountResolved(true);
  };

  const handleResolveClarification = () => {
    router.push("/checks/chk_demo_204");
  };

  return (
    <div className="w-full flex-1 flex flex-col font-body-md text-on-surface antialiased bg-surface">
      {/* Main Canvas */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-6 sm:py-8 flex flex-col gap-6 pb-32">
        {/* Title & Flow Stepper Cluster */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DFE5E8]/60 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                  Verification Pipeline
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#B45309] border border-amber-300 font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">priority_high</span>{" "}
                  Clarification Required
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                New Payment Check
              </h1>
              <p className="font-body-md text-body-md text-secondary mt-1 max-w-2xl">
                Tell us what you intend to pay, then paste the request you received.
              </p>
            </div>

            {/* AuditTrailRail Notice */}
            <div className="flex items-center gap-2 text-secondary bg-surface-container-lowest border border-[#DFE5E8] px-3.5 py-2.5 rounded-xl shadow-sm self-start md:self-auto">
              <span className="material-symbols-outlined text-[18px] text-outline">
                history_edu
              </span>
              <span className="font-label-sm text-label-sm">
                Audit log starts when you submit ·{" "}
                <span className="text-secondary/70">Untouched draft not recorded</span>
              </span>
            </div>
          </div>

          {/* Flow Stepper */}
          <nav aria-label="Progress Stepper" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Step 1: Active with Amber Alert */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                missingAmountResolved
                  ? "bg-[#EAF7F1] border-primary-container"
                  : "bg-amber-50/70 border-amber-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md font-bold shadow-sm ${
                  missingAmountResolved
                    ? "bg-primary-container text-white"
                    : "bg-[#B45309] text-white"
                }`}
              >
                {missingAmountResolved ? "✓" : "!"}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-label-md text-label-md font-bold ${
                      missingAmountResolved ? "text-primary" : "text-[#B45309]"
                    }`}
                  >
                    1. Your Intent
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      missingAmountResolved
                        ? "bg-primary-container"
                        : "bg-[#B45309] animate-pulse"
                    }`}
                  ></span>
                </div>
                <span
                  className={`font-body-sm text-body-sm font-medium ${
                    missingAmountResolved ? "text-primary" : "text-[#B45309]/90"
                  }`}
                >
                  {missingAmountResolved
                    ? "Amount confirmed ($12.50 USD)"
                    : "Missing payment amount"}
                </span>
              </div>
            </div>

            {/* Step 2: Request Matched */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-[#DFE5E8] opacity-85">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-label-md text-label-md font-bold">
                2
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-secondary">
                  2. Payment Request
                </span>
                <span className="font-body-sm text-body-sm text-secondary/80">
                  Payload parsed ($12.50 USD)
                </span>
              </div>
            </div>

            {/* Step 3: Verification Analysis */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-[#DFE5E8] opacity-60">
              <div className="w-8 h-8 rounded-full bg-surface-container-high text-secondary flex items-center justify-center font-label-md text-label-md font-bold">
                3
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-medium text-secondary">
                  3. Safety Check &amp; Match
                </span>
                <span className="font-body-sm text-body-sm text-secondary/60">
                  {missingAmountResolved ? "Ready to verify" : "Awaiting user clarification"}
                </span>
              </div>
            </div>
          </nav>
        </section>

        {/* N2 Persistent Clarification Alert Banner */}
        <section className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 text-[#B45309] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">help_center</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-[#B45309] tracking-wider">
                    Missing Required Intent Data
                  </span>
                  <span className="font-code-sm text-code-sm bg-amber-200/70 text-[#B45309] px-2 py-0.5 rounded font-medium">
                    State: {missingAmountResolved ? "RESOLVED" : "INCOMPLETE_INTENT"}
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">
                  {missingAmountResolved
                    ? "Details verified! Ready to check payment."
                    : "We need one more detail to proceed safely"}
                </h2>
                <p className="font-body-md text-body-md text-secondary mt-1.5 max-w-3xl leading-relaxed">
                  SayPay extracted the merchant (
                  <strong className="text-on-surface">“GreenLeaf Demo Store”</strong>) and reference (
                  <strong className="text-on-surface">“GL-204”</strong>
                  ), but the amount was missing or ambiguous from your spoken statement.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100/90 border border-amber-300">
                  <span className="material-symbols-outlined text-[#B45309] text-[18px]">
                    record_voice_over
                  </span>
                  <span className="font-label-md text-label-md font-bold text-[#B45309]">
                    Highlighted Question: “What amount do you intend to pay?”
                  </span>
                </div>
              </div>
            </div>

            {/* Clarification Actions Group */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 shrink-0 self-end lg:self-center">
              <button
                onClick={handleAppendAmount}
                className="h-11 px-4 rounded-[10px] bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
                <span>Answer by voice</span>
              </button>
              <button
                onClick={handleAppendAmount}
                className="h-11 px-3.5 rounded-[10px] bg-white border border-[#DFE5E8] hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-medium flex items-center gap-1.5 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  keyboard
                </span>
                <span>Type your answer</span>
              </button>
              <button
                className="h-11 px-3 rounded-[10px] bg-white border border-[#DFE5E8] hover:bg-surface-container-low text-secondary hover:text-on-surface font-label-md text-label-md font-medium flex items-center gap-1 transition-colors"
                title="Read Clarification Prompt Aloud"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">volume_up</span>
                <span className="hidden sm:inline">Read aloud</span>
              </button>
              <button
                onClick={() => {
                  setStatement("I intend to pay GreenLeaf Demo Store for invoice GL-204.");
                  setMissingAmountResolved(false);
                }}
                className="h-11 px-3 rounded-[10px] hover:bg-amber-100/80 text-[#B45309] font-label-md text-label-md font-semibold flex items-center gap-1 transition-colors"
                title="Re-check parsed fields"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">sync</span>
                <span>Re-check details</span>
              </button>
            </div>
          </div>
        </section>

        {/* Two-Column Asymmetric Canvas (Card A & Card B) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          {/* Card A: YOUR INTENT (Highlighted Missing Field) */}
          <section
            className={`lg:col-span-6 bg-surface-container-lowest border-2 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all ${
              missingAmountResolved ? "border-[#A7F3D0]" : "border-amber-400"
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/40 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <span className="font-label-sm text-label-sm uppercase font-bold text-[#914000] tracking-wider">
                  Step 1 · User Verification Base
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
                  What do you want to pay?
                </h3>
              </div>
              {/* Missing Indicator Pill */}
              <span
                className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1 shrink-0 ${
                  missingAmountResolved
                    ? "bg-[#EAF7F1] border border-[#A7F3D0] text-[#107E3E]"
                    : "bg-amber-100 border border-amber-300 text-[#B45309]"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {missingAmountResolved ? "check_circle" : "error"}
                </span>
                {missingAmountResolved ? "Amount: USD 12.50" : "Missing: Payment Amount"}
              </span>
            </div>

            {/* Editable Intent Box with Warning Highlight */}
            <div
              className={`relative rounded-xl border-2 p-4 transition-all focus-within:ring-2 focus-within:bg-white ${
                missingAmountResolved
                  ? "border-[#A7F3D0] bg-[#EAF7F1]/20 focus-within:ring-primary"
                  : "border-amber-400 bg-amber-50/30 focus-within:ring-amber-400"
              }`}
            >
              <label
                className="block font-label-sm text-label-sm font-medium text-[#B45309] mb-2 flex items-center justify-between"
                htmlFor="intent-statement"
              >
                <span>Spoken User Statement:</span>
                <span className="font-code-sm text-code-sm text-secondary">
                  Audio Conf: 98.4%
                </span>
              </label>
              <textarea
                className="w-full bg-transparent border-0 p-0 text-on-surface font-body-lg text-body-lg focus:ring-0 resize-none font-medium leading-relaxed"
                id="intent-statement"
                rows={4}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
              />

              {/* Inline Extracted Entities Bar */}
              <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">store</span>
                  Merchant: GreenLeaf Demo Store
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">tag</span>
                  Invoice: GL-204
                </span>
                {missingAmountResolved ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-label-sm text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    Amount: USD 12.50
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-[#B45309] border border-amber-300 font-label-sm text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[14px]">search_off</span>
                    Amount: [Unspecified]
                  </span>
                )}
              </div>
            </div>

            {/* Smart Suggestion & Append Note */}
            <div className="mt-4 p-3.5 rounded-xl bg-surface border border-[#DFE5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm text-secondary font-semibold">
                  Suggested response:
                </span>
                <button
                  onClick={handleAppendAmount}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200/80 text-[#B45309] border border-amber-300 font-label-sm text-label-sm font-bold transition-all active:scale-[0.98]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">add_circle</span>
                  Say: “USD 12.50”
                </button>
              </div>
              <span className="font-body-sm text-body-sm text-secondary/80 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Appends &amp; re-parses auto
              </span>
            </div>

            {/* Intent Card Controls */}
            <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#DFE5E8]">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAppendAmount}
                  className="w-10 h-10 rounded-full bg-emerald-50 hover:bg-emerald-100 text-primary-container border border-emerald-200 flex items-center justify-center transition-colors"
                  title="Record Voice"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary flex items-center justify-center transition-colors"
                  title="Keyboard Text Edit"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <span className="font-label-sm text-label-sm text-secondary hidden sm:inline ml-1">
                  Spoken channel active
                </span>
              </div>
              <button
                onClick={() => {
                  setStatement("I intend to pay GreenLeaf Demo Store for invoice GL-204.");
                  setMissingAmountResolved(false);
                }}
                className="font-label-md text-label-md font-semibold text-primary hover:text-primary-container hover:underline flex items-center gap-1"
                type="button"
              >
                Reset Voice Buffer
              </button>
            </div>
          </section>

          {/* Card B: PAYMENT REQUEST (Pasted Source Data) */}
          <section className="lg:col-span-6 bg-surface-container-lowest border border-[#DFE5E8] rounded-2xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <span className="font-label-sm text-label-sm uppercase font-bold text-secondary tracking-wider">
                  Step 2 · Counterpart Verification Source
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
                  Payment Request
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-label-sm text-label-sm font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Source Pasted
              </span>
            </div>

            {/* Raw Paste Container with Syntactical Inspection */}
            <div className="rounded-xl border border-[#DFE5E8] bg-surface p-4">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#DFE5E8]/40">
                <div className="flex items-center gap-1.5 font-code-sm text-code-sm text-secondary">
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  <span>PAYPAL_MERCHANT_WEBHOOK_PAYLOAD</span>
                </div>
                <span className="font-code-sm text-code-sm text-primary font-bold">
                  MATCHED: USD 12.50
                </span>
              </div>
              {/* Code View Area */}
              <pre className="font-code-sm text-code-sm text-on-surface leading-relaxed overflow-x-auto whitespace-pre p-2 bg-surface-container-lowest rounded-lg border border-[#DFE5E8]/60">
{`{
  "event_type": "PAYMENT.INVOICE.ISSUED",
  "resource": {
    "merchant_info": {
      "business_name": "GreenLeaf Demo Store",
      "account_id": "MOCK-GL-9921-US"
    },
    "invoice": {
      "reference_id": "GL-204",
      "currency_code": "USD",
      "total_amount": "12.50",
      "tax_included": true
    },
    "payment_gateway": "PayPal Sandbox (REST v2)"
  }
}`}
              </pre>
            </div>

            {/* Payee Card Micro-Surface */}
            <div className="mt-4 p-3.5 rounded-xl bg-surface-container-low/70 border border-[#DFE5E8] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-[#DFE5E8] flex items-center justify-center font-bold text-secondary font-code-md">
                  GL
                </div>
                <div>
                  <div className="font-label-md text-label-md font-bold text-on-surface">
                    GreenLeaf Demo Store
                  </div>
                  <div className="font-body-sm text-body-sm text-secondary">
                    Verified Mock Merchant · Standard Check
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-headline-sm text-headline-sm font-bold text-primary">
                  $12.50 <span className="font-label-sm text-label-sm font-normal text-secondary">USD</span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary">
                  {missingAmountResolved ? "Matched" : "Awaiting Intent Match"}
                </span>
              </div>
            </div>

            {/* Request Card Footer Controls */}
            <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#DFE5E8]">
              <div className="flex items-center gap-2">
                <button
                  className="font-label-sm text-label-sm font-semibold text-secondary hover:text-on-surface px-3 py-1.5 rounded-lg border border-[#DFE5E8] bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
                  type="button"
                >
                  Re-paste JSON
                </button>
                <button
                  className="font-label-sm text-label-sm font-semibold text-secondary hover:text-on-surface px-3 py-1.5 rounded-lg border border-[#DFE5E8] bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
                  type="button"
                >
                  Load Demo Fixture
                </button>
              </div>
              <span className="font-code-sm text-code-sm text-outline">SHA256: 8f2c..11b9</span>
            </div>
          </section>
        </div>

        {/* Pre-Flight Safety Check Status */}
        <section className="bg-surface-container-lowest border border-[#DFE5E8] rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <span className="material-symbols-outlined text-outline text-[22px]">policy</span>
              <div>
                <h4 className="font-label-md text-label-md font-bold text-on-surface">
                  Pre-Flight Safety Check Status
                </h4>
                <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                  To prevent accidental or spoofed payouts, SayPay verifies that the intentional amount spoken by the user matches the request payload before issuing the sandbox transaction token.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <span className="font-code-sm text-code-sm text-secondary">
                Gate: {missingAmountResolved ? "3/3 Entities Confirmed" : "2/3 Entities Confirmed"}
              </span>
              <div className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    missingAmountResolved
                      ? "bg-primary-container w-full"
                      : "bg-[#B45309] w-2/3"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Action Bar */}
      <aside className="sticky bottom-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-t border-[#DFE5E8] shadow-lg py-3.5 px-4 md:px-margin-desktop">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Summary Status Badges */}
          <div className="flex items-center flex-wrap gap-3">
            {missingAmountResolved ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span className="font-label-sm text-label-sm font-semibold">
                  Clarification resolved ($12.50)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-[#B45309]">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span className="font-label-sm text-label-sm font-bold">
                  Clarification required
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span className="font-label-sm text-label-sm font-semibold">
                Request pasted (GL-204)
              </span>
            </div>
            <span className="hidden md:inline font-body-sm text-body-sm text-secondary">
              {missingAmountResolved
                ? "All entities confirmed. Ready to run checks."
                : "Confirm amount to unlock checkout analysis"}
            </span>
          </div>

          {/* Action Buttons Cluster */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setStatement("I intend to pay GreenLeaf Demo Store for invoice GL-204.");
                setMissingAmountResolved(false);
              }}
              className="h-11 px-4 rounded-[10px] bg-white border border-[#DFE5E8] hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold transition-colors active:scale-[0.98]"
              type="button"
            >
              Clear all
            </button>
            {missingAmountResolved ? (
              <button
                onClick={handleResolveClarification}
                className="h-11 px-6 rounded-[10px] bg-primary-container hover:bg-primary text-white font-label-md text-label-md font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Proceed to safety check</span>
              </button>
            ) : (
              <button
                className="h-11 px-6 rounded-[10px] bg-surface-container-high text-secondary border border-[#DFE5E8] font-label-md text-label-md font-semibold flex items-center gap-2 cursor-not-allowed opacity-80 shadow-none"
                disabled
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>Resolve clarification to check</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
