"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowPageLayout from "../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../components/flow/VoiceAssistPanel.js";
import { DEMO_PAYMENT } from "../../lib/demoFlowData.js";

export default function NewPaymentCheckPage({ onOpenAuditLog }) {
  const router = useRouter();

  const [intentText, setIntentText] = useState(DEMO_PAYMENT.voiceTranscript);
  const [requestText, setRequestText] = useState(DEMO_PAYMENT.requestSnippet);

  const intentReady = intentText.trim().length > 0;
  const requestReady = requestText.trim().length > 0;

  const handleTranscript = (text) => {
    setIntentText((current) =>
      current.trim() ? `${current.trim()} ${text}` : text,
    );
  };

  const handlePaste = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const clip = await navigator.clipboard.readText();
        if (clip) setRequestText(clip);
      }
    } catch {
      // Clipboard permission is optional in the sandbox demo.
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
    if (!intentReady || !requestReady) return;
    router.push("/checks/chk_demo_204");
  };

  return (
    <FlowPageLayout
      stage={1}
      status="Capture"
      tone="clear"
      auditCount={0}
      onOpenAuditLog={onOpenAuditLog}
      eyebrow="New payment check"
      title="Capture your intent and the request"
      subtitle="Say or type what you want to pay, then add the payment request you received. SayPay compares both sources before anything can be paid."
      badge={
        <>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#DFE5E8] bg-white px-2.5 py-0.5 font-label-sm text-label-sm text-secondary">
            <span className="material-symbols-outlined text-[13px]">edit_note</span>
            Stage 1 · Capture
          </span>
          <span className="font-code-sm text-code-sm text-secondary">
            2 sources required
          </span>
        </>
      }
      assistant={
        <VoiceAssistPanel
          stage={1}
          greeting="Hi, I’m SayPay Assist. Tell me what you want to pay and I’ll fill in your intent. You can always type instead."
          reply="I captured that in your payment intent. Paste the merchant’s request next so I can compare the two sources."
          amountReply="I heard USD 12.50. Tell me the merchant and invoice reference too, or paste the request and I’ll read it from there."
          merchantReply="I’ll compare the merchant name against the payment request and the approved merchant list before anything is paid."
          whyReply="SayPay compares your spoken intent with the request field by field. A hard mismatch can block the payment before PayPal is opened."
          actionReply="Add both the intent and the payment request, then press “Check this payment”."
          suggestions={[
            "I want to pay USD 12.50 to GreenLeaf Demo Store for GL-204",
            "What details do you need?",
          ]}
          samplePhrase="I want to pay USD 12.50 to GreenLeaf Demo Store for invoice GL-204."
          onTranscript={handleTranscript}
        />
      }
    >
      <div className="space-y-5">
        {/* Intent */}
        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF7F1] text-primary-container">
                <span className="material-symbols-outlined text-[18px]">
                  record_voice_over
                </span>
              </span>
              <div>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  What do you want to pay?
                </h2>
                <p className="font-body-sm text-body-sm text-secondary">
                  Your own words, captured by voice or typed.
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${
                intentReady
                  ? "border-[#A7F3D0] bg-[#EAF7F1] text-[#107E3E]"
                  : "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]"
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {intentReady ? "check_circle" : "pending"}
              </span>
              {intentReady ? "Intent captured" : "Intent needed"}
            </span>
          </div>

          <label
            htmlFor="intent-text"
            className="mb-1.5 block font-label-md text-label-md font-semibold text-on-surface"
          >
            Payment intent
          </label>
          <textarea
            id="intent-text"
            rows={4}
            value={intentText}
            onChange={(event) => setIntentText(event.target.value)}
            placeholder="e.g. I want to pay USD 50 to TechStore for order #1234"
            className="w-full resize-none rounded-[10px] border border-[#DFE5E8] bg-white p-3.5 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-[#EAF7F1]"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="font-body-sm text-body-sm text-secondary">
              {intentText.length} characters · editable before you submit
            </span>
            <button
              type="button"
              onClick={() => setIntentText("")}
              className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#DFE5E8] bg-white px-2.5 py-1 font-label-sm text-label-sm font-semibold text-secondary hover:bg-[#F7F8FA]"
            >
              <span className="material-symbols-outlined text-[15px]">
                backspace
              </span>
              Clear
            </button>
          </div>
        </section>

        {/* Request */}
        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#B45309]">
                <span className="material-symbols-outlined text-[18px]">
                  request_quote
                </span>
              </span>
              <div>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  What did the merchant request?
                </h2>
                <p className="font-body-sm text-body-sm text-secondary">
                  Paste the invoice, message or payment link exactly as received.
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${
                requestReady
                  ? "border-[#A7F3D0] bg-[#EAF7F1] text-[#107E3E]"
                  : "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]"
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {requestReady ? "check_circle" : "pending"}
              </span>
              {requestReady ? "Request pasted" : "Request needed"}
            </span>
          </div>

          <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#FDE68A] bg-[#FEF3C7]/50 p-3">
            <span className="material-symbols-outlined text-[18px] text-[#B45309]">
              shield
            </span>
            <p className="font-body-sm text-body-sm leading-relaxed text-[#78350F]">
              <span className="font-semibold">
                Treat pasted requests as untrusted content.
              </span>{" "}
              SayPay compares details and never follows instructions inside the
              request.
            </p>
          </div>

          <label
            htmlFor="request-text"
            className="mb-1.5 block font-label-md text-label-md font-semibold text-on-surface"
          >
            Payment request
          </label>
          <textarea
            id="request-text"
            rows={5}
            value={requestText}
            onChange={(event) => setRequestText(event.target.value)}
            placeholder="Paste an invoice snippet, email or payment link…"
            className="w-full resize-none rounded-[10px] border border-[#DFE5E8] bg-[#F7F8FA] p-3.5 font-code-md text-[12px] leading-relaxed text-on-surface outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-[#EAF7F1]"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#DFE5E8] bg-white px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-surface hover:bg-[#F7F8FA]"
            >
              <span className="material-symbols-outlined text-[15px]">
                content_paste
              </span>
              Paste from clipboard
            </button>
            <span className="font-body-sm text-body-sm text-secondary">
              {requestText.length} / 4,000 characters
            </span>
            <button
              type="button"
              onClick={() => setRequestText("")}
              className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#DFE5E8] bg-white px-2.5 py-1 font-label-sm text-label-sm font-semibold text-secondary hover:bg-[#F7F8FA]"
            >
              <span className="material-symbols-outlined text-[15px]">
                backspace
              </span>
              Clear
            </button>
          </div>
        </section>

        {/* Actions */}
        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${
                  intentReady
                    ? "border-[#A7F3D0] bg-[#EAF7F1] text-[#107E3E]"
                    : "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]"
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {intentReady ? "check" : "pending"}
                </span>
                Intent
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${
                  requestReady
                    ? "border-[#A7F3D0] bg-[#EAF7F1] text-[#107E3E]"
                    : "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]"
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {requestReady ? "check" : "pending"}
                </span>
                Request
              </span>
              <span className="font-body-sm text-body-sm text-secondary">
                Both sources are needed before the check can run.
              </span>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIntentText("");
                    setRequestText("");
                  }}
                  className="min-h-[44px] rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-secondary hover:bg-[#F7F8FA]"
                >
                  Clear all
                </button>
                <Link
                  href="/new-check/clarify"
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-[10px] px-2.5 py-2 font-label-md text-label-md font-semibold text-primary hover:underline"
                >
                  Need clarification?
                </Link>
                <Link
                  href="/new-check/failure"
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-[10px] px-2.5 py-2 font-label-md text-label-md font-semibold text-secondary hover:text-[#B45309] hover:underline"
                >
                  Demo: AI failure
                </Link>
              </div>

              <button
                type="button"
                onClick={handleCheckPayment}
                disabled={!intentReady || !requestReady}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-lg text-label-lg font-semibold text-white shadow-sm transition-all hover:bg-primary disabled:cursor-not-allowed disabled:bg-[#DFE5E8] disabled:text-[#586672]"
              >
                <span className="material-symbols-outlined text-[19px]">
                  search_check
                </span>
                Check this payment
                <span className="material-symbols-outlined text-[17px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </FlowPageLayout>
  );
}
