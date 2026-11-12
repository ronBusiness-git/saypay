"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowPageLayout from "../../../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../../../components/flow/VoiceAssistPanel.js";
import { ExpiryTimer } from "../../../../components/flow/CheckoutSummary.js";
import { DEMO_PAYMENT } from "../../../../lib/demoFlowData.js";
import { CheckoutSkeleton } from "../../../../components/ui/LoadingSkeletons.js";

function ConfirmCheckout({ params, onOpenAuditLog }) {
  const router = useRouter();
  const resolved =
    params && typeof params.then === "function" ? React.use(params) : params;
  const checkId = resolved?.checkId || DEMO_PAYMENT.checkId;

  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const listenTimer = useRef(null);

  const question = `Pay ${DEMO_PAYMENT.amount} to ${DEMO_PAYMENT.merchant} for invoice ${DEMO_PAYMENT.reference}?`;

  useEffect(() => {
    return () => {
      if (listenTimer.current) clearTimeout(listenTimer.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const readQuestion = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(question);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (confirmed || listening) return;
    setHeard(null);
    setListening(true);
    listenTimer.current = setTimeout(() => {
      setListening(false);
      setHeard("pay now");
    }, 1800);
  };

  const confirmPayment = (method) => {
    if (confirmed) return;
    if (listenTimer.current) clearTimeout(listenTimer.current);
    setListening(false);
    setConfirmed({
      method,
      time: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  };

  const cancelPayment = () => {
    if (listenTimer.current) clearTimeout(listenTimer.current);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    router.push("/result/txn_demo_cancelled_confirm");
  };

  return (
    <FlowPageLayout
      stage={3}
      status="Confirm"
      tone="pending"
      auditCount={7}
      onOpenAuditLog={onOpenAuditLog}
      eyebrow="Review & confirm · confirm checkout"
      title="Confirm this payment"
      subtitle="Confirm by voice or button. This is the last step before PayPal buyer approval."
      badge={
        <>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-[#1D4ED8]">
            <span className="material-symbols-outlined text-[13px]">record_voice_over</span>
            Stage 3 · Confirm (voice or button)
          </span>
          <span className="font-code-sm text-code-sm text-secondary">
            Check {checkId}
          </span>
        </>
      }
      actions={
        <Link
          href={`/checkout/${checkId}`}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-3 py-2 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
        >
          <span className="material-symbols-outlined text-[17px]">arrow_back</span>
          Back to review
        </Link>
      }
      assistant={
        <VoiceAssistPanel
          stage={3}
          greeting="This is the confirmation step. Only “Pay” or “Cancel” are accepted as voice commands."
          reply="Use the confirmation panel on the right. The assistant cannot approve the payment for you."
          whyReply="Your spoken Pay confirms intent, but PayPal buyer approval is still required. Voice can never unlock PayPal by itself."
          actionReply="Say Pay or Cancel in the confirmation panel, or use the two buttons."
          suggestions={["What can I say?", "Is this the last step?", "Can I still cancel?"]}
          samplePhrase="What can I say?"
          voiceEnabled={false}
          initialMode="manual"
          disabledMessage="Voice commands here are limited to Pay or Cancel. Use the confirmation panel."
        />
      }
    >
      <div className="space-y-5">
        <ExpiryTimer seconds={840} />

        <section className="rounded-2xl border-2 border-[#BFDBFE] bg-[#F5F9FF] p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  help_center
                </span>
              </span>
              <div>
                <p className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-[#1D4ED8]">
                  Confirm decision
                </p>
                <h2 className="mt-1 font-headline-sm text-headline-sm font-semibold text-on-surface">
                  {question}
                </h2>
                <p className="mt-1 font-body-sm text-body-sm text-secondary">
                  Built from the stored check · USD 12.50 · reference GL-204
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={readQuestion}
              className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 self-start rounded-[10px] border border-[#BFDBFE] bg-white px-3 py-2 font-label-md text-label-md font-semibold text-[#1D4ED8] hover:bg-[#F5F9FF]"
            >
              <span className="material-symbols-outlined text-[17px]">volume_up</span>
              Read aloud
            </button>
          </div>
        </section>

        {confirmed ? (
          <section className="animate-assist-rise rounded-2xl border-2 border-[#A7F3D0] bg-[#F3FBF7] p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#107E3E] text-white">
                <span className="material-symbols-outlined text-[24px]">check</span>
              </span>
              <div>
                <p className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-[#107E3E]">
                  Confirmed · CONFIRMED_PAY
                </p>
                <h2 className="mt-1 font-headline-sm text-headline-sm font-semibold text-on-surface">
                  You confirmed by {confirmed.method} at {confirmed.time}
                </h2>
                <p className="mt-1 font-body-sm text-body-sm text-secondary">
                  The server returned CONFIRMED_PAY. The PayPal Sandbox button is now unlocked.
                  Buyer approval is still required before any capture.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={cancelPayment}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-secondary hover:bg-[#F7F8FA]"
              >
                Cancel payment
              </button>
              <Link
                href={`/checkout/${checkId}/pay`}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-primary"
              >
                Continue to PayPal Sandbox
                <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
              </Link>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Voice confirmation
              </h2>
              <span
                aria-live="polite"
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-label-sm text-label-sm font-semibold ${
                  listening
                    ? "border-[#A7F3D0] bg-[#EAF7F1] text-[#107E3E]"
                    : "border-[#DFE5E8] bg-[#F7F8FA] text-secondary"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    listening ? "animate-pulse bg-[#107E3E]" : "bg-[#B8C2CC]"
                  }`}
                />
                {listening ? "Listening…" : "Mic ready"}
              </span>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] p-4 text-center">
              <button
                type="button"
                onClick={startListening}
                aria-label="Start voice confirmation"
                className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
                  listening
                    ? "bg-primary-container text-white shadow-lg shadow-primary/20"
                    : "bg-[#EAF7F1] text-primary-container hover:bg-primary-container hover:text-white"
                }`}
              >
                {listening && (
                  <>
                    <span className="voice-ring-1 absolute inset-0 rounded-full bg-primary/25" />
                    <span className="voice-ring-2 absolute inset-0 rounded-full bg-primary/20" />
                  </>
                )}
                <span
                  className="relative material-symbols-outlined text-[28px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mic
                </span>
              </button>
              <p className="mt-2.5 font-label-md text-label-md font-semibold text-on-surface">
                {listening ? "Listening… say “Pay” or “Cancel”" : "Tap the mic, then say Pay or Cancel"}
              </p>
              <p className="mt-1 max-w-sm font-body-sm text-body-sm text-secondary">
                Listens up to 8 seconds. Only “pay”, “pay now”, “yes, pay” or “cancel”, “no”, “stop”
                are accepted. Negations win.
              </p>

              {heard && (
                <div className="animate-assist-rise mt-3 flex items-center gap-2 rounded-full border border-[#A7F3D0] bg-white px-3 py-1.5">
                  <span className="font-body-sm text-body-sm text-secondary">
                    Heard: <span className="font-semibold text-on-surface">“{heard}”</span> → Pay
                  </span>
                  <button
                    type="button"
                    onClick={() => setHeard(null)}
                    className="inline-flex items-center gap-0.5 font-label-sm text-label-sm font-semibold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-[14px]">undo</span>
                    Undo
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => confirmPayment(heard ? "voice" : "button")}
                className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-4 py-3 font-label-lg text-label-lg font-semibold text-white shadow-sm hover:bg-primary"
              >
                <span className="material-symbols-outlined text-[19px]">payments</span>
                Pay
              </button>
              <button
                type="button"
                onClick={cancelPayment}
                className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-3 font-label-lg text-label-lg font-semibold text-on-surface hover:bg-[#F7F8FA]"
              >
                <span className="material-symbols-outlined text-[19px]">close</span>
                Cancel
              </button>
            </div>
          </section>
        )}

        <div className="flex items-start gap-2 rounded-xl border border-[#DFE5E8] bg-surface-container-low/70 px-4 py-3">
          <span className="material-symbols-outlined text-[18px] text-secondary">policy</span>
          <p className="font-body-sm text-body-sm text-on-surface">
            Your decision{confirmed ? "" : " (voice or button)"} and the heard text are written to
            the audit log. No PayPal order exists until you continue to the sandbox checkout.
          </p>
        </div>
      </div>
    </FlowPageLayout>
  );
}

export default function ConfirmCheckoutPage(props) {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <ConfirmCheckout {...props} />
    </Suspense>
  );
}
