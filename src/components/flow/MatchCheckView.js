"use client";

import React from "react";
import Link from "next/link";
import FlowPageLayout from "./FlowPageLayout.js";
import VoiceAssistPanel from "./VoiceAssistPanel.js";
import MatchCheckContent from "./MatchCheckContent.js";
import { TONE } from "../../lib/demoFlowData.js";

const ASSIST_COPY = {
  CLEAR: {
    greeting:
      "I compared both sources. The merchant, amount, currency and reference all match. This check is clear to review.",
    reply:
      "This check is clear. Nothing is charged until you continue to review, confirm, and approve in PayPal.",
    amountReply:
      "The payment request asks for USD 12.50 and you said USD 12.50. There is no amount difference.",
    merchantReply:
      "The request says GreenLeaf Demo Store, and that is an approved merchant in this demo workspace.",
    whyReply:
      "All four fields match and the security rules passed. The check is clear, so review is unlocked.",
    actionReply:
      "Continue to review when you are ready. You will still confirm by voice or button before PayPal opens.",
    suggestions: [
      "Why is this clear?",
      "Check the amount",
      "What happens next?",
    ],
  },
  REVIEW: {
    greeting:
      "I found two things that need your attention: the recipient name differs slightly and the invoice reference was not in your intent.",
    reply:
      "Nothing has been paid. Fix the recipient name or add the reference, then re-run the check.",
    amountReply:
      "The amount matches at USD 125.00. The review is about the recipient alias and the missing reference, not the amount.",
    merchantReply:
      "You said “Aura Cloud Services” but the request says “Aura Cloud Hosting LLC”. Confirm they are the same payee before continuing.",
    whyReply:
      "This is a REVIEW because the merchant alias differs and reference AC-901 is missing. Hard rules did not block it, but checkout is locked until you fix the details.",
    actionReply:
      "Edit your intent, add the reference, and re-run the check. There is no Continue button on a REVIEW result.",
    suggestions: [
      "Why was this flagged?",
      "Check the recipient",
      "What should I fix?",
    ],
  },
  BLOCKED: {
    greeting:
      "I stopped this payment. The merchant is not approved, the amount is much higher than you intended, and the reference was already paid.",
    reply:
      "No PayPal order was created and nothing was charged. Correct the details and start a new check.",
    amountReply:
      "You intended USD 50.00 but the request asks for USD 500.00. That is USD 450.00 more.",
    merchantReply:
      "Untrusted Escrow Node 7 is not on the approved merchant allowlist, so the payment is blocked.",
    whyReply:
      "This is BLOCKED because of three hard failures: unapproved merchant, amount mismatch of USD 450.00, and reference ESC-312 already paid.",
    actionReply:
      "There is no continue path for a blocked check. Correct the recipient, amount and reference, then re-run the safety check.",
    suggestions: [
      "Why was this blocked?",
      "Check the amount",
      "Who is the merchant?",
    ],
  },
  HISTORICAL: {
    greeting:
      "This is a historical check opened from History. It is read-only, but I can explain what happened.",
    reply:
      "The check passed on 23 May 2024. The payment was cancelled by voice at confirmation, so no PayPal order was created.",
    amountReply:
      "The historical amount was USD 34.00 to Artisan Roast Roastery for reference AR-118.",
    merchantReply:
      "The merchant was Artisan Roast Roastery, an approved demo merchant at the time of this check.",
    whyReply:
      "The safety check was CLEAR. The attempt ended because the user cancelled at confirmation.",
    actionReply:
      "You cannot continue an archived check. Use “Run a similar check” to start a fresh attempt.",
    suggestions: [
      "What happened here?",
      "Why was it cancelled?",
      "Can I continue it?",
    ],
  },
};

export default function MatchCheckView({ state, onOpenAuditLog }) {
  const tone = TONE[state.tone] || TONE.clear;
  const copy = ASSIST_COPY[state.key] || ASSIST_COPY.CLEAR;

  const scrollToWhy = () => {
    if (typeof document === "undefined") return;
    document
      .getElementById("why-this-result")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const badge = (
    <>
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-bold ${tone.chip}`}
      >
        <span className="material-symbols-outlined text-[13px]">
          {state.icon || tone.icon}
        </span>
        {state.statusLabel}
      </span>
      <span className="font-code-sm text-code-sm text-secondary">
        Check {state.checkId}
      </span>
      {state.readOnly && (
        <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-2 py-0.5 font-label-sm text-label-sm text-secondary">
          <span className="material-symbols-outlined text-[12px]">lock</span>
          Historical read-only
        </span>
      )}
    </>
  );

  const actions = state.readOnly ? (
    <Link
      href="/history"
      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-3 py-2 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
    >
      <span className="material-symbols-outlined text-[17px]">arrow_back</span>
      Back to history
    </Link>
  ) : null;

  return (
    <FlowPageLayout
      stage={2}
      status={state.readOnly ? "Historical" : state.statusLabel}
      tone={state.tone}
      auditCount={state.auditCount}
      onOpenAuditLog={onOpenAuditLog}
      eyebrow="AI match & safety check"
      title={state.title}
      subtitle={state.tagline}
      badge={badge}
      actions={actions}
      assistant={
        <VoiceAssistPanel
          stage={2}
          greeting={copy.greeting}
          reply={copy.reply}
          amountReply={copy.amountReply}
          merchantReply={copy.merchantReply}
          whyReply={copy.whyReply}
          actionReply={copy.actionReply}
          suggestions={copy.suggestions}
          samplePhrase={copy.suggestions[0]}
          voiceEnabled={!state.readOnly}
          disabledMessage="Voice is paused for archived records. Use the text box to ask about this check."
          initialMode={state.readOnly ? "manual" : "voice"}
        />
      }
    >
      <MatchCheckContent
        state={state}
        onOpenAuditLog={onOpenAuditLog}
        onOpenWhy={scrollToWhy}
      />
    </FlowPageLayout>
  );
}
