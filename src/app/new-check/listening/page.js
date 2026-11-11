"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewPaymentCheckListeningPage() {
  const router = useRouter();

  const [requestText, setRequestText] = useState(
`=== PAYPAL SANDBOX INVOICE ===
Merchant: GreenLeaf Demo Store (sandbox_merchant_gl@example.com)
Invoice Number: GL-204
Date: 2025-05-18
Payment Link: https://sandbox.paypal.com/checkout/inv/gl204-test-pay
Amount Due: $12.50 USD
Currency: USD
Notes: Net 15 days service fee for mock order fulfillment.
Recipient Verification ID: SBX-994-A1`
  );

  const [isListening, setIsListening] = useState(true);

  const handleStopListening = () => {
    setIsListening(false);
    // User can navigate or switch back to standard check
    router.push("/new-check");
  };

  const handleCancel = () => {
    router.push("/new-check");
  };

  return (
    <div className="w-full flex-1 flex flex-col font-body-md text-on-surface antialiased bg-surface selection:bg-[#94F5D8] selection:text-[#002019]">
      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes soundbar {
          0%,
          100% {
            height: 6px;
          }
          50% {
            height: 26px;
          }
        }
        .animate-ring-1 {
          animation: pulse-ring 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .animate-ring-2 {
          animation: pulse-ring 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 0.7s;
        }
        .bar-anim-1 {
          animation: soundbar 0.9s ease-in-out infinite 0.1s;
        }
        .bar-anim-2 {
          animation: soundbar 0.7s ease-in-out infinite 0.3s;
        }
        .bar-anim-3 {
          animation: soundbar 1.1s ease-in-out infinite 0.15s;
        }
        .bar-anim-4 {
          animation: soundbar 0.8s ease-in-out infinite 0.45s;
        }
        .bar-anim-5 {
          animation: soundbar 1.2s ease-in-out infinite 0.25s;
        }
        .bar-anim-6 {
          animation: soundbar 0.75s ease-in-out infinite 0.35s;
        }
        @keyframes cursor-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-cursor {
          animation: cursor-blink 0.8s infinite;
        }
      `}</style>

      {/* Main Content Container */}
      <main className="flex-grow max-w-[1280px] w-full mx-auto px-4 md:px-margin-desktop py-6 flex flex-col gap-6 pb-32">
        {/* Title & Subtitle + Flow Stepper Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DFE5E8] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                className="text-secondary hover:text-primary transition-colors flex items-center gap-1 font-label-md text-label-md"
                href="/"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Dashboard</span>
              </Link>
              <span className="text-secondary/50 text-xs">/</span>
              <span className="text-on-surface font-label-md text-label-md">
                New Payment Check
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              New Payment Check
            </h1>
            <p className="text-secondary font-body-md text-body-md mt-1">
              Tell us what you intend to pay, then paste the request you received.
            </p>
          </div>

          {/* Flow Stepper */}
          <nav
            aria-label="Verification Steps"
            className="flex items-center gap-2 bg-surface-container-lowest border border-[#DFE5E8] p-1.5 rounded-xl shadow-sm self-start md:self-auto"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EAF7F1] border border-primary-container ring-2 ring-primary/20">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-label-sm text-label-sm font-bold">
                1
              </span>
              <span className="font-label-md text-label-md font-semibold text-primary">
                Your intent
              </span>
            </div>
            <span className="text-[#DFE5E8]">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-secondary opacity-60">
              <span className="w-5 h-5 rounded-full border border-secondary flex items-center justify-center font-label-sm text-label-sm">
                2
              </span>
              <span className="font-label-md text-label-md font-medium">Audit match</span>
            </div>
            <span className="text-[#DFE5E8]">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-secondary opacity-60">
              <span className="w-5 h-5 rounded-full border border-secondary flex items-center justify-center font-label-sm text-label-sm">
                3
              </span>
              <span className="font-label-md text-label-md font-medium">Decision</span>
            </div>
          </nav>
        </div>

        {/* AuditTrailRail Notice */}
        <div className="bg-surface-container-low border border-[#DFE5E8] rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
            <span
              className="material-symbols-outlined text-primary text-base"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <span>
              Audit log starts when you submit ·{" "}
              <span className="font-medium text-on-surface">
                Untouched draft not recorded
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 font-code-sm text-code-sm text-secondary">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>SESSION: ST-90214-VOICE</span>
          </div>
        </div>

        {/* Two Cards Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          {/* Card A (YOUR INTENT - IN ACTIVE LISTENING STATE) */}
          <section className="lg:col-span-6 bg-surface-container-lowest rounded-[16px] border border-[#DFE5E8] p-5 sm:p-6 shadow-sm flex flex-col gap-5 relative overflow-hidden ring-1 ring-primary/30">
            {/* Glowing accent top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-[#94F5D8]"></div>

            {/* Header / Eyebrow */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-label-sm text-label-sm tracking-wider uppercase text-primary font-bold">
                  YOUR INTENT
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">
                  What do you want to pay?
                </h2>
              </div>
              {/* VoiceStatusPill */}
              <div className="flex items-center gap-2 bg-[#EAF7F1] border border-[#A7F3D0] px-3 py-1 rounded-full">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#107E3E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#107E3E]"></span>
                </span>
                <span className="font-label-sm text-label-sm font-semibold text-[#107E3E]">
                  Listening...
                </span>
              </div>
            </div>

            {/* Active Listening Microphone Panel */}
            <div className="bg-[#F7F8FA] rounded-xl border border-[#DFE5E8] p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Concentric Pulse Animation Center */}
              <div className="relative w-28 h-28 flex items-center justify-center my-3">
                <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-ring-1"></div>
                <div className="absolute w-24 h-24 rounded-full bg-primary/15 animate-ring-2"></div>
                {/* Emerald Mic Button */}
                <button
                  aria-label="Microphone active"
                  className="relative z-10 w-16 h-16 rounded-full bg-primary-container text-white flex items-center justify-center shadow-md shadow-primary/20 hover:bg-primary transition-transform active:scale-95"
                  onClick={handleStopListening}
                  title="Listening Active - Click to stop"
                  type="button"
                >
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    mic
                  </span>
                </button>
              </div>

              {/* Animated Sound Wave Bars */}
              <div aria-hidden="true" className="flex items-center gap-1.5 h-8 my-2">
                <span className="w-1.5 bg-primary rounded-full bar-anim-1"></span>
                <span className="w-1.5 bg-primary rounded-full bar-anim-2"></span>
                <span className="w-1.5 bg-primary rounded-full bar-anim-3"></span>
                <span className="w-1.5 bg-primary rounded-full bar-anim-4"></span>
                <span className="w-1.5 bg-primary rounded-full bar-anim-5"></span>
                <span className="w-1.5 bg-primary rounded-full bar-anim-6"></span>
                <span className="w-1.5 bg-primary rounded-full bar-anim-2"></span>
                <span className="w-1.5 bg-primary rounded-full bar-anim-4"></span>
              </div>

              {/* Active Instruction Text */}
              <p className="font-label-lg text-label-lg font-medium text-on-surface mt-2">
                Listening... speak now. Say merchant, amount, and reference.
              </p>
              <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                e.g., &ldquo;Send $12.50 to GreenLeaf for invoice 204&rdquo;
              </p>

              {/* Voice Control Buttons: Stop listening & Cancel */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={handleStopListening}
                  className="h-11 px-4 rounded-[10px] bg-white border border-[#FECACA] hover:bg-[#FEF2F2] text-[#BA1A1A] font-label-md text-label-md flex items-center gap-2 shadow-sm transition-colors active:scale-[0.98] font-semibold"
                  type="button"
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    stop
                  </span>
                  <span>Stop listening</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="h-11 px-4 rounded-[10px] bg-white border border-[#DFE5E8] hover:bg-[#F7F8FA] text-secondary font-label-md text-label-md transition-colors active:scale-[0.98]"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Live Interim Transcript Box */}
            <div className="flex flex-col gap-2">
              <div className="bg-[#F7F8FA] border border-[#DFE5E8] rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-[#DFE5E8]/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">
                      graphic_eq
                    </span>
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      Interim speech capture
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-code-sm text-code-sm text-primary bg-[#EAF7F1] px-2 py-0.5 rounded border border-[#A7F3D0]">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    <span>Live 120ms</span>
                  </div>
                </div>

                {/* Streaming Text with blinking cursor */}
                <div className="font-body-lg text-body-lg text-on-surface min-h-[58px] leading-relaxed">
                  <span>
                    &ldquo;I want to send 12 dollars and fifty cents to GreenLeaf Demo Store for
                    invoice GL-204
                  </span>
                  <span className="inline-block w-0.5 h-4 ml-1 bg-primary align-middle animate-cursor"></span>
                </div>

                <div className="flex items-center gap-1.5 text-secondary font-code-sm text-code-sm pt-1 border-t border-[#DFE5E8]/40">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  <span>Confidence: 96.8% · Engine: Whisper-Sbx-v2.1</span>
                </div>
              </div>

              {/* Helper Note */}
              <p className="font-body-sm text-body-sm text-secondary flex items-start gap-1.5 px-1">
                <span className="material-symbols-outlined text-base text-outline shrink-0 mt-0.5">
                  info
                </span>
                <span>
                  Transcript will be formatted to standard currency and merchant references when you
                  finish speaking.
                </span>
              </p>
            </div>
          </section>

          {/* Card B (PAYMENT REQUEST - RAW UNTRUSTED INVOICE) */}
          <section className="lg:col-span-6 bg-surface-container-lowest rounded-[16px] border border-[#DFE5E8] p-5 sm:p-6 shadow-sm flex flex-col gap-5">
            {/* Header / Eyebrow */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-label-sm text-label-sm tracking-wider uppercase text-secondary font-bold">
                  PAYMENT REQUEST
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">
                  Untrusted Request Payload
                </h2>
              </div>
              {/* Status pill */}
              <div className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Request Pasted</span>
              </div>
            </div>

            <p className="font-body-sm text-body-sm text-secondary -mt-2">
              Paste the invoice snippet, PayPal checkout link, or raw merchant email content exactly
              as provided.
            </p>

            {/* Request Text Area Wrapper */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  className="font-label-md text-label-md font-medium text-on-surface flex items-center gap-1.5"
                  htmlFor="raw-payload"
                >
                  <span>Source Text / Raw Payload</span>
                  <span className="text-[#BA1A1A]">*</span>
                </label>
                <button
                  onClick={async () => {
                    try {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        const clip = await navigator.clipboard.readText();
                        if (clip) setRequestText(clip);
                      }
                    } catch {}
                  }}
                  className="text-primary hover:text-primary-container font-label-md text-label-md flex items-center gap-1 py-1 px-2 rounded hover:bg-[#EAF7F1] transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">content_paste</span>
                  <span>Paste from clipboard</span>
                </button>
              </div>

              {/* Pre-filled invoice payload snippet */}
              <div className="relative">
                <textarea
                  className="w-full rounded-[10px] border border-[#DFE5E8] p-3 font-code-md text-code-md text-on-surface bg-white focus:border-primary focus:ring-2 focus:ring-[#EAF7F1] focus:outline-none transition-shadow resize-none"
                  id="raw-payload"
                  rows={10}
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                />
                <div className="absolute bottom-2.5 right-3 text-secondary font-code-sm text-code-sm bg-white/90 px-1.5 py-0.5 rounded border border-[#DFE5E8]">
                  {requestText.length} characters · ASCII verified
                </div>
              </div>
            </div>

            {/* Sanity verification indicator */}
            <div className="bg-[#F7F8FA] border border-[#DFE5E8] rounded-xl p-3.5 flex items-center justify-between text-secondary font-body-sm text-body-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">
                  verified_user
                </span>
                <span>
                  Target detected:{" "}
                  <strong className="text-on-surface">GreenLeaf Demo Store ($12.50)</strong>
                </span>
              </div>
              <span className="font-code-sm text-code-sm bg-white border border-[#DFE5E8] px-2 py-0.5 rounded">
                PAYPAL_LINK
              </span>
            </div>

            {/* Security notice */}
            <div className="border border-[#FDE68A] bg-[#FEF3C7]/40 rounded-lg p-3 text-secondary font-body-sm text-body-sm flex gap-2">
              <span className="material-symbols-outlined text-[#B45309] text-base shrink-0 mt-0.5">
                lock_clock
              </span>
              <span>
                SayPay compares this raw text with your spoken intent to detect mismatch, deceptive
                merchant aliases, and hidden fee discrepancies.
              </span>
            </div>
          </section>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <aside className="sticky bottom-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md border-t border-[#DFE5E8] shadow-[0_-4px_16px_rgba(21,35,45,0.05)] py-3 px-4 md:px-margin-desktop">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Summary Status Pill Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Voice Input Status */}
            <div className="flex items-center gap-2 bg-[#EAF7F1] border border-[#A7F3D0] px-3 py-1.5 rounded-full font-label-md text-label-md text-[#107E3E]">
              <span className="material-symbols-outlined text-base animate-pulse">
                graphic_eq
              </span>
              <span>Listening to voice input...</span>
            </div>
            {/* Request Pasted Status */}
            <div className="flex items-center gap-2 bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1.5 rounded-full font-label-md text-label-md text-[#1D4ED8]">
              <span className="material-symbols-outlined text-base">check</span>
              <span>Request pasted</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setRequestText("")}
              className="h-11 px-4 rounded-[10px] bg-white border border-[#DFE5E8] text-on-surface font-label-md text-label-md hover:bg-[#F7F8FA] transition-colors active:scale-[0.98]"
              type="button"
            >
              Clear all
            </button>
            {/* Primary Check Payment Button (Disabled / Waiting state) */}
            <button
              className="h-11 px-6 rounded-[10px] bg-[#DFE5E8] text-[#586672] font-label-md text-label-md font-semibold cursor-not-allowed flex items-center gap-2 shadow-none select-none"
              disabled
              title="Finish voice capture before continuing"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">lock</span>
              <span>Finish voice input first</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
