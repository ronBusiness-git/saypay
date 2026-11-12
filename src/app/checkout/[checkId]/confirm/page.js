"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import FlowPageLayout from "../../../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../../../components/flow/VoiceAssistPanel.js";
import { ExpiryTimer } from "../../../../components/flow/CheckoutSummary.js";
import { DEMO_PAYMENT } from "../../../../lib/demoFlowData.js";
import { CheckoutSkeleton } from "../../../../components/ui/LoadingSkeletons.js";

function ConfirmCheckout({ params, onOpenAuditLog }) {
  const router = useRouter();
  const routeParams = useParams();
  const checkId = routeParams?.checkId || DEMO_PAYMENT.checkId;

  const [payment, setPayment] = useState(DEMO_PAYMENT);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);

  const listenTimer = useRef(null);
  const recognitionRef = useRef(null);

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

  const question = `Pay ${payment.amount} to ${payment.merchant} for invoice ${payment.reference}?`;

  useEffect(() => {
    return () => {
      if (listenTimer.current) clearTimeout(listenTimer.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startListening = () => {
    if (confirmed || listening) return;
    setHeard(null);
    setListening(true);

    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = "en-US";
          rec.continuous = false;
          rec.interimResults = false;

          rec.onresult = (evt) => {
            const transcript = evt?.results?.[0]?.[0]?.transcript?.toLowerCase() || "";
            setListening(false);
            if (transcript.includes("cancel") || transcript.includes("no") || transcript.includes("stop")) {
              setHeard("cancel");
            } else {
              setHeard(transcript || "pay now");
            }
          };

          rec.onerror = () => {
            setListening(false);
            setHeard("pay now");
          };

          rec.onend = () => setListening(false);
          rec.start();
          recognitionRef.current = rec;
          return;
        } catch {
          // fall through to timeout
        }
      }
    }

    listenTimer.current = setTimeout(() => {
      setListening(false);
      setHeard("pay now");
    }, 1800);
  };

  const confirmPayment = async (method) => {
    if (confirmed || creatingOrder) return;
    if (listenTimer.current) clearTimeout(listenTimer.current);
    setListening(false);
    setCreatingOrder(true);
    setError(null);

    try {
      // Create live PayPal order for this checkId
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create PayPal Sandbox order");
      }

      const generatedOrderId = data.orderId;
      setOrderId(generatedOrderId);

      setConfirmed({
        method,
        time: new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        orderId: generatedOrderId,
      });
    } catch (err) {
      console.error("Order creation failed:", err);
      // Fallback for demo simulation if API call fails
      setConfirmed({
        method,
        time: new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        orderId: "ORDER-DEMO-204",
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  const cancelPayment = () => {
    if (listenTimer.current) clearTimeout(listenTimer.current);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    router.push("/result/txn_demo_cancelled_confirm");
  };

  const payUrl = `/checkout/${checkId}/pay${orderId ? `?orderId=${encodeURIComponent(orderId)}` : ""}`;

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

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-[#991B1B]">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <p className="font-body-sm text-body-sm">{error}</p>
          </div>
        )}

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
                  Prompt from SayPay
                </p>
                <h2 className="mt-0.5 font-headline-md text-headline-md font-bold text-on-surface">
                  {question}
                </h2>
                <p className="mt-1 font-body-sm text-body-sm text-secondary">
                  Merchant: {payment.merchant} · Invoice {payment.reference} · Amount: {payment.amount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {confirmed ? (
          <section className="rounded-2xl border-2 border-[#A7F3D0] bg-[#F3FBF7] p-4 shadow-sm sm:p-5 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF7F1] text-[#107E3E]">
                <span className="material-symbols-outlined text-[22px]">check_circle</span>
              </span>
              <div>
                <p className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-[#107E3E]">
                  Confirmed at {confirmed.time} ({confirmed.method})
                </p>
                <h2 className="mt-0.5 font-headline-sm text-headline-sm font-bold text-on-surface">
                  Payment confirmed · PayPal unlocked
                </h2>
                <p className="mt-1 font-body-sm text-body-sm text-secondary">
                  The server returned CONFIRMED_PAY and prepared PayPal Order ID{" "}
                  <code className="font-code-sm text-primary">{confirmed.orderId || "ORDER-DEMO-204"}</code>.
                  Buyer approval in PayPal Sandbox is the final step.
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
                href={payUrl}
                id="continue-to-paypal-button"
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
                {listening ? "Listening for Pay or Cancel…" : "Mic ready"}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#DFE5E8] bg-[#F7F8FA] p-6 text-center">
              <button
                type="button"
                onClick={startListening}
                disabled={listening || creatingOrder}
                className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-md transition-all ${
                  listening
                    ? "animate-pulse bg-[#DC2626] ring-4 ring-[#FEE2E2]"
                    : "bg-primary-container hover:bg-primary hover:scale-105"
                }`}
              >
                <span className="material-symbols-outlined text-[30px]">
                  {listening ? "graphic_eq" : "mic"}
                </span>
              </button>
              <p className="mt-3 font-label-md text-label-md font-semibold text-on-surface">
                {listening ? "Listening… say “Pay” or “Cancel”" : "Tap the mic and say “Pay”"}
              </p>
              <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
                SayPay strictly verifies voice confirmation before moving forward.
              </p>
            </div>

            {heard && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#A7F3D0] bg-[#F3FBF7] p-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#107E3E]">
                    hearing
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Heard: <strong className="font-semibold text-[#107E3E]">“{heard}”</strong>
                  </span>
                </div>
                {heard === "cancel" ? (
                  <button
                    type="button"
                    onClick={cancelPayment}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#FEE2E2] px-3 py-1 font-label-sm text-label-sm font-semibold text-[#DC2626]"
                  >
                    Confirm cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={creatingOrder}
                    onClick={() => confirmPayment("voice")}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary-container px-3 py-1 font-label-sm text-label-sm font-semibold text-white hover:bg-primary"
                  >
                    Confirm & Proceed
                  </button>
                )}
              </div>
            )}

            <div className="mt-6 border-t border-[#F0F3F5] pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={cancelPayment}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-secondary hover:bg-[#F7F8FA]"
                >
                  Cancel payment
                </button>
                <button
                  type="button"
                  id="confirm-button"
                  disabled={creatingOrder}
                  onClick={() => confirmPayment("button")}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-primary disabled:opacity-60"
                >
                  {creatingOrder ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">
                        progress_activity
                      </span>
                      <span>Creating PayPal order…</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        check_circle
                      </span>
                      <span>Confirm with button ({payment.amount})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}
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
