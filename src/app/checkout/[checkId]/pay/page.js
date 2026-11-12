"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FlowPageLayout from "../../../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../../../components/flow/VoiceAssistPanel.js";
import { ExpiryTimer } from "../../../../components/flow/CheckoutSummary.js";
import { DEMO_PAYMENT } from "../../../../lib/demoFlowData.js";
import { CheckoutSkeleton } from "../../../../components/ui/LoadingSkeletons.js";

function PaypalSandbox({ params, onOpenAuditLog }) {
  const router = useRouter();
  const resolved =
    params && typeof params.then === "function" ? React.use(params) : params;
  const checkId = resolved?.checkId || DEMO_PAYMENT.checkId;

  const [processing, setProcessing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const continueToPaypal = () => {
    if (processing) return;
    setProcessing(true);
    timerRef.current = setTimeout(() => {
      router.push("/result/txn_demo_204");
    }, 1800);
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
              <span className="material-symbols-outlined text-[13px]">science</span>
              Sandbox only
            </span>
            <span className="font-code-sm text-code-sm text-secondary">
              Check {checkId}
            </span>
          </>
        }
        assistant={
          <VoiceAssistPanel
            stage={3}
            greeting="The PayPal window is ready. The microphone is off from here until the result is shown."
            reply="Approve or cancel in the simulated PayPal window. SayPay will verify the capture on the server before any receipt is shown."
            actionReply="Use the PayPal Sandbox button. Nothing is captured until PayPal approves and the server verifies it."
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

          <section className="rounded-2xl border border-[#A7F3D0] bg-[#F3FBF7] p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[22px] text-[#107E3E]">
                task_alt
              </span>
              <div>
                <p className="font-label-md text-label-md font-semibold text-on-surface">
                  You confirmed at 14:32 UTC · server status CONFIRMED_PAY
                </p>
                <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
                  Method: voice — heard “pay now”. This confirmation cannot be reused after the
                  check expires.
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
                      {DEMO_PAYMENT.merchant}
                    </p>
                    <p className="font-code-sm text-code-sm text-secondary">
                      {DEMO_PAYMENT.merchantId} · invoice {DEMO_PAYMENT.reference}
                    </p>
                  </div>
                  <p className="text-right font-headline-md text-headline-md font-bold text-on-surface">
                    {DEMO_PAYMENT.amount}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-2 py-3 font-body-sm text-body-sm">
                  <div>
                    <dt className="text-secondary">Item</dt>
                    <dd className="font-medium text-on-surface">{DEMO_PAYMENT.purpose}</dd>
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
                    <span className="font-semibold">Sandbox credentials only.</span> Never enter real
                    PayPal login details. No real money moves in this demo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={continueToPaypal}
                  disabled={processing}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#003087] px-4 py-3 font-label-lg text-label-lg font-semibold text-white shadow-sm transition-colors hover:bg-[#001C64] disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-[19px]">login</span>
                  Log in &amp; approve in PayPal Sandbox
                </button>
                <p className="mt-2 text-center font-body-sm text-[12px] text-secondary">
                  Opens a simulated sandbox window · PayPal buyer approval is mandatory
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#15232D]/45 px-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#DFE5E8] bg-white p-6 text-center shadow-xl">
            <span className="material-symbols-outlined animate-spin text-[40px] text-primary">
              progress_activity
            </span>
            <h2 className="mt-3 font-headline-sm text-headline-sm font-semibold text-on-surface">
              Confirming with PayPal…
            </h2>
            <p className="mt-1 font-body-sm text-body-sm text-secondary">
              Please don’t close this page. SayPay is verifying the capture on the server before
              showing the result.
            </p>
            <p className="mt-3 font-code-sm text-[10px] uppercase tracking-wider text-secondary">
              M6 · Processing payment
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
