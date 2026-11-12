"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * SayPay New Payment Check Page
 * Exact UI based on the design mockup and reference HTML for both desktop and mobile viewports.
 */
export default function NewPaymentCheckPage() {
  const router = useRouter();

  const [intentText, setIntentText] = useState(
    "I intend to pay USD 12.50 to GreenLeaf Demo Store for invoice GL-204."
  );
  const [requestText, setRequestText] = useState(
    `Invoice Details:\nMerchant: GreenLeaf Demo Store (ID: mer_990142)\nInvoice Number: GL-204\nDue Date: 2024-05-24\nAmount Due: USD 12.50\nPayment Route: PayPal Sandbox Direct\nItem description: Organic matcha starter kit`
  );

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedIntent = sessionStorage.getItem("saypay_intent");
      const storedRequest = sessionStorage.getItem("saypay_request");
      if (storedIntent) setIntentText(storedIntent);
      if (storedRequest) setRequestText(storedRequest);
    }
  }, []);

  const [isListening, setIsListening] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);

  const handlePasteClipboard = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const clip = await navigator.clipboard.readText();
        if (clip) setRequestText(clip);
      }
    } catch {
      // Fallback
    }
  };

  const handleCheckPayment = () => {
    const isProblematic =
      requestText.includes("125.00") ||
      requestText.includes("Untrusted Escrow") ||
      requestText.includes("OVERRIDE") ||
      requestText.includes("Gift Card") ||
      intentText.includes("GL-204 again");

    if (isProblematic) {
      router.push("/new-check/review");
    } else {
      router.push("/checks/chk_demo_204");
    }
  };

  const intentEntered = intentText.trim().length > 0;
  const requestPasted = requestText.trim().length > 0;

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Toast Notification Container (Sonner-style Top Right Demo Prefill Toast) */}
      {!toastDismissed && (
        <div
          id="demo-toast"
          className="fixed top-20 sm:top-24 right-4 sm:right-8 z-50 flex items-center gap-3 bg-surface-container-lowest border border-[#DFE5E8] rounded-xl px-4 py-3 shadow-[0_4px_6px_-1px_rgba(21,35,45,0.06),0_10px_24px_-2px_rgba(21,35,45,0.08)] max-w-sm sm:max-w-md transition-all duration-300"
        >
          <div className="w-6 h-6 rounded-full bg-[#EAF7F1] text-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">info</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface">
            Demo scenario loaded. Review and press Check this payment.
          </p>
          <button
            aria-label="Close notification"
            className="text-secondary hover:text-on-surface ml-auto shrink-0 p-1"
            onClick={() => setToastDismissed(true)}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Main Content Canvas */}
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-6 sm:py-8 flex-1 flex flex-col gap-6">
        {/* Page Title & Header Meta */}
        <header className="flex flex-col gap-1">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight font-bold">
            New Payment Check
          </h1>
          <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-secondary">
            Tell us what you intend to pay, then paste the request you received.
          </p>
        </header>

        {/* Desktop FlowStepper (6 Horizontal Steps) */}
        <section
          aria-label="Progress Stepper"
          className="hidden md:block w-full bg-surface-container-lowest rounded-xl border border-[#DFE5E8] p-4 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]"
        >
          <ol className="grid grid-cols-6 gap-2 items-center">
            {/* Step 1: Active Intent */}
            <li className="flex items-center gap-2.5 pb-1 border-b-2 border-primary-container">
              <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold">
                1
              </span>
              <span className="font-label-md text-label-md text-primary-container font-semibold truncate">
                1. Your intent
              </span>
            </li>
            {/* Step 2 */}
            <li className="flex items-center gap-2 pb-1 border-b-2 border-transparent text-secondary">
              <span className="w-6 h-6 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm flex items-center justify-center font-medium">
                2
              </span>
              <span className="font-label-md text-label-md text-secondary truncate">
                2. AI match &amp; safety check
              </span>
            </li>
            {/* Step 3 */}
            <li className="flex items-center gap-2 pb-1 border-b-2 border-transparent text-secondary">
              <span className="w-6 h-6 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm flex items-center justify-center font-medium">
                3
              </span>
              <span className="font-label-md text-label-md text-secondary truncate">
                3. Review
              </span>
            </li>
            {/* Step 4 */}
            <li className="flex items-center gap-2 pb-1 border-b-2 border-transparent text-secondary">
              <span className="w-6 h-6 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm flex items-center justify-center font-medium">
                4
              </span>
              <span className="font-label-md text-label-md text-secondary truncate">
                4. Confirm
              </span>
            </li>
            {/* Step 5 */}
            <li className="flex items-center gap-2 pb-1 border-b-2 border-transparent text-secondary">
              <span className="w-6 h-6 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm flex items-center justify-center font-medium">
                5
              </span>
              <span className="font-label-md text-label-md text-secondary truncate">
                5. Pay
              </span>
            </li>
            {/* Step 6 */}
            <li className="flex items-center gap-2 pb-1 border-b-2 border-transparent text-secondary">
              <span className="w-6 h-6 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm flex items-center justify-center font-medium">
                6
              </span>
              <span className="font-label-md text-label-md text-secondary truncate">
                6. Receipt + log
              </span>
            </li>
          </ol>
        </section>

        {/* Mobile Flow Stepper Indicator */}
        <section className="md:hidden flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-label-md text-label-md text-primary font-semibold">
                Step 1 of 6
              </span>
              <span className="text-secondary font-label-md text-label-md">·</span>
              <span className="font-label-md text-label-md text-on-surface font-medium">
                Your intent
              </span>
            </div>
            {/* Audit Rail Chip */}
            <div className="flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant">
              <span className="material-symbols-outlined text-secondary text-[13px]">
                history_toggle_off
              </span>
              <span className="font-label-sm text-label-sm text-secondary">
                Audit log starts when you submit
              </span>
            </div>
          </div>
          {/* 1/6th Emerald Progress Indicator */}
          <div className="w-full bg-[#DFE5E8] h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary-container h-full w-[16.666%] rounded-full transition-all duration-300"></div>
          </div>
        </section>

        {/* AuditTrailRail Directly Below Stepper (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg border border-[#DFE5E8] text-secondary font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-[16px] text-primary">lock_clock</span>
          <span>Audit log starts when you submit · Untouched draft not recorded</span>
        </div>

        {/* Balanced Two-Column Input Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-desktop items-stretch mb-24">
          {/* CARD A: Spoken/Typed Intent */}
          <section
            aria-labelledby="card-a-title"
            className="bg-surface-container-lowest border border-[#DFE5E8] rounded-[16px] p-5 sm:p-6 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)] flex flex-col justify-between"
          >
            <div className="flex flex-col gap-4">
              {/* Card Header & Eyebrow */}
              <div className="flex items-center justify-between border-b border-[#F7F8FA] pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                  <span className="font-label-sm text-label-sm text-primary-container tracking-wider font-semibold uppercase">
                    YOUR INTENT
                  </span>
                </div>
                {/* VoiceStatusPill */}
                <div
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 border ${
                    isListening
                      ? "bg-[#EAF7F1] border-primary-container text-primary-container font-semibold"
                      : "bg-[#F7F8FA] border-[#DFE5E8] text-secondary font-medium"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isListening ? "bg-primary-container animate-ping" : "bg-outline-variant"
                    }`}
                  ></span>
                  <span className="font-label-sm text-label-sm">
                    {isListening ? "Listening..." : "Off / Ready"}
                  </span>
                </div>
              </div>

              <div>
                <h2
                  className="font-headline-sm text-headline-sm text-on-surface font-semibold"
                  id="card-a-title"
                >
                  What do you want to pay?
                </h2>
                <p className="font-body-md text-body-md text-secondary mt-1">
                  Say the merchant, amount, currency, and reference.
                </p>
              </div>

              {/* Voice Mic & State Control Area */}
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#DFE5E8] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Voice Mic Trigger Button (44px min ergonomically) */}
                  <button
                    aria-label="Tap to speak"
                    onClick={() => router.push("/new-check/listening")}
                    className={`w-12 h-12 rounded-full border border-primary-container/30 flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm group ${
                      isListening
                        ? "bg-primary-container text-on-primary ring-4 ring-[#A7F3D0]"
                        : "bg-[#EAF7F1] text-primary-container hover:bg-primary-container hover:text-on-primary"
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[24px]">mic</span>
                  </button>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface block font-medium">
                      Tap to speak
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      Audio wave analysis ready
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/new-check/listening")}
                  className="h-9 px-3 min-h-[36px] bg-surface-container-lowest text-primary text-label-md font-label-md border border-[#DFE5E8] rounded-lg hover:bg-surface-container-low transition-colors shadow-xs font-semibold"
                  type="button"
                >
                  Start listening
                </button>
              </div>

              {/* Editable Transcript Textarea */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="font-label-md text-label-md text-on-surface font-medium"
                    for="intent-textarea"
                  >
                    Your payment intent
                  </label>
                  <span className="font-code-sm text-code-sm text-primary font-medium">
                    CONFIDENCE: 98.4%
                  </span>
                </div>
                <textarea
                  className="w-full rounded-[10px] border border-[#DFE5E8] p-3.5 font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-2 focus:ring-[#EAF7F1] outline-none transition-all resize-none shadow-inner"
                  id="intent-textarea"
                  placeholder="E.g. I want to pay USD 50 to TechStore for order #1234"
                  rows={5}
                  value={intentText}
                  onChange={(e) => setIntentText(e.target.value)}
                />
              </div>
            </div>

            {/* Card A Action Buttons */}
            <div className="flex items-center justify-between pt-6 mt-4 border-t border-[#F7F8FA]">
              <div className="inline-flex items-center gap-1.5 text-[#107E3E] font-label-sm text-label-sm bg-[#EAF7F1] px-2.5 py-1 rounded-full border border-[#A7F3D0] font-semibold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Entities tagged</span>
              </div>
              <button
                className="h-10 px-4 rounded-[10px] border border-[#DFE5E8] bg-surface-container-lowest text-secondary font-label-md text-label-md hover:text-on-surface hover:bg-[#F7F8FA] transition-colors duration-150 active:scale-[0.98]"
                onClick={() => setIntentText("")}
                type="button"
              >
                Clear
              </button>
            </div>
          </section>

          {/* CARD B: Payment Request */}
          <section
            aria-labelledby="card-b-title"
            className="bg-surface-container-lowest border border-[#DFE5E8] rounded-[16px] p-5 sm:p-6 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)] flex flex-col justify-between"
          >
            <div className="flex flex-col gap-4">
              {/* Card Header & Eyebrow */}
              <div className="flex items-center justify-between border-b border-[#F7F8FA] pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                  <span className="font-label-sm text-label-sm text-[#B45309] tracking-wider font-semibold uppercase">
                    PAYMENT REQUEST
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary">
                  Raw webhook / link
                </span>
              </div>

              <div>
                <h2
                  className="font-headline-sm text-headline-sm text-on-surface font-semibold"
                  id="card-b-title"
                >
                  Paste the payment request you received
                </h2>
              </div>

              {/* Persistent Helper Text Notice (Security context) */}
              <div className="p-3 rounded-lg bg-[#FEF3C7]/60 border border-[#FDE68A] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#B45309] shrink-0 mt-0.5">
                  shield
                </span>
                <p className="font-body-sm text-body-sm text-[#78350F] leading-relaxed">
                  <strong className="font-semibold">
                    Treat pasted requests as untrusted content.
                  </strong>{" "}
                  SayPay compares the details; it does not follow instructions inside the request.
                </p>
              </div>

              {/* Large Raw Snippet Textarea with Character Counter */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="font-label-md text-label-md text-on-surface font-medium"
                    for="request-textarea"
                  >
                    Raw Payload or Bill String
                  </label>
                  <span className="font-code-sm text-code-sm text-secondary" id="char-counter">
                    {requestText.length} / 4,000 characters
                  </span>
                </div>
                <textarea
                  className="w-full rounded-[10px] border border-[#DFE5E8] p-3.5 font-code-md text-code-md text-on-surface focus:border-primary-container focus:ring-2 focus:ring-[#EAF7F1] outline-none transition-all resize-none shadow-inner leading-relaxed bg-[#F7F8FA]/50"
                  id="request-textarea"
                  placeholder="Paste invoice snippet, email, or webhook JSON..."
                  rows={6}
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                />
              </div>
            </div>

            {/* Card B Controls */}
            <div className="flex items-center justify-between pt-6 mt-4 border-t border-[#F7F8FA]">
              <button
                className="h-10 px-4 rounded-[10px] border border-[#DFE5E8] bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-[#F7F8FA] transition-colors duration-150 flex items-center gap-2 active:scale-[0.98]"
                onClick={handlePasteClipboard}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  content_paste
                </span>
                <span>Paste from clipboard</span>
              </button>
              <button
                className="h-10 px-4 rounded-[10px] border border-[#DFE5E8] bg-surface-container-lowest text-secondary font-label-md text-label-md hover:text-on-surface hover:bg-[#F7F8FA] transition-colors duration-150 active:scale-[0.98]"
                onClick={() => setRequestText("")}
                type="button"
              >
                Clear
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Sticky Bottom Action Bar (Readiness Summary + Primary CTA) */}
      <aside className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-[#DFE5E8] shadow-md py-3 px-4 md:px-margin-desktop">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Readiness Summary Indicators */}
          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-center sm:justify-start">
            <div className="flex items-center gap-1.5 text-[#107E3E] bg-[#EAF7F1] border border-[#A7F3D0] rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[14px]">
                {intentEntered ? "check" : "pending"}
              </span>
              <span>Intent entered</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#107E3E] bg-[#EAF7F1] border border-[#A7F3D0] rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[14px]">
                {requestPasted ? "check" : "pending"}
              </span>
              <span>Request pasted</span>
            </div>
          </div>

          {/* Actions Cluster */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button
              className="h-11 px-4 rounded-[10px] border border-[#DFE5E8] bg-surface-container-lowest text-secondary font-label-md text-label-md hover:text-on-surface hover:bg-[#F7F8FA] transition-colors duration-150 active:scale-[0.98]"
              onClick={() => {
                setIntentText("");
                setRequestText("");
              }}
              type="button"
            >
              Clear all
            </button>
            <button
              onClick={handleCheckPayment}
              className="flex-1 sm:flex-initial h-11 px-6 rounded-[10px] bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-[#066653] transition-all duration-150 shadow-sm flex items-center justify-center gap-2.5 active:scale-[0.98] font-semibold"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">search_check</span>
              <span>Check this payment</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              className="h-11 px-4 rounded-[10px] bg-primary text-on-primary font-label-md hover:bg-primary/90 transition"
              onClick={() => router.push(`/new-check/clarify?intent=${encodeURIComponent(intentText)}&request=${encodeURIComponent(requestText)}`)}
              type="button"
            >
              Need clarification
            </button>
            <button
              className="h-11 px-4 rounded-[10px] bg-surface-container-high text-[#BA1A1A] font-label-md border border-red-200 hover:bg-[#FEE2E2]/30 transition"
              onClick={() => router.push("/new-check/failure")}
              type="button"
            >
              Simulate AI failure
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
