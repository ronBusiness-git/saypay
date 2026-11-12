"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import FlowPageLayout from "../../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../../components/flow/VoiceAssistPanel.js";
import EchoAvatar from "../../../components/EchoAvatar.js";
import {
  DEMO_PAYMENT,
  RESULT_ROUTES,
  TONE,
  resultStateForId,
} from "../../../lib/demoFlowData.js";
import { ResultSkeleton } from "../../../components/ui/LoadingSkeletons.js";

const ASSIST_COPY = {
  completed: {
    greeting:
      "The server verified the PayPal capture. USD 12.50 to GreenLeaf Demo Store is complete in Sandbox.",
    reply:
      "This receipt was shown only after the backend verified the capture. No real money moved.",
    suggestions: ["Read the outcome", "Where is the audit log?", "What happens now?"],
  },
  pending: {
    greeting:
      "PayPal approved the payment, but the capture is still being verified by the server. Do not pay again.",
    reply:
      "SayPay checks the capture for up to 30 seconds. Refresh the status or open History while you wait.",
    suggestions: ["Why is it pending?", "Should I pay again?", "Where is the receipt?"],
  },
  cancelled_confirm: {
    greeting:
      "You cancelled at the confirmation step, so no PayPal order was created and nothing was paid.",
    reply:
      "This attempt stays in your audit log. You can start a new check with the same details whenever you are ready.",
    suggestions: ["Was anything charged?", "Can I restart?", "Show the audit log"],
  },
  failed: {
    greeting:
      "The payment failed during capture. No money moved and no receipt was issued.",
    reply:
      "The failure is recorded for reconciliation. Start a new check to try again with the same details.",
    suggestions: ["Why did it fail?", "Was I charged?", "Start a new check"],
  },
  cancelled_paypal: {
    greeting:
      "The PayPal approval window was closed before the buyer approved the payment, so nothing was captured.",
    reply:
      "No receipt was issued. You can start a new check with the same details when you are ready.",
    suggestions: ["Was anything charged?", "Can I try again?", "Show the audit log"],
  },
};

const AUDIT_EVENTS = {
  completed: [
    { time: "14:31:52", event: "INTENT_CAPTURED", actor: "You", method: "Voice" },
    { time: "14:31:58", event: "REQUEST_SUBMITTED", actor: "SayPay" },
    { time: "14:32:03", event: "SCREENING_RESULT", actor: "SayPay", detail: "CLEAR" },
    { time: "14:32:08", event: "REVIEW_OPENED", actor: "You" },
    { time: "14:32:20", event: "CONFIRM_PROMPTED", actor: "SayPay" },
    { time: "14:32:26", event: "CONFIRMED_PAY", actor: "You", method: "Voice", detail: "heard “pay now”" },
    { time: "14:32:31", event: "ORDER_CREATED", actor: "PayPal", detail: "ORDER-DEMO-204" },
    { time: "14:32:44", event: "BUYER_APPROVED", actor: "PayPal" },
    { time: "14:32:51", event: "CAPTURE_RESULT", actor: "SayPay", detail: "Verified" },
    { time: "14:32:52", event: "RECEIPT_ISSUED", actor: "SayPay", detail: "COMPLETED" },
  ],
  pending: [
    { time: "14:31:52", event: "INTENT_CAPTURED", actor: "You", method: "Voice" },
    { time: "14:32:03", event: "SCREENING_RESULT", actor: "SayPay", detail: "CLEAR" },
    { time: "14:32:26", event: "CONFIRMED_PAY", actor: "You", method: "Voice" },
    { time: "14:32:31", event: "ORDER_CREATED", actor: "PayPal", detail: "ORDER-DEMO-205" },
    { time: "14:32:44", event: "BUYER_APPROVED", actor: "PayPal" },
    { time: "14:32:45", event: "CAPTURE_PENDING", actor: "SayPay", detail: "Awaiting capture verification" },
  ],
  cancelled_confirm: [
    { time: "10:02:11", event: "INTENT_CAPTURED", actor: "You", method: "Voice" },
    { time: "10:02:19", event: "SCREENING_RESULT", actor: "SayPay", detail: "CLEAR" },
    { time: "10:02:25", event: "REVIEW_OPENED", actor: "You" },
    { time: "10:02:38", event: "CONFIRM_PROMPTED", actor: "SayPay" },
    { time: "10:02:46", event: "CANCELLED_BY_USER", actor: "You", method: "Voice", detail: "heard “cancel”" },
  ],
  failed: [
    { time: "09:14:03", event: "INTENT_CAPTURED", actor: "You", method: "Typed" },
    { time: "09:14:10", event: "SCREENING_RESULT", actor: "SayPay", detail: "CLEAR" },
    { time: "09:14:22", event: "CONFIRMED_PAY", actor: "You", method: "Button" },
    { time: "09:14:27", event: "ORDER_CREATED", actor: "PayPal", detail: "ORDER-DEMO-203" },
    { time: "09:14:39", event: "BUYER_APPROVED", actor: "PayPal" },
    { time: "09:14:52", event: "CAPTURE_RESULT", actor: "SayPay", detail: "FAILED · capture declined" },
  ],
  cancelled_paypal: [
    { time: "08:40:12", event: "INTENT_CAPTURED", actor: "You", method: "Voice" },
    { time: "08:40:20", event: "SCREENING_RESULT", actor: "SayPay", detail: "CLEAR" },
    { time: "08:40:35", event: "CONFIRMED_PAY", actor: "You", method: "Voice" },
    { time: "08:40:39", event: "ORDER_CREATED", actor: "PayPal", detail: "ORDER-DEMO-202" },
    { time: "08:41:02", event: "PAYPAL_CANCELLED", actor: "PayPal", detail: "Buyer closed approval window" },
  ],
};

