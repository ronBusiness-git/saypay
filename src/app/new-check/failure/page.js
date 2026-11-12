"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowPageLayout from "../../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../../components/flow/VoiceAssistPanel.js";

const INTENT_TEXT =
  "I intend to pay USD 12.50 to GreenLeaf Demo Store for invoice GL-204.";
const REQUEST_TEXT =
  "Hi, please settle the usual amount for last month asap. Details attached in the portal.";

const RECOVERY = [
  {
    title: "Retry the AI check",
    detail: "Resubmit the same intent and request. Nothing is charged on a retry.",
    icon: "restart_alt",
    href: "/checks/chk_demo_204",
    primary: true,
  },
  {
    title: "Type the details manually",
    detail: "Add the merchant, amount and reference yourself on the start page.",
    icon: "keyboard",
    href: "/new-check",
    primary: false,
  },
  {
    title: "Record your intent again",
    detail: "Speak the payment intent one more time with the invoice reference.",
    icon: "replay",
    href: "/new-check/listening",
    primary: false,
  },
];

export default function NewCheckFailurePage({ onOpenAuditLog }) {
  const router = useRouter();

  return (
    <FlowPageLayout
      stage={1}
      status="AI unavailable"
      tone="review"
      auditCount={1}
      onOpenAuditLog={onOpenAuditLog}
      eyebrow="New payment check · AI failure"
      title="The AI could not read this request"
      subtitle="Your text is safe. No match check ran, and no PayPal order was created."
      badge={
        <>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-[#B45309]">
            <span className="material-symbols-outlined text-[13px]">cloud_off</span>
            N3 · AI failure
          </span>
          <span className="font-code-sm text-code-sm text-secondary">
            AI_PARSE_FAILED · 503
          </span>
        </>
      }
      actions={
        <Link
          href="/new-check"
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-3 py-2 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
        >
          <span className="material-symbols-outlined text-[17px]">arrow_back</span>
          Back to start
        </Link>
      }
      assistant={
        <VoiceAssistPanel
          stage={1}
          greeting="I couldn’t read that payment request, so I stopped instead of guessing."
          reply="Your typed text is still here. Retry the check, type the details yourself, or record again."
          suggestions={[
            "What went wrong?",
            "Retry the check",
            "Type the details instead",
          ]}
          samplePhrase="What went wrong?"
          voiceEnabled={false}
          initialMode="manual"
          disabledMessage="AI assist is unavailable right now. Your text is kept — retry or type the details."
        />
      }
    >
      <div className="space-y-5">
        <section className="rounded-2xl border-2 border-[#FDE68A] bg-[#FFFBEB] p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                sentiment_dissatisfied
              </span>
            </span>
            <div>
              <p className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-[#B45309]">
                Parsing stopped
              </p>
              <h2 className="mt-1 font-headline-sm text-headline-sm font-semibold text-on-surface">
                The request did not contain a clear merchant or amount
              </h2>
              <p className="mt-1 font-body-md text-body-md leading-relaxed text-on-surface/80">
                SayPay could not extract enough fields to compare your intent with the request.
                It did not fall back to guessed values.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 font-body-sm text-body-sm">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2 py-0.5 font-semibold text-[#107E3E]">
                  <span className="material-symbols-outlined text-[13px]">check</span>
                  No check ran
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2 py-0.5 font-semibold text-[#107E3E]">
                  <span className="material-symbols-outlined text-[13px]">check</span>
                  No PayPal order
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2 py-0.5 font-semibold text-[#107E3E]">
                  <span className="material-symbols-outlined text-[13px]">check</span>
                  Nothing charged
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Your text was kept
            </h2>
            <span className="inline-flex items-center gap-1 font-body-sm text-body-sm text-[#107E3E]">
              <span className="material-symbols-outlined text-[16px]">save</span>
              Recoverable — nothing was lost
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] p-3">
              <p className="mb-1 flex items-center gap-1 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                <span className="material-symbols-outlined text-[14px] text-primary">
                  record_voice_over
                </span>
                Your intent
              </p>
              <p className="font-code-md text-[12px] leading-relaxed text-on-surface">
                {INTENT_TEXT}
              </p>
            </div>
            <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-3">
              <p className="mb-1 flex items-center gap-1 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-[#B45309]">
                <span className="material-symbols-outlined text-[14px]">request_quote</span>
                Payment request · unreadable
              </p>
              <p className="font-code-md text-[12px] leading-relaxed text-on-surface">
                {REQUEST_TEXT}
              </p>
              <p className="mt-1.5 font-body-sm text-body-sm text-[#92400E]">
                Missing: invoice amount, currency and a verifiable merchant name.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 font-headline-sm text-headline-sm font-semibold text-on-surface">
            Pick a recovery path
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {RECOVERY.map((option) => (
              <button
                key={option.title}
                type="button"
                onClick={() => router.push(option.href)}
                className={`flex h-full flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors ${
                  option.primary
                    ? "border-[#A7F3D0] bg-[#F3FBF7] hover:bg-[#EAF7F1]"
                    : "border-[#DFE5E8] bg-white hover:bg-[#F7F8FA]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    option.primary
                      ? "bg-primary-container text-white"
                      : "bg-[#F7F8FA] text-secondary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {option.icon}
                  </span>
                </span>
                <span className="font-label-md text-label-md font-bold text-on-surface">
                  {option.title}
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  {option.detail}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/new-check"
              className="inline-flex min-h-[44px] items-center gap-1.5 font-label-md text-label-md font-semibold text-secondary hover:text-primary"
            >
              <span className="material-symbols-outlined text-[17px]">edit</span>
              Edit both sources instead
            </Link>
            <button
              type="button"
              onClick={() => router.push("/checks/chk_demo_204")}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-primary"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              Retry the AI check
            </button>
          </div>
        </section>

        <div className="flex items-start gap-2 rounded-xl border border-[#DFE5E8] bg-surface-container-low/70 px-4 py-3">
          <span className="material-symbols-outlined text-[18px] text-secondary">policy</span>
          <p className="font-body-sm text-body-sm text-on-surface">
            The failure was written to the audit log as{" "}
            <span className="font-code-sm text-[11px] font-semibold text-primary">
              AI_PARSE_FAILED
            </span>
            . Retrying creates a new event on the same attempt.
          </p>
        </div>
      </div>
    </FlowPageLayout>
  );
}
