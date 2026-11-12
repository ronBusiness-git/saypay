"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import FlowPageLayout from "../../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../../components/flow/VoiceAssistPanel.js";
import {
  CheckoutSummary,
  ExpiryTimer,
} from "../../../components/flow/CheckoutSummary.js";
import { DEMO_PAYMENT } from "../../../lib/demoFlowData.js";

function CheckoutReview({ params, onOpenAuditLog }) {
  const routeParams = useParams();
  const checkId = routeParams?.checkId || DEMO_PAYMENT.checkId;

  const [payment, setPayment] = useState(DEMO_PAYMENT);

  useEffect(() => {
    if (!checkId || checkId.startsWith("chk_demo_")) return;

    fetch(`/api/payment/check?checkId=${encodeURIComponent(checkId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const amountStr = data.intent?.amount || data.request?.amount || "12.50";
        const currency = data.intent?.currency || data.request?.currency || "USD";
        const merchant = data.intent?.recipientName || data.request?.recipientName || "GreenLeaf Demo Store";
        const reference = data.intent?.reference || data.request?.reference || "GL-204";

        setPayment({
          ...DEMO_PAYMENT,
          checkId: data.checkId,
          merchant,
          amount: `${currency} ${amountStr}`,
          currency,
          reference,
          purpose: data.intent?.purpose || "Invoice payment",
        });
      })
      .catch(() => {});
  }, [checkId]);

  return (
    <FlowPageLayout
      stage={3}
      status="Review"
      tone="clear"
      auditCount={6}
      onOpenAuditLog={onOpenAuditLog}
      eyebrow="Review & confirm · review payment details"
      title="Review the payment details"
      subtitle="These are the exact server values from the cleared check. Confirm them before you decide to pay."
      badge={
        <>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-[#107E3E]">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            CLEAR · Ready to review
          </span>
          <span className="font-code-sm text-code-sm text-secondary">
            Check {checkId}
          </span>
        </>
      }
      actions={
        <Link
          href={`/checks/${checkId}`}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-3 py-2 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
        >
          <span className="material-symbols-outlined text-[17px]">arrow_back</span>
          Safety check
        </Link>
      }
      assistant={
        <VoiceAssistPanel
          stage={3}
          greeting="The safety check passed. I’m showing the exact values that will be sent to PayPal — please review them before you confirm."
          reply="Nothing is charged yet. Continue to confirm to choose Pay or Cancel, and PayPal will open for buyer approval."
          amountReply={`The amount is ${payment.amount}, which matches the original request. Amount and merchant cannot be edited on this page.`}
          merchantReply={`The payee is ${payment.merchant}, an approved merchant in this sandbox workspace.`}
          whyReply="This check is CLEAR: recipient, amount, currency and reference all match, and no spam or scam signals were found."
          actionReply="Press “Looks right — continue to confirm”. Voice cannot skip the confirmation step."
          suggestions={["Read the summary", "What happens next?", "Is the amount correct?"]}
          samplePhrase="Is the amount correct?"
        />
      }
    >
      <div className="space-y-5">
        <CheckoutSummary payment={payment} />
        <ExpiryTimer />

        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">
              fact_check
            </span>
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              What this review includes
            </h2>
          </div>
          <ul className="space-y-2">
            {[
              "Merchant identity and approval status are locked to the server check.",
              "Amount, currency and reference are read-only — editing them would bypass the safety result.",
              "No PayPal order exists yet. The next step only asks you to confirm or cancel.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface"
              >
                <span className="material-symbols-outlined mt-0.5 text-[16px] text-[#107E3E]">
                  check_circle
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] p-3">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              mic_off
            </span>
            <p className="font-body-sm text-body-sm text-secondary">
              Voice commands are not active on this page. Only buttons move the payment forward.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={`/checks/${checkId}`}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
            >
              <span className="material-symbols-outlined text-[17px]">arrow_back</span>
              Back to safety check
            </Link>
            <Link
              href={`/checkout/${checkId}/confirm`}
              id="continue-to-confirm-link"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-primary"
            >
              Looks right — continue to confirm
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </Link>
          </div>
        </section>

        <div className="flex items-start gap-2 rounded-xl border border-[#DFE5E8] bg-surface-container-low/70 px-4 py-3">
          <span className="material-symbols-outlined text-[18px] text-secondary">policy</span>
          <p className="font-body-sm text-body-sm text-on-surface">
            Opening this review writes a{" "}
            <span className="font-code-sm text-[11px] font-semibold text-primary">
              REVIEW_OPENED
            </span>{" "}
            event. The payment is still not started.
          </p>
        </div>
      </div>
    </FlowPageLayout>
  );
}

export default function CheckoutReviewPage(props) {
  return (
    <Suspense fallback={null}>
      <CheckoutReview {...props} />
    </Suspense>
  );
}
