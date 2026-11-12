"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowPageLayout from "../../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../../components/flow/VoiceAssistPanel.js";
import EchoAvatar from "../../../components/EchoAvatar.js";

const CAPTURED = "Pay one hundred twenty five dollars to Aura Cloud Services.";
const AI_QUESTION =
  "I found the merchant and amount, but I need two things: which invoice reference should I use, and is “Aura Cloud Services” the same as the registered payee “Aura Cloud Hosting LLC”?";

const QUICK_ANSWERS = [
  "Aura Cloud Hosting LLC is the correct payee.",
  "The invoice reference is AC-901.",
  "Amount stays at USD 125.00.",
];

export default function NewCheckClarifyPage({ onOpenAuditLog }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");

  const appendAnswer = (text) => {
    setAnswer((current) => (current.trim() ? `${current.trim()} ${text}` : text));
  };

  return (
    <FlowPageLayout
      stage={1}
      status="Needs clarification"
      tone="review"
      auditCount={1}
      onOpenAuditLog={onOpenAuditLog}
      eyebrow="New payment check · clarification"
      title="One detail needs your answer"
      subtitle="SayPay understood most of your intent, but it will not guess. Answer the question and re-run the check."
      badge={
        <>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-[#B45309]">
            <span className="material-symbols-outlined text-[13px]">help</span>
            N2 · Clarification needed
          </span>
          <span className="font-code-sm text-code-sm text-secondary">
            No check has run yet
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
          greeting={AI_QUESTION}
          reply="Thanks — I will add that to your intent and re-run the match check. Nothing is ever guessed or auto-filled."
          amountReply="The amount is already captured at USD 125.00. I only need the invoice reference and confirmation of the payee name."
          merchantReply="Tell me whether the payee is “Aura Cloud Hosting LLC”. I will match it against the registered merchant record, not the shorter trading name."
          whyReply="I cannot proceed with an ambiguous reference or a mismatched payee name. I ask instead of guessing so the payment cannot be redirected."
          actionReply="Answer the question, then continue to re-run the safety check."
          suggestions={QUICK_ANSWERS}
          samplePhrase="The payee is Aura Cloud Hosting LLC and the invoice reference is AC-901."
          onTranscript={appendAnswer}
        />
      }
    >
      <div className="space-y-5">
        <section className="rounded-2xl border-2 border-[#FDE68A] bg-[#FFFBEB] p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]">
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  contact_support
                </span>
              </span>
              <div>
                <p className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-[#B45309]">
                  SayPay Assist asks
                </p>
                <p className="mt-1 font-body-md text-body-md font-medium leading-relaxed text-on-surface">
                  {AI_QUESTION}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={readQuestion}
              className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-[10px] border border-[#FDE68A] bg-white px-3 py-2 font-label-md text-label-md font-semibold text-[#B45309] hover:bg-[#FFFBEB]"
            >
              <span className="h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-[#FDE68A]">
                <EchoAvatar sizes="20px" />
              </span>
              Read aloud
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-[#FDE68A] bg-white p-3">
            <p className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
              What was captured
            </p>
            <p className="mt-1 font-code-md text-[12px] leading-relaxed text-on-surface">
              {CAPTURED}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Answer the question
            </h2>
            <span className="font-body-sm text-body-sm text-secondary">
              Voice or typed · both are appended to your intent
            </span>
          </div>

          <div className="mb-2 flex flex-wrap gap-1.5">
            {QUICK_ANSWERS.map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => appendAnswer(quick)}
                className="rounded-full border border-[#DFE5E8] bg-white px-2.5 py-1 font-label-sm text-label-sm text-secondary hover:border-[#A7F3D0] hover:bg-[#EAF7F1] hover:text-primary transition-colors"
              >
                {quick}
              </button>
            ))}
          </div>

          <label
            htmlFor="clarify-answer"
            className="mb-1.5 block font-label-md text-label-md font-semibold text-on-surface"
          >
            Your answer
          </label>
          <textarea
            id="clarify-answer"
            rows={3}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="e.g. The payee is Aura Cloud Hosting LLC and the reference is AC-901."
            className="w-full resize-none rounded-[10px] border border-[#DFE5E8] bg-white p-3 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-[#EAF7F1]"
          />

          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/new-check/listening"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-3 py-2 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
              >
                <span className="material-symbols-outlined text-[17px]">mic</span>
                Answer by voice
              </Link>
              <Link
                href="/new-check"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] px-2 py-2 font-label-md text-label-md font-semibold text-secondary hover:text-primary"
              >
                Type a new intent instead
              </Link>
            </div>
            <button
              type="button"
              onClick={() => router.push("/checks/chk_demo_205")}
              disabled={!answer.trim()}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-primary disabled:cursor-not-allowed disabled:bg-[#DFE5E8] disabled:text-[#586672]"
            >
              Save answer &amp; re-check
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </button>
          </div>
        </section>

        <div className="flex items-start gap-2 rounded-xl border border-[#DFE5E8] bg-surface-container-low/70 px-4 py-3">
          <span className="material-symbols-outlined text-[18px] text-secondary">policy</span>
          <p className="font-body-sm text-body-sm text-on-surface">
            Your original transcript is kept. The AI question and your answer are written to the
            audit log. No PayPal order exists at this stage.
          </p>
        </div>
      </div>
    </FlowPageLayout>
  );
}
