"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * AI Match & Safety Check — Review Required State
 * Route: /new-check/review
 * Based on the reference mockup for chk_demo_205 (Aura Cloud Hosting)
 */
export default function AiMatchSafetyCheckReviewPage() {
  const router = useRouter();

  return (
    <div className="w-full flex-1 flex flex-col font-body-md text-on-surface antialiased bg-surface">
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-6 space-y-6 pb-32">
        {/* PAGE HEADER */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DFE5E8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-code-sm text-code-sm text-secondary bg-surface-container-high px-2 py-0.5 rounded">
                chk_demo_205
              </span>
              <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-label-sm font-label-sm px-2.5 py-0.5 rounded-full font-bold">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                REVIEW REQUIRED
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              AI Match &amp; Safety Check
            </h1>
            <p className="font-body-md text-body-md text-secondary mt-0.5">
              Compare your intent with the request and inspect the safety checks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 bg-surface-container-lowest border border-[#DFE5E8] text-on-surface hover:bg-surface-container-low px-3.5 py-2 rounded-lg text-label-md font-label-md transition-colors active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span>Re-run checks</span>
            </button>
            <button
              className="inline-flex items-center gap-2 bg-surface-container-lowest border border-[#DFE5E8] text-on-surface hover:bg-surface-container-low px-3.5 py-2 rounded-lg text-label-md font-label-md transition-colors active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>Share report</span>
            </button>
          </div>
        </section>

        {/* FLOW STEPPER (Step 2 Stop State for Review) */}
        <section className="bg-surface-container-lowest rounded-xl border border-[#DFE5E8] p-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {/* Step 1: Completed */}
            <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-surface-container-low/50">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-primary font-bold">01 INTENT</span>
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">Your intent</span>
              <span className="font-code-sm text-code-sm text-secondary">Verified voice prompt</span>
            </div>
            {/* Step 2: STOP STATE (Active Review Required) */}
            <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-[#FEF3C7] border-2 border-[#F59E0B]">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-[#B45309] font-bold">02 EVALUATION</span>
                <span className="material-symbols-outlined text-[#B45309] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  warning
                </span>
              </div>
              <span className="font-label-md text-label-md text-[#B45309] font-bold">AI match &amp; safety check</span>
              <span className="font-label-sm text-label-sm text-[#B45309] font-semibold">Review required</span>
            </div>
            {/* Steps 3-6: Locked */}
            {[
              { num: "03", label: "CONFIRM", sub: "Pre-approval" },
              { num: "04", label: "GATEWAY", sub: "PayPal Sandbox" },
              { num: "05", label: "SETTLE", sub: "Capture fund" },
              { num: "06", label: "RECEIPT", sub: "Audit proof" },
            ].map((step) => (
              <div key={step.num} className="flex flex-col gap-1.5 p-2 rounded-lg bg-surface-container-lowest opacity-40 select-none cursor-not-allowed">
                <div className="flex items-center justify-between text-secondary">
                  <span className="font-label-sm text-label-sm">{step.num} {step.label}</span>
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                </div>
                <span className="font-label-md text-label-md text-secondary">{step.sub}</span>
                <span className="font-code-sm text-code-sm text-secondary">Locked</span>
              </div>
            ))}
          </div>
          {/* Stepper Stop Caption */}
          <div className="mt-3 pt-3 border-t border-[#DFE5E8]/40 flex items-center justify-between text-[#B45309] font-label-md text-label-md">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">pan_tool</span>
              <span>Stopped — this attempt was logged · Review required before checkout</span>
            </div>
            <span className="font-code-sm text-code-sm text-secondary">Deterministic Rule #419-B</span>
          </div>
        </section>

        {/* AUDIT TRAIL MINI-RAIL */}
        <div className="bg-surface-container-low/70 border border-[#DFE5E8] rounded-lg px-4 py-2 flex items-center justify-between text-secondary font-body-sm text-body-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary">fingerprint</span>
            <span className="text-on-surface font-semibold">Audit log</span>
            <span>·</span>
            <span>5 events recorded</span>
            <span>·</span>
            <span className="font-code-sm text-code-sm">Trace ID: 7f8a3d-chk_demo_205</span>
          </div>
          <Link className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1" href="/checks/chk_demo_205">
            <span>View telemetry</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* STATUS HERO (REVIEW STATE) */}
        <section className="bg-[#FFFBEB] border-2 border-[#FDE68A] rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] border border-[#FCD34D] flex items-center justify-center text-[#B45309] shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  warning
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-label-sm text-label-sm font-bold tracking-wider">
                    REVIEW
                  </span>
                  <span className="text-secondary font-body-sm text-body-sm">Halt Triggered</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-[#92400E]">
                  Some details need your attention before you can pay.
                </h2>
                <p className="font-body-md text-body-md text-[#78350F] mt-1">
                  No PayPal order has been created. Payment is halted until resolved.
                </p>
              </div>
            </div>
            <button
              className="inline-flex items-center gap-2 bg-surface-container-lowest hover:bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] px-4 py-2.5 rounded-xl font-label-md text-label-md transition-all shrink-0 active:scale-[0.98] shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
              <span>Read aloud</span>
            </button>
          </div>
        </section>

        {/* FOUR SCREENING GROUPS & MAIN AUDIT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 8-COLUMN AREA */}
          <div className="lg:col-span-8 space-y-6">
            {/* SCREENING GROUP 1: AI Match Comparison Table */}
            <section className="bg-surface-container-lowest rounded-2xl border border-[#DFE5E8] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">compare_arrows</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">1. AI Match Comparison</h3>
                </div>
                <span className="font-label-sm text-label-sm text-[#B45309] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                  2 Discrepancies Flagged
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#DFE5E8] text-secondary font-label-sm text-label-sm">
                      <th className="py-2.5 px-3">Field</th>
                      <th className="py-2.5 px-3">Spoken Intent (Voice Input)</th>
                      <th className="py-2.5 px-3">Invoice / Gateway Request</th>
                      <th className="py-2.5 px-3 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE5E8]/40 font-body-md text-body-md">
                    {/* Row 1: Recipient (Mismatch) */}
                    <tr className="bg-[#FFFBEB]/60 hover:bg-[#FFFBEB] transition-colors">
                      <td className="py-3 px-3 font-semibold text-on-surface">Recipient</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-medium text-on-surface">
                          <span className="material-symbols-outlined text-[16px] text-secondary">record_voice_over</span>
                          &quot;Aura Cloud Services&quot;
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-code-md text-code-md text-on-surface">Aura Cloud Hosting LLC</span>
                        <span className="text-secondary font-code-sm text-code-sm block">(mer_182903)</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-label-sm font-label-sm px-2.5 py-0.5 rounded-full font-bold">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                          REVIEW: Alias mismatch
                        </span>
                      </td>
                    </tr>
                    {/* Row 2: Amount (Match) */}
                    <tr className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-on-surface">Amount</td>
                      <td className="py-3 px-3 text-on-surface">USD 125.00</td>
                      <td className="py-3 px-3 font-code-md text-code-md text-on-surface">USD 125.00</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] text-label-sm font-label-sm px-2.5 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">check</span>
                          Match ✓
                        </span>
                      </td>
                    </tr>
                    {/* Row 3: Currency (Match) */}
                    <tr className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-on-surface">Currency</td>
                      <td className="py-3 px-3 text-on-surface">USD</td>
                      <td className="py-3 px-3 font-code-md text-code-md text-on-surface">USD</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] text-label-sm font-label-sm px-2.5 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[12px]">check</span>
                          Match ✓
                        </span>
                      </td>
                    </tr>
                    {/* Row 4: Reference (Missing in intent) */}
                    <tr className="bg-[#FFFBEB]/60 hover:bg-[#FFFBEB] transition-colors">
                      <td className="py-3 px-3 font-semibold text-on-surface">Reference</td>
                      <td className="py-3 px-3">
                        <span className="text-secondary italic bg-surface-container-high/60 px-2 py-0.5 rounded text-body-sm font-body-sm">
                          Not provided (omitted in voice)
                        </span>
                      </td>
                      <td className="py-3 px-3 font-code-md text-code-md text-on-surface">AC-901</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-label-sm font-label-sm px-2.5 py-0.5 rounded-full font-bold">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>help_center</span>
                          NEEDS CLARIFICATION: Missing in intent
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 bg-surface-container-low/40 p-2.5 rounded-lg border border-[#DFE5E8]/40 flex items-center justify-between text-secondary font-body-sm text-body-sm">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Missing values are represented as &quot;Not provided&quot; or &quot;Needs clarification&quot;. Guessed values are strictly prohibited.
                </span>
                <span className="font-code-sm text-code-sm">Strict Zero-Guess Policy</span>
              </div>
            </section>

            {/* SCREENING GROUP 2: Security Checks */}
            <section className="bg-surface-container-lowest rounded-2xl border border-[#DFE5E8] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">2. Security Checks</h3>
                </div>
                <span className="font-label-sm text-label-sm text-secondary">5 Server Validations</span>
              </div>
              <div className="space-y-3">
                {/* Merchant on allowlist [WARN] */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#FDE68A] bg-[#FEF3C7]/40">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#B45309] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">Merchant on allowlist</p>
                      <p className="font-body-sm text-body-sm text-secondary">Unverified merchant alias requires confirmation</p>
                    </div>
                  </div>
                  <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">WARN</span>
                </div>
                {/* Merchant active [PASS] */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#DFE5E8] bg-surface-container-lowest">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#107E3E] text-[20px]">check_circle</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">Merchant active</p>
                      <p className="font-body-sm text-body-sm text-secondary">Active sandbox account detected (Status: VERIFIED_MOCK)</p>
                    </div>
                  </div>
                  <span className="bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">PASS</span>
                </div>
                {/* Duplicate reference check [PASS] */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#DFE5E8] bg-surface-container-lowest">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#107E3E] text-[20px]">check_circle</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">Duplicate reference check</p>
                      <p className="font-body-sm text-body-sm text-secondary">No prior settlement for AC-901 in sandbox ledger</p>
                    </div>
                  </div>
                  <span className="bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">PASS</span>
                </div>
                {/* Within transaction limit [PASS] */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#DFE5E8] bg-surface-container-lowest">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#107E3E] text-[20px]">check_circle</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">Within transaction limit</p>
                      <p className="font-body-sm text-body-sm text-secondary">USD 125.00 within standard single-check limits (\$500.00 max)</p>
                    </div>
                  </div>
                  <span className="bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">PASS</span>
                </div>
                {/* Currency supported [PASS] */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#DFE5E8] bg-surface-container-lowest">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#107E3E] text-[20px]">check_circle</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">Currency supported</p>
                      <p className="font-body-sm text-body-sm text-secondary">USD supported for PayPal Sandbox payment processing</p>
                    </div>
                  </div>
                  <span className="bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">PASS</span>
                </div>
              </div>
            </section>

            {/* SCREENING GROUP 3 & 4: Spam & Scam Signals Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GROUP 3: Spam Signals */}
              <section className="bg-surface-container-lowest rounded-2xl border border-[#DFE5E8] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">mark_email_read</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">3. Spam Signals</h3>
                  </div>
                  <span className="bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">PASS</span>
                </div>
                <div className="p-3 bg-surface-container-low/50 rounded-xl border border-[#DFE5E8]/40">
                  <div className="flex items-center gap-2 text-on-surface font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>No spam patterns identified</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary mt-1">
                    Domain entropy, invoice frequency velocity, and recipient repetition are within normal tolerances.
                  </p>
                </div>
              </section>

              {/* GROUP 4: Scam Signals */}
              <section className="bg-[#FFFDF5] rounded-2xl border border-[#FDE68A] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#B45309] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      security_update_warning
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">4. Scam Signals</h3>
                  </div>
                  <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">WARN</span>
                </div>
                <div className="p-3 bg-[#FEF3C7]/50 rounded-xl border border-[#FCD34D]/70 mb-2.5">
                  <div className="flex items-start gap-2 text-[#92400E] font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    <span>Unusual discrepancy between spoken trading name and registered merchant account name.</span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  Screening status is determined by deterministic server rules. This rule halted progression to protect your account.
                </p>
              </section>
            </div>
          </div>

          {/* RIGHT 4-COLUMN AREA: Telemetry & Explanation */}
          <div className="lg:col-span-4 space-y-6">
            {/* EXPLANATION CARD (Server-Rule Signal) */}
            <section className="bg-surface-container-lowest rounded-2xl border border-[#DFE5E8] p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[#B45309] mb-3">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
                <h3 className="font-label-lg text-label-lg font-bold">Explanation · Server-rule signal</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                Your spoken intent did not include an invoice reference, and the recipient name differs slightly from the registered entity name. You cannot proceed directly to checkout. Fix your intent or re-verify merchant details.
              </p>
              <div className="mt-4 pt-4 border-t border-[#DFE5E8]/40 space-y-2">
                <span className="font-label-sm text-label-sm text-secondary block">REQUIRED REMEDIATIONS:</span>
                <div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                  <span>Confirm &quot;Aura Cloud Hosting LLC&quot; matches your intended payee.</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                  <span>
                    Provide reference invoice{" "}
                    <code className="font-code-sm text-code-sm bg-surface-container-high px-1 py-0.5 rounded">AC-901</code>.
                  </span>
                </div>
              </div>
            </section>

            {/* VOICE TRANSCRIPTION STREAM */}
            <section className="bg-[#F7F8FA] border border-[#DFE5E8] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">graphic_eq</span>
                  Original Voice Telemetry
                </span>
                <span className="font-code-sm text-code-sm text-secondary">Audio Sample #449</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#DFE5E8] font-code-md text-code-md text-on-surface mb-2.5">
                &quot;Pay one hundred twenty five dollars to Aura Cloud Services please.&quot;
              </div>
              {/* Audio wave visualization */}
              <div className="h-8 bg-surface-container-low rounded flex items-center justify-center gap-1 px-3">
                {[3, 5, 7, 4, 6, 3, 5, 2, 4, 6, 3, 2].map((h, i) => (
                  <div key={i} className="w-1 bg-primary-container rounded-full" style={{ height: `${h * 4}px` }}></div>
                ))}
              </div>
              <span className="font-code-sm text-code-sm text-secondary block mt-2 text-right">
                Confidence Score: 0.94 · Model: whisper-fin-v3
              </span>
            </section>

            {/* AUDIT NOTICE */}
            <section className="bg-surface-container-low/50 rounded-xl border border-[#DFE5E8] p-4">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">policy</span>
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    This review event is immutably recorded under ID{" "}
                    <span className="font-code-sm text-code-sm font-semibold text-primary">chk_demo_205</span>.
                  </p>
                  <Link
                    className="font-label-md text-label-md text-primary hover:underline inline-flex items-center gap-0.5 mt-1.5"
                    href="/checks/chk_demo_205"
                  >
                    <span>View log</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* BOTTOM STICKY ACTION BAR */}
      <aside className="sticky bottom-0 z-40 w-full bg-surface-container-lowest border-t border-[#DFE5E8] shadow-[0_-4px_12px_rgba(21,35,45,0.06)] py-3 px-4 md:px-margin-desktop">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[#B45309] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <span>Payment progression locked: Resolution required to ensure counterparty certainty.</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <button
              className="px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-[#DFE5E8] text-on-surface hover:bg-surface-container-low font-label-md text-label-md transition-colors active:scale-[0.98]"
              type="button"
            >
              View log
            </button>
            <button
              className="px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-[#DFE5E8] text-on-surface hover:bg-surface-container-low font-label-md text-label-md transition-colors active:scale-[0.98]"
              type="button"
            >
              Why this result?
            </button>
            <button
              onClick={() => router.push("/new-check")}
              className="px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-[#DFE5E8] text-on-surface hover:bg-surface-container-low font-label-md text-label-md transition-colors inline-flex items-center gap-1.5 active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit my intent</span>
            </button>
            {/* Primary Action: Fix details & re-check */}
            <button
              onClick={() => router.push("/new-check/clarify")}
              className="px-4 py-2 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white font-label-md text-label-md shadow-sm transition-all inline-flex items-center gap-1.5 active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">build</span>
              <span>Fix details &amp; re-check</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