const ACTOR_STYLE = {
  You: "border-[#A7F3D0] bg-[#EAF7F1] text-[#107E3E]",
  SayPay: "border-[#DFE5E8] bg-[#F7F8FA] text-primary",
  PayPal: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
};

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-xl border border-[#F0F3F5] bg-[#F7F8FA] p-3">
      <p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
        {label}
      </p>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <span className="truncate font-code-md text-[12px] font-semibold text-on-surface">
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          title={`Copy ${label}`}
          className="shrink-0 rounded p-1 text-secondary hover:text-primary"
        >
          <span className="material-symbols-outlined text-[15px]">
            {copied ? "done" : "content_copy"}
          </span>
        </button>
      </div>
    </div>
  );
}

function ResultView({ params, onOpenAuditLog }) {
  const routeParams = useParams();
  const transactionId = routeParams?.transactionId || DEMO_PAYMENT.transactionId;
  const state = resultStateForId(transactionId);
  const tone = TONE[state.tone];
  const events = AUDIT_EVENTS[state.key] || AUDIT_EVENTS.completed;
  const copy = ASSIST_COPY[state.key] || ASSIST_COPY.completed;
  const voiceEnabled = state.key !== "pending";

  const [liveTx, setLiveTx] = React.useState(null);

  React.useEffect(() => {
    if (!transactionId || transactionId.startsWith("txn_demo_")) return;

    fetch(`/api/transactions/${encodeURIComponent(transactionId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.transaction) {
          setLiveTx(data);
        }
      })
      .catch(() => {});
  }, [transactionId]);

  const paymentData = liveTx?.receipt ? {
    merchant: liveTx.transaction.merchantKey || DEMO_PAYMENT.merchant,
    merchantInitials: (liveTx.transaction.merchantKey || "GL").slice(0, 2).toUpperCase(),
    merchantId: liveTx.transaction.merchantKey || DEMO_PAYMENT.merchantId,
    reference: liveTx.receipt.reference || DEMO_PAYMENT.reference,
    purpose: liveTx.checkSnapshot?.intent?.purpose || DEMO_PAYMENT.purpose,
    amount: `${liveTx.receipt.currency} ${liveTx.receipt.amountFormatted}`,
    orderId: liveTx.receipt.paypalOrderId || DEMO_PAYMENT.orderId,
    captureId: liveTx.receipt.captureId || DEMO_PAYMENT.captureId,
    confirmedAt: new Date(liveTx.receipt.paidAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    confirmationMethod: "Voice / Sandbox Button",
    checkId: liveTx.transaction.checkId || DEMO_PAYMENT.checkId,
  } : DEMO_PAYMENT;

  const primaryHref = state.primaryAction.href;

  return (
    <FlowPageLayout
      stage={4}
      status={state.statusLabel}
      tone={state.tone}
      auditCount={events.length}
      onOpenAuditLog={onOpenAuditLog}
      eyebrow="Result · receipt + log"
      title={state.heroTitle}
      subtitle={state.heroLine}
      badge={
        <>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-bold ${tone.chip}`}
          >
            <span className="material-symbols-outlined text-[13px]">{state.icon}</span>
            {state.statusLabel}
          </span>
          <span className="font-code-sm text-code-sm text-secondary">
            Transaction {transactionId}
          </span>
        </>
      }
      actions={
        <Link
          href="/history"
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-3 py-2 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
        >
          <span className="material-symbols-outlined text-[17px]">history</span>
          History
        </Link>
      }
      assistant={
        <VoiceAssistPanel
          stage={4}
          greeting={copy.greeting}
          reply={copy.reply}
          suggestions={copy.suggestions}
          samplePhrase={copy.suggestions[0]}
          voiceEnabled={voiceEnabled}
          initialMode={voiceEnabled ? "voice" : "manual"}
          disabledMessage="The outcome is still being verified. I can explain it in text, but I will not read a final status aloud yet."
        />
      }
    >
      <div className="space-y-5">
        {/* Status hero */}
        <section className={`rounded-2xl border-2 p-4 shadow-sm sm:p-6 ${tone.hero}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${tone.bg} ${tone.border} ${tone.text}`}
              >
                <span
                  className="material-symbols-outlined text-[26px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {state.icon}
                </span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-bold tracking-wider ${tone.chip}`}
                >
                  {state.statusLabel}
                </span>
                <h2 className={`mt-1 font-headline-md text-headline-md ${tone.text}`}>
                  {state.heroTitle}
                </h2>
                <p className="mt-1 font-body-md text-body-md text-on-surface/80">
                  {state.heroLine}
                </p>
                <p className="mt-1.5 font-body-sm text-body-sm text-secondary">{state.subline}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={readAloud}
              disabled={!voiceEnabled}
              className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-[10px] border bg-white px-3 py-2 font-label-md text-label-md font-semibold transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50 ${tone.text} ${tone.border}`}
            >
              <span className={`h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ${tone.border}`}>
                <EchoAvatar sizes="20px" />
              </span>
              Read aloud
            </button>
          </div>

          {state.key === "pending" && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#BFDBFE] bg-white/80 px-3.5 py-2.5">
              <span className="material-symbols-outlined animate-spin text-[18px] text-[#1D4ED8]">
                progress_activity
              </span>
              <p className="font-body-sm text-body-sm font-medium text-on-surface">
                Verifying the capture with PayPal · auto-refresh runs for up to 30 seconds.{" "}
                <span className="font-semibold">Do not pay again.</span>
              </p>
            </div>
          )}
        </section>

        {/* Receipt or attempt summary */}
        {state.showReceipt ? (
          <section className="overflow-hidden rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F3F5] px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  receipt_long
                </span>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Receipt
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2 py-0.5 font-label-sm text-[10px] font-bold text-[#107E3E]">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Verified by server
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#A7F3D0] bg-[#EAF7F1] font-label-lg text-label-lg font-bold text-primary-container">
                    {paymentData.merchantInitials}
                  </span>
                  <div>
                    <p className="font-label-lg text-label-lg font-bold text-on-surface">
                      {paymentData.merchant}
                    </p>
                    <p className="font-code-sm text-code-sm text-secondary">
                      {paymentData.merchantId} · invoice {paymentData.reference}
                    </p>
                    <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
                      {paymentData.purpose}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="font-headline-lg text-headline-lg font-bold text-[#107E3E]">
                    {paymentData.amount}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2 py-0.5 font-label-sm text-[10px] font-bold text-[#107E3E]">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    COMPLETED
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <CopyField label="PayPal order ID" value={paymentData.orderId} />
                <CopyField label="Capture ID" value={paymentData.captureId} />
                <CopyField label="Confirmed at" value={paymentData.confirmedAt} />
                <CopyField label="Confirmation method" value={paymentData.confirmationMethod} />
              </div>

              <div className="mt-3 flex flex-col gap-2 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-body-sm text-body-sm text-secondary">
                  Issued only after the server verified the PayPal capture.
                </p>
                <Link
                  href={`/checks/${DEMO_PAYMENT.checkId}`}
                  className="inline-flex items-center gap-1 self-start font-label-md text-label-md font-semibold text-primary hover:underline sm:self-auto"
                >
                  View originating check
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">
                summarize
              </span>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Attempt summary
              </h2>
              <span className="rounded-full border border-[#DFE5E8] bg-[#F7F8FA] px-2 py-0.5 font-label-sm text-[10px] font-semibold text-secondary">
                {state.key === "pending" ? "No receipt yet" : "No receipt issued"}
              </span>
            </div>
            <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="rounded-xl border border-[#F0F3F5] bg-[#F7F8FA] p-3">
                <dt className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  Merchant
                </dt>
                <dd className="font-body-md text-body-md font-semibold text-on-surface">
                  {DEMO_PAYMENT.merchant}
                </dd>
              </div>
              <div className="rounded-xl border border-[#F0F3F5] bg-[#F7F8FA] p-3">
                <dt className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  Amount
                </dt>
                <dd className="font-code-md text-[12px] font-semibold text-on-surface">
                  {DEMO_PAYMENT.amount} · {DEMO_PAYMENT.reference}
                </dd>
              </div>
              <div className="rounded-xl border border-[#F0F3F5] bg-[#F7F8FA] p-3">
                <dt className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  Final status
                </dt>
                <dd className="font-body-md text-body-md font-semibold text-on-surface">
                  {state.statusLabel}
                </dd>
              </div>
              <div className="rounded-xl border border-[#F0F3F5] bg-[#F7F8FA] p-3">
                <dt className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  Originating check
                </dt>
                <dd>
                  <Link
                    href={`/checks/${DEMO_PAYMENT.checkId}`}
                    className="inline-flex items-center gap-1 font-code-md text-[12px] font-semibold text-primary hover:underline"
                  >
                    {DEMO_PAYMENT.checkId}
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </Link>
                </dd>
              </div>
            </dl>
            <p className="mt-3 font-body-sm text-body-sm text-secondary">
              {state.key === "pending"
                ? "Receipt data appears only after capture verification completes."
                : "No money moved. This attempt is kept in the audit log, not as a receipt."}
            </p>
          </section>
        )}

        {/* Audit log */}
        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">
                history_edu
              </span>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Audit log
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-body-sm text-body-sm text-secondary">
                {events.length} events · immutable
              </span>
              <button
                type="button"
                onClick={onOpenAuditLog}
                className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary hover:underline"
              >
                Open full log
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </button>
            </div>
          </div>

          <ol className="relative space-y-3 border-l border-[#E5E7EB] pl-4">
            {events.map((event, index) => {
              const isLast = index === events.length - 1;
              return (
                <li key={`${event.time}-${event.event}`} className="relative">
                  <span
                    className={`absolute -left-[21px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white ${
                      isLast ? tone.solid : "bg-[#B8C2CC]"
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-code-sm text-[11px] text-secondary">{event.time}</span>
                    <span className="font-code-sm text-[11px] font-semibold text-on-surface">
                      {event.event}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-label-sm text-[10px] font-semibold ${ACTOR_STYLE[event.actor] || ACTOR_STYLE.SayPay}`}
                    >
                      {event.actor}
                    </span>
                    {event.method && (
                      <span className="rounded-full border border-[#DFE5E8] bg-white px-2 py-0.5 font-label-sm text-[10px] text-secondary">
                        {event.method}
                      </span>
                    )}
                  </div>
                  {event.detail && (
                    <p className="mt-0.5 font-body-sm text-[12px] text-secondary">{event.detail}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Actions */}
        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {state.secondaryActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
              >
                <span className="material-symbols-outlined text-[17px]">{action.icon}</span>
                {action.label}
              </Link>
            ))}
            {primaryHref ? (
              <Link
                href={primaryHref}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-primary"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {state.primaryAction.icon}
                </span>
                {state.primaryAction.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-primary"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {state.primaryAction.icon}
                </span>
                {state.primaryAction.label}
              </button>
            )}
          </div>
        </section>

        {/* Demo state switcher */}
        <section className="rounded-xl border border-dashed border-[#DFE5E8] bg-white/60 p-3">
          <p className="mb-2 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
            Demo · result states
          </p>
          <div className="flex flex-wrap gap-1.5">
            {RESULT_ROUTES.map((route) => (
              <Link
                key={route.id}
                href={`/result/${route.id}`}
                className={`rounded-full border px-2.5 py-1 font-label-sm text-label-sm transition-colors ${
                  route.id === transactionId
                    ? "border-primary-container bg-[#EAF7F1] font-semibold text-primary"
                    : "border-[#DFE5E8] bg-white text-secondary hover:text-on-surface"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </FlowPageLayout>
  );
}

export default function ResultPage(props) {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <ResultView {...props} />
    </Suspense>
  );
}
