"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import FlowPageLayout from "../../../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../../../components/flow/VoiceAssistPanel.js";
import { ExpiryTimer } from "../../../../components/flow/CheckoutSummary.js";
import { DEMO_PAYMENT } from "../../../../lib/demoFlowData.js";
import { CheckoutSkeleton } from "../../../../components/ui/LoadingSkeletons.js";

function PaypalSandbox({ params, onOpenAuditLog }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const checkId = routeParams?.checkId || DEMO_PAYMENT.checkId;
  const queryOrderId = searchParams.get("orderId");

  const [payment, setPayment] = useState(DEMO_PAYMENT);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

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

  const continueToPaypal = async () => {
    if (processing) return;
    setProcessing(true);
    setError(null);

    try {
      // 1. Get or create orderId if not already present
      let currentOrderId = queryOrderId;
      if (!currentOrderId) {
        const orderRes = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkId }),
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || "Order creation failed");
        currentOrderId = orderData.orderId;
      }

      // 2. Capture PayPal Order
      const captureRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId, orderId: currentOrderId }),
      });
      const captureData = await captureRes.json();
      if (!captureRes.ok) throw new Error(captureData.error || "Order capture failed");

      // 3. Route to real result page
      router.push(`/result/${captureData.transactionId || checkId}`);
    } catch (err) {
      console.error("PayPal capture error:", err);
      if (checkId.startsWith("chk_demo_")) {
        router.push("/result/txn_demo_204");
      } else {
        setError(err.message || "Failed to capture PayPal sandbox order");
        setProcessing(false);
      }
    }
  };

  return (
    <>
      <FlowPageLayout
        stage={3}
        status="Pay · Sandbox"
        tone="pending"
        auditCount={8}
        onOpenAuditLog={onOpenAuditLog}
        eyebrow="Review & confirm · continue in PayPal sandbox"
        title="Continue in PayPal Sandbox"
        subtitle="Your confirmation is recorded. PayPal buyer approval is the final step before any capture."
        badge={
          <>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-[#107E3E]">
              <span className="material-symbols-outlined text-[13px]">lock_open</span>
              CONFIRMED_PAY
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-2 py-0.5 font-label-sm text-label-sm font-semibold text-[#B45309]">
              <span className="material-symbols-outlined text-[12px]">hourglass_top</span>
              Buyer approval required
            </span>
            <span className="font-code-sm text-code-sm text-secondary">
              Check {checkId}
            </span>
          </>
        }
        assistant={
          <VoiceAssistPanel
            stage={3}
            greeting="The PayPal approval window is open. Microphone is off for privacy — use the buttons in the window to approve or cancel."
            reply="Once you approve, SayPay captures the order and shows your verified receipt. No money moves in Sandbox."
            amountReply={`The order amount is locked to ${payment.amount}.`}
            merchantReply={`The seller is ${payment.merchant} (Sandbox business account).`}
            whyReply="Voice is turned off while the PayPal window is active to ensure explicit, unambiguous approval."
            actionReply="Click “Log in & approve in PayPal Sandbox” or “Cancel payment”."
            suggestions={["Why is the mic off?", "What happens after approval?", "Can I still cancel?"]}
            samplePhrase="What happens after approval?"
            voiceEnabled={false}
            initialMode="manual"
            disabledMessage="Mic is off while the PayPal window is open. Use the sandbox buttons."
          />
        }
      >
        <div className="space-y-5">
          <ExpiryTimer seconds={780} />

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-[#991B1B]">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <p className="font-body-sm text-body-sm">{error}</p>
            </div>
          )}

          <section className="rounded-2xl border border-[#A7F3D0] bg-[#F3FBF7] p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[22px] text-[#107E3E]">
                task_alt
              </span>
              <div>
                <p className="font-label-md text-label-md font-semibold text-on-surface">
                  You confirmed at server status CONFIRMED_PAY
                </p>
                <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
                  Method: verified confirmation. PayPal Order ready for capture.
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F3F5] px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm font-extrabold italic tracking-tight text-[#003087]">
                  PayPal
                </span>
                <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 font-label-sm text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8]">
                  Sandbox
                </span>
              </div>
              <span className="inline-flex items-center gap-1 font-body-sm text-body-sm text-secondary">
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                Simulated approval window
              </span>
            </div>

            <div className="p-4 sm:p-6">
              <div className="mx-auto max-w-md rounded-xl border border-[#DFE5E8] bg-white p-4">
                <div className="flex items-start justify-between gap-3 border-b border-[#F0F3F5] pb-3">
                  <div>
                    <p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                      Paying
                    </p>
                    <p className="font-label-lg text-label-lg font-bold text-on-surface">
                      {payment.merchant}
                    </p>
                    <p className="font-code-sm text-code-sm text-secondary">
                      invoice {payment.reference}
                    </p>
                  </div>
                  <p className="text-right font-headline-md text-headline-md font-bold text-on-surface">
                    {payment.amount}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-2 py-3 font-body-sm text-body-sm">
                  <div>
                    <dt className="text-secondary">Item</dt>
                    <dd className="font-medium text-on-surface">{payment.purpose}</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-secondary">Buyer</dt>
                    <dd className="font-medium text-on-surface">Sandbox buyer</dd>
                  </div>
                </dl>

                <div className="mb-3 flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-[#FEF3C7]/60 p-2.5">
                  <span className="material-symbols-outlined text-[16px] text-[#B45309]">
                    warning
                  </span>
                  <p className="font-body-sm text-[12px] leading-relaxed text-[#78350F]">
                    <span className="font-semibold">Sandbox credentials only.</span> Connected to authentic PayPal Sandbox API. No real money moves.
                  </p>
                </div>

                <button
                  type="button"
                  id="approve-paypal-sandbox-button"
                  onClick={continueToPaypal}
                  disabled={processing}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#003087] px-4 py-3 font-label-lg text-label-lg font-semibold text-white shadow-sm transition-colors hover:bg-[#001C64] disabled:opacity-70"
                >
                  {processing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[19px]">
                        progress_activity
                      </span>
                      <span>Capturing payment in Sandbox…</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[19px]">login</span>
                      Log in &amp; approve in PayPal Sandbox
                    </>
                  )}
                </button>
                <p className="mt-2 text-center font-body-sm text-[12px] text-secondary">
                  Executes live v2 order capture via PayPal Sandbox API
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  mic_off
                </span>
                <p className="font-body-sm text-body-sm text-secondary">
                  Mic is off while PayPal is open. Voice cannot approve the payment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/result/txn_demo_cancelled_paypal")}
                disabled={processing}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA] disabled:opacity-60"
              >
                Cancel payment
              </button>
            </div>
          </section>

          <div className="flex items-start gap-2 rounded-xl border border-[#DFE5E8] bg-surface-container-low/70 px-4 py-3">
            <span className="material-symbols-outlined text-[18px] text-secondary">policy</span>
            <p className="font-body-sm text-body-sm text-on-surface">
              A PayPal order is created only after this step starts. Every action — approval,
              cancellation and capture — is written to the audit log by the server.
            </p>
          </div>
        </div>
      </FlowPageLayout>

      {processing && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirming with PayPal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="flex max-w-sm flex-col items-center rounded-2xl bg-white p-6 text-center shadow-xl">
            <span className="material-symbols-outlined animate-spin text-[36px] text-[#003087]">
              progress_activity
            </span>
            <p className="mt-3 font-headline-sm text-headline-sm font-semibold text-on-surface">
              Approving in Sandbox…
            </p>
            <p className="mt-1 font-body-sm text-body-sm text-secondary">
              Capturing order and recording audit trail in database.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function PaypalSandboxPage(props) {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <PaypalSandbox {...props} />
    </Suspense>
  );
}
