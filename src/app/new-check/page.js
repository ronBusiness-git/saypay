"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowPageLayout from "../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../components/flow/VoiceAssistPanel.js";
import { DEMO_PAYMENT } from "../../lib/demoFlowData.js";

export default function NewPaymentCheckPage({ onOpenAuditLog }) {
  const router = useRouter();

  const [intentText, setIntentText] = useState(DEMO_PAYMENT.voiceTranscript);
  const [requestText, setRequestText] = useState(DEMO_PAYMENT.requestSnippet);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState(null);

  // Conversational confirmation state for the interactive flow
  const [checkResult, setCheckResult] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedIntent = sessionStorage.getItem("saypay_intent");
      const storedRequest = sessionStorage.getItem("saypay_request");
      if (storedIntent) setIntentText(storedIntent);
      if (storedRequest) setRequestText(storedRequest);
    }
  }, []);

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

  const handleCheckPayment = async () => {
    if (!intentReady || !requestReady) return;
    setLoading(true);
    setLoadingStep("AI analyzing intent & screening request...");
    setError(null);

    try {
      const res = await fetch("/api/payment/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentText,
          requestText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to evaluate safety check");
      }

      setCheckResult(data);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("saypay_last_check", JSON.stringify(data));
      }

      // If CLEAR, let user confirm right here or proceed to Stage 2
      if (data.status === "CLEAR") {
        setLoadingStep("MatchCheck CLEAR. Awaiting human confirmation...");
      } else if (data.status === "REVIEW") {
        router.push(`/new-check/review?checkId=${data.checkId}`);
      } else {
        router.push(`/new-check/blocked?checkId=${data.checkId}`);
      }
    } catch (err) {
      console.error("Check payment failed:", err);
      setError(err.message || "An unexpected error occurred while checking payment.");
    } finally {
      setLoading(false);
    }
  };

  // Immediate 1-click or voice "Yes" execution into PayPal Sandbox
  const handleConfirmAndPay = async () => {
    if (!checkResult || !checkResult.checkId) return;
    setPaying(true);
    setError(null);

    try {
      // 1. Create order
      const createRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId: checkResult.checkId }),
      });
      const orderData = await createRes.json();
      if (!createRes.ok) {
        const msg = typeof orderData.error === "object" ? orderData.error?.message : orderData.error;
        throw new Error(msg || "Failed to create PayPal order");
      }

      const orderId = orderData.orderId;

      // 2. Capture order in PayPal sandbox
      const captureRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId: checkResult.checkId, orderId }),
      });
      const captureData = await captureRes.json();
      if (!captureRes.ok) {
        const msg = typeof captureData.error === "object" ? captureData.error?.message : captureData.error;
        throw new Error(msg || "Failed to capture PayPal order");
      }

      // 3. Navigate to authoritative verified receipt
      router.push(`/result/${captureData.transactionId || checkResult.checkId}`);
    } catch (err) {
      console.error("Payment execution failed:", err);
      const msg = typeof err === "object" && err?.message ? err.message : String(err);
      setError(msg || "Payment execution failed in PayPal sandbox.");
      setPaying(false);
    }
  };

  return (
    <FlowPageLayout
      stage={1}
      status={checkResult ? checkResult.status : "Capture"}
      tone={checkResult?.status === "CLEAR" ? "clear" : "pending"}
      auditCount={checkResult ? 3 : 0}
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
        {/* Error notification banner */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-[#991B1B]">
            <span className="material-symbols-outlined text-[20px] text-[#DC2626]">
              error
            </span>
            <div className="flex-1">
              <p className="font-label-md text-label-md font-semibold">
                Unable to complete check
              </p>
              <p className="font-body-sm text-body-sm">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-secondary hover:text-[#DC2626]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Human Confirmation Banner (Triggered after MatchCheck returns CLEAR) */}
        {checkResult && checkResult.status === "CLEAR" && (
          <section
            aria-live="polite"
            className="rounded-2xl border-2 border-[#A7F3D0] bg-[#F0FDF4] p-5 shadow-md animate-in fade-in duration-200"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF7F1] text-[#107E3E]">
                  <span className="material-symbols-outlined text-[24px]">
                    verified_user
                  </span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      MatchCheck Passed · CLEAR
                    </h3>
                    <span className="rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-[#107E3E]">
                      Zero Mismatches
                    </span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-secondary">
                    Payee, amount (
                    <strong className="text-on-surface">
                      {checkResult.intent?.currency || "USD"}{" "}
                      {checkResult.intent?.amount || "12.50"}
                    </strong>
                    ), and invoice reference (
                    <code className="font-code-sm text-primary">
                      {checkResult.intent?.reference || "GL-204"}
                    </code>
                    ) matched exactly.
                  </p>
                  <p className="mt-2 font-label-md text-label-md font-semibold text-primary">
                    Say or click &ldquo;Yes, Pay with PayPal&rdquo; to complete the sandbox transaction.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                <button
                  type="button"
                  id="confirm-pay-now-button"
                  disabled={paying}
                  onClick={handleConfirmAndPay}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary-container px-6 py-2.5 font-label-md text-label-md font-bold text-white shadow-sm hover:bg-primary active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {paying ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">
                        progress_activity
                      </span>
                      <span>Processing PayPal sandbox…</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        shopping_cart_checkout
                      </span>
                      <span>Yes, Pay with PayPal</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/checks/${checkResult.checkId}`}
                  className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-secondary hover:text-primary"
                >
                  <span>Or review details step-by-step</span>
                  <span className="material-symbols-outlined text-[14px]">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </section>
        )}

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
                {loadingStep || "Both sources are needed before the check can run."}
              </span>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIntentText("");
                    setRequestText("");
                    setCheckResult(null);
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
                id="check-payment-button"
                onClick={handleCheckPayment}
                disabled={!intentReady || !requestReady || loading}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-lg text-label-lg font-semibold text-white shadow-sm transition-all hover:bg-primary disabled:cursor-not-allowed disabled:bg-[#DFE5E8] disabled:text-[#586672]"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[19px]">
                      progress_activity
                    </span>
                    <span>Checking payment…</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[19px]">
                      search_check
                    </span>
                    <span>Check this payment</span>
                    <span className="material-symbols-outlined text-[17px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </FlowPageLayout>
  );
}
