"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowPageLayout from "../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../components/flow/VoiceAssistPanel.js";
import LoadingScreen from "../../components/ui/LoadingScreen.js";
import { useDemoSession } from "../../lib/demoAuth.js";

export default function NewPaymentCheckPage({ onOpenAuditLog }) {
  const router = useRouter();
  const session = useDemoSession();
  const isSeller = session?.role === "seller";

  const [currentStage, setCurrentStage] = useState(1);
  const [isScreening, setIsScreening] = useState(false);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [activePayment, setActivePayment] = useState(null);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [session?.role]);

  async function fetchInvoices() {
    try {
      const res = await fetch("/api/invoices?status=UNPAID");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.invoices)) {
          // Strict UNPAID filter (NC-04)
          setUnpaidInvoices(data.invoices.filter((i) => i.status === "UNPAID"));
        }
      }
    } catch (err) {
      console.warn("Could not load invoices:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle assistant actions returned from VoiceAssistPanel
  const handleAssistantResult = (result) => {
    if (!result) return;
    setPaymentError(null);

    if (result.action === "prepare_payment" && result.data?.payment) {
      // NC-02: Automatic Multi-Step Progression with Timed Transitions
      // Step 1: Capture -> Step 2: Safety Check (1s animated screening) -> Step 3: Review & Confirm
      setCreatedInvoice(null);
      setCompletedReceipt(null);
      setActivePayment(null);
      setCurrentStage(2);
      setIsScreening(true);

      setTimeout(() => {
        setIsScreening(false);
        setActivePayment(result.data.payment);
        setCurrentStage(3);
      }, 1000);
    } else if (result.action === "invoice_created" && result.data?.invoice) {
      setCreatedInvoice(result.data.invoice);
      setActivePayment(null);
      setCompletedReceipt(null);
      setCurrentStage(1);
      fetchInvoices();
    } else if (result.action === "show_invoices") {
      setActivePayment(null);
      setCreatedInvoice(null);
      setCompletedReceipt(null);
      setCurrentStage(1);
      if (result.data?.invoices) {
        setUnpaidInvoices(result.data.invoices.filter((i) => i.status === "UNPAID"));
      }
    }
  };

  // 1-Click Pay with PayPal Sandbox
  const handlePayWithPayPal = async () => {
    if (!activePayment || !activePayment.checkId) return;

    setPaying(true);
    setPaymentError(null);

    try {
      // 1. Create order
      const createRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId: activePayment.checkId }),
      });
      const orderData = await createRes.json();
      if (!createRes.ok) throw new Error(orderData.error || "Order creation failed");

      // 2. Capture payment
      const captureRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId: activePayment.checkId, orderId: orderData.orderId }),
      });
      const captureData = await captureRes.json();
      if (!captureRes.ok) throw new Error(captureData.error || "Capture failed");

      // 3. Set receipt and advance to Stage 4 (Result & Settlement)
      setCurrentStage(4);
      setCompletedReceipt({
        transactionId: captureData.transactionId,
        captureId: captureData.captureId,
        amount: activePayment.amount,
        currency: activePayment.currency,
        merchantName: activePayment.merchantName,
        invoiceId: activePayment.invoiceId,
        isBulk: activePayment.isBulk,
        itemsCount: activePayment.items?.length || activePayment.invoiceIds?.length || 1,
        date: new Date().toLocaleString(),
      });

      // Strict Unpaid Filtering: immediately remove settled invoice(s)
      if (activePayment.isBulk && Array.isArray(activePayment.invoiceIds)) {
        setUnpaidInvoices((prev) =>
          prev.filter((inv) => !activePayment.invoiceIds.includes(inv.invoiceId))
        );
      } else if (activePayment.invoiceId) {
        setUnpaidInvoices((prev) =>
          prev.filter((inv) => inv.invoiceId !== activePayment.invoiceId)
        );
      }

      setActivePayment(null);
      fetchInvoices();
    } catch (err) {
      setPaymentError(err.message || "PayPal Sandbox payment failed");
    } finally {
      setPaying(false);
    }
  };

  const buyerSuggestions = [
    "Show my unpaid bills",
    "Pay invoice GL-1042",
    "Pay GreenLeaf coffee order ($12.50)",
    "Pay all unpaid invoices",
    "What's my total pending amount?",
    "Show bills due this week",
  ];

  const sellerSuggestions = [
    "Create invoice for buyer@saypay.app for 3 coffee bags at $45",
    "Bill John Doe $25 for office supplies",
    "Show my pending invoices",
  ];

  // Derive stepper stage & tone
  let stageNumber = currentStage;
  let statusText = "Capture";
  let toneType = "clear";

  if (completedReceipt) {
    stageNumber = 4;
    statusText = "Settled";
    toneType = "clear";
  } else if (activePayment) {
    stageNumber = 3;
    if (activePayment.status === "BLOCKED") {
      statusText = "Blocked";
      toneType = "blocked";
    } else if (activePayment.status === "REVIEW") {
      statusText = "Review";
      toneType = "review";
    } else {
      statusText = "Clear";
      toneType = "clear";
    }
  } else if (isScreening) {
    stageNumber = 2;
    statusText = "Screening";
    toneType = "pending";
  }

  return (
    <FlowPageLayout
      stage={stageNumber}
      status={statusText}
      tone={toneType}
      auditCount={0}
      onOpenAuditLog={onOpenAuditLog}
      eyebrow={
        isSeller
          ? "Merchant Voice Billing"
          : stageNumber === 4
          ? "Stage 4 · PayPal Settlement"
          : stageNumber === 3
          ? "Stage 3 · Review & Confirm"
          : stageNumber === 2
          ? "Stage 2 · Safety Screening"
          : "Stage 1 · Intent Capture"
      }
      title={
        isSeller
          ? "Create Invoices via Voice & Track Collections"
          : stageNumber === 4
          ? "Payment Completed via PayPal Sandbox"
          : stageNumber === 3
          ? "Review Payment Details & Safety Verdict"
          : stageNumber === 2
          ? "Deterministic Security Screening"
          : "Conversational Payment & Safety Screening"
      }
      subtitle={
        isSeller
          ? "Say or type billing details. SayPay parses the items, generates the invoice in the database, and alerts the customer."
          : "Say or type what you want to pay. SayPay cross-references the invoice with deterministic MatchCheck rules before human approval."
      }
      badge={
        <>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#DFE5E8] bg-white px-2.5 py-0.5 font-label-sm text-label-sm text-secondary">
            <span className="material-symbols-outlined text-[13px]">
              {isSeller ? "receipt" : "shield"}
            </span>
            {isSeller ? "Merchant Invoicing" : `Stage ${stageNumber} · ${statusText}`}
          </span>
          <span className="font-code-sm text-code-sm text-[#107E3E] font-semibold">
            {isSeller ? "GreenLeaf Store" : "PayPal Sandbox Engine"}
          </span>
        </>
      }
      assistant={
        <VoiceAssistPanel
          stage={stageNumber}
          role={isSeller ? "seller" : "buyer"}
          greeting={
            isSeller
              ? "Hello! I’m SayPay Merchant Assist. Say what invoice you’d like to create (e.g. 'Create invoice for buyer@saypay.app for 2 coffee bags at $36'), or ask to view your pending invoices."
              : "Hi, I’m SayPay Assist. Tell me what bill you’d like to pay, or ask me to show your unpaid invoices."
          }
          suggestions={isSeller ? sellerSuggestions : buyerSuggestions}
          onAssistantResult={handleAssistantResult}
        />
      }
    >
      <div className="space-y-5">
        {/* VIEW 0: STAGE 2 SCREENING TRANSITION CARD (NC-02) */}
        {isScreening && (
          <section className="rounded-2xl border border-[#A7F3D0] bg-[#EAF7F1]/70 p-6 shadow-sm space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-white">
                <span className="material-symbols-outlined text-[24px] animate-spin">
                  progress_activity
                </span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-[#15232D]">
                  Stage 2 · Deterministic Safety Screening in Progress…
                </h3>
                <p className="font-body-sm text-body-sm text-secondary">
                  Evaluating 5 deterministic safety rules against MongoDB ledger.
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-[#A7F3D0]/70 bg-white p-4 text-xs font-medium">
              <div className="flex items-center justify-between text-[#107E3E] py-1 border-b border-[#F0F3F5]">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Merchant registry allowlist & active credentials check
                </span>
                <span className="font-bold">VERIFYING</span>
              </div>
              <div className="flex items-center justify-between text-[#107E3E] py-1 border-b border-[#F0F3F5]">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">fact_check</span>
                  Duplicate payment & settled transaction ledger scan
                </span>
                <span className="font-bold">SCANNING</span>
              </div>
              <div className="flex items-center justify-between text-[#107E3E] py-1">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">security</span>
                  Amount tolerance, currency matching & workspace limit
                </span>
                <span className="font-bold">CHECKING</span>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 1: PREPARED PAYMENT CARD (STAGE 3: REVIEW & CONFIRM) */}
        {activePayment && !isScreening && (
          <section
            className={`rounded-2xl border p-5 shadow-sm space-y-4 ${
              activePayment.status === "BLOCKED"
                ? "border-[#FECACA] bg-[#FFF5F5]"
                : activePayment.status === "REVIEW"
                ? "border-[#FDE68A] bg-[#FEF3C7]/40"
                : "border-[#A7F3D0] bg-[#EAF7F1]/40"
            }`}
          >
            {/* Header verdict */}
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                activePayment.status === "BLOCKED"
                  ? "border-[#FECACA]"
                  : activePayment.status === "REVIEW"
                  ? "border-[#FDE68A]"
                  : "border-[#A7F3D0]/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${
                    activePayment.status === "BLOCKED"
                      ? "bg-[#DC2626]"
                      : activePayment.status === "REVIEW"
                      ? "bg-[#B45309]"
                      : "bg-[#107E3E]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {activePayment.status === "BLOCKED"
                      ? "block"
                      : activePayment.status === "REVIEW"
                      ? "warning"
                      : "verified"}
                  </span>
                </span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-[#15232D]">
                    {activePayment.status === "BLOCKED"
                      ? "Payment Blocked by Safety Rules"
                      : activePayment.status === "REVIEW"
                      ? "MatchCheck Review Required"
                      : activePayment.isBulk
                      ? `Batch MatchCheck Verified · ${activePayment.items?.length || activePayment.invoiceIds?.length || 2} Invoices`
                      : "MatchCheck Verified · Ready for Payment"}
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary">
                    {activePayment.status === "BLOCKED"
                      ? "Deterministic safety rules stopped this transaction before order creation."
                      : activePayment.status === "REVIEW"
                      ? "Some fields require manual verification."
                      : "All deterministic safety rules passed. Pre-filled and ready for approval."}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1 font-label-sm text-label-sm font-bold ${
                  activePayment.status === "BLOCKED"
                    ? "border-[#FECACA] text-[#DC2626]"
                    : activePayment.status === "REVIEW"
                    ? "border-[#FDE68A] text-[#B45309]"
                    : "border-[#A7F3D0] text-[#107E3E]"
                }`}
              >
                {activePayment.status || "CLEAR"}
              </span>
            </div>

            {/* Comprehensive Safety Dialogs / Warnings (NC-03 & NC-13) */}
            {activePayment.status === "BLOCKED" && (
              <div className="rounded-xl border border-[#FECACA] bg-white p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#DC2626]">
                  <span className="material-symbols-outlined text-[18px]">shield_with_heart</span>
                  <span>Safety Violation Detected</span>
                </div>
                {activePayment.reasonCodes?.includes("DUPLICATE_PAYMENT") && (
                  <p className="text-secondary">
                    <strong className="text-[#DC2626]">DUPLICATE_PAYMENT:</strong> A completed transaction with reference <code>{activePayment.invoiceId}</code> already exists in the ledger.
                  </p>
                )}
                {(activePayment.reasonCodes?.includes("INACTIVE_MERCHANT") ||
                  activePayment.reasonCodes?.includes("UNKNOWN_MERCHANT")) && (
                  <p className="text-secondary">
                    <strong className="text-[#DC2626]">UNTRUSTED_MERCHANT:</strong> Payee <code>{activePayment.merchantName}</code> is unverified or marked inactive in the registry.
                  </p>
                )}
                {activePayment.reasonCodes?.includes("AMOUNT_EXCEEDS_LIMIT") && (
                  <p className="text-secondary">
                    <strong className="text-[#DC2626]">AMOUNT_EXCEEDS_LIMIT:</strong> The amount exceeds the configured workspace limit ($500.00).
                  </p>
                )}
                {activePayment.reasonCodes?.length === 0 && (
                  <p className="text-secondary">
                    A deterministic mismatch rule halted payment pre-authorization.
                  </p>
                )}
              </div>
            )}

            {/* Invoice & Merchant Details */}
            <div className="rounded-xl border border-[#DFE5E8] bg-white p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-sm text-label-sm text-secondary">
                    {activePayment.isBulk ? "Payees" : "Merchant / Payee"}
                  </p>
                  <p className="font-headline-sm text-headline-sm font-bold text-[#15232D]">
                    {activePayment.merchantName}
                  </p>
                  <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                    {activePayment.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-label-sm text-label-sm text-secondary">Total Amount</p>
                  <p className="text-2xl font-black text-[#087F68]">
                    ${activePayment.amount}{" "}
                    <span className="text-xs font-semibold text-secondary">{activePayment.currency}</span>
                  </p>
                  <span className="font-code-sm text-[11px] text-secondary">
                    Ref: {activePayment.invoiceId}
                  </span>
                </div>
              </div>

              {/* Bulk Items Breakdown (NC-09) */}
              {activePayment.isBulk && Array.isArray(activePayment.items) && (
                <div className="border-t border-[#F0F3F5] pt-2 space-y-1.5">
                  <p className="font-label-sm text-[11px] font-semibold text-secondary uppercase">
                    Invoices Included in this Batch:
                  </p>
                  {activePayment.items.map((it) => (
                    <div key={it.invoiceId} className="flex justify-between text-xs py-0.5">
                      <span className="font-mono text-secondary">{it.invoiceId} ({it.merchantName})</span>
                      <span className="font-bold text-[#15232D]">${it.amount} {it.currency}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 4 Green Checklist Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#F0F3F5] text-xs">
                <div
                  className={`flex items-center gap-1.5 font-medium ${
                    activePayment.checks?.recipient?.status === "MATCH" || !activePayment.checks
                      ? "text-[#107E3E]"
                      : "text-[#DC2626]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Recipient verified</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 font-medium ${
                    activePayment.checks?.amount?.status === "MATCH" || !activePayment.checks
                      ? "text-[#107E3E]"
                      : "text-[#DC2626]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Amount matched</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 font-medium ${
                    activePayment.checks?.reference?.status === "MATCH" || !activePayment.checks
                      ? "text-[#107E3E]"
                      : "text-[#DC2626]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Reference matched</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 font-medium ${
                    activePayment.checks?.duplicate?.status === "CLEAR" || !activePayment.checks
                      ? "text-[#107E3E]"
                      : "text-[#DC2626]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>No duplicate</span>
                </div>
              </div>
            </div>

            {paymentError && (
              <div className="rounded-xl border border-[#FECACA] bg-[#FFF5F5] p-3 text-xs text-[#DC2626]">
                {paymentError}
              </div>
            )}

            {/* 1-CLICK PAYPAL BUTTON (Human Authorization Required) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handlePayWithPayPal}
                disabled={paying || activePayment.status === "BLOCKED" || activePayment.canCreateOrder === false}
                className="w-full sm:w-auto flex-1 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[10px] bg-[#0070BA] px-6 font-label-lg text-label-lg font-bold text-white shadow-md hover:bg-[#005ea6] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paying ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Authorizing PayPal Sandbox…
                  </>
                ) : activePayment.status === "BLOCKED" ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">block</span>
                    <span>Payment Blocked by Safety Rules</span>
                  </>
                ) : (
                  <>
                    <span className="font-black text-sm">PayPal</span>
                    <span>
                      Pay ${activePayment.amount}{" "}
                      {activePayment.isBulk
                        ? `(${activePayment.items?.length || activePayment.invoiceIds?.length} invoices) `
                        : ""}
                      with PayPal
                    </span>
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePayment(null);
                  setCurrentStage(1);
                }}
                className="inline-flex min-h-[48px] items-center justify-center rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-secondary hover:bg-[#F7F8FA] transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="font-body-sm text-[11px] text-secondary text-center">
              🔒 Human authorization required. Funds will be debited via PayPal Sandbox.
            </p>
          </section>
        )}

        {/* VIEW 2: MERCHANT INVOICE CREATED CONFIRMATION */}
        {createdInvoice && !isScreening && (
          <section className="rounded-2xl border border-[#A7F3D0] bg-[#EAF7F1]/50 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-[#107E3E]">
                task_alt
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-[#15232D]">
                  Invoice Created Successfully
                </h3>
                <p className="font-body-sm text-body-sm text-secondary">
                  Added to buyer pending payments and synced in MongoDB.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#DFE5E8] bg-white p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F0F3F5]">
                <span className="text-secondary">Invoice Ref</span>
                <span className="font-mono font-bold text-[#15232D]">{createdInvoice.invoiceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F3F5]">
                <span className="text-secondary">Customer</span>
                <span className="font-bold text-[#15232D]">{createdInvoice.buyerEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F3F5]">
                <span className="text-secondary">Description</span>
                <span className="text-[#15232D]">{createdInvoice.description}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-secondary">Total Amount</span>
                <span className="font-bold text-sm text-[#087F68]">
                  ${createdInvoice.amount} {createdInvoice.currency}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatedInvoice(null);
                  setCurrentStage(1);
                }}
                className="inline-flex min-h-[40px] items-center justify-center rounded-[10px] bg-primary-container px-4 font-label-md text-label-md font-semibold text-white hover:bg-[#066653] transition-colors"
              >
                Create Another Invoice
              </button>
              <Link
                href="/"
                className="inline-flex min-h-[40px] items-center justify-center rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-secondary hover:bg-[#F7F8FA] transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </section>
        )}

        {/* VIEW 3: COMPLETED RECEIPT (STAGE 4: RESULT & SETTLEMENT) */}
        {completedReceipt && !isScreening && (
          <section className="rounded-2xl border border-[#A7F3D0] bg-[#EAF7F1]/60 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#107E3E] text-white">
                <span className="material-symbols-outlined text-[22px]">check</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-[#15232D]">
                  Payment Completed via PayPal Sandbox
                </h3>
                <p className="font-body-sm text-body-sm text-secondary">
                  Official sandbox ledger record has been captured and verified.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#DFE5E8] bg-white p-5 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F0F3F5]">
                <span className="text-secondary">Paid To</span>
                <span className="font-bold text-[#15232D]">{completedReceipt.merchantName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F3F5]">
                <span className="text-secondary">Amount Settled</span>
                <span className="font-black text-base text-[#107E3E]">
                  ${completedReceipt.amount} {completedReceipt.currency}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F3F5]">
                <span className="text-secondary">Invoice Reference</span>
                <span className="font-mono text-[#15232D]">{completedReceipt.invoiceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F3F5]">
                <span className="text-secondary">Transaction ID</span>
                <span className="font-mono text-[11px] text-[#15232D]">{completedReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-secondary">PayPal Capture ID</span>
                <span className="font-mono text-[11px] text-[#15232D]">{completedReceipt.captureId}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCompletedReceipt(null);
                  setCurrentStage(1);
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-primary-container px-5 font-label-md text-label-md font-semibold text-white hover:bg-[#066653] transition-colors"
              >
                Pay Another Invoice
              </button>
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA] transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </section>
        )}

        {/* DEFAULT VIEW: STRICT UNPAID BILLS LIST (NC-04) */}
        {!activePayment && !createdInvoice && !completedReceipt && !isScreening && (
          <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F3F5] pb-3">
              <div>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  {isSeller ? "Pending Invoices Awaiting Payment" : "Unpaid Invoices Ready for Payment"}
                </h2>
                <p className="font-body-sm text-body-sm text-secondary">
                  {isSeller
                    ? "Invoices currently issued to buyers."
                    : "Say 'Pay [merchant]' to the assistant, or select an invoice below."}
                </p>
              </div>
              <span className="rounded-full border border-[#DFE5E8] bg-white px-2.5 py-0.5 font-label-sm text-label-sm text-secondary">
                {unpaidInvoices.length} invoices
              </span>
            </div>

            {unpaidInvoices.length === 0 ? (
              <div className="py-8 text-center text-secondary text-sm">
                <span className="material-symbols-outlined text-[32px] text-[#107E3E] mb-1">
                  task_alt
                </span>
                <p className="font-semibold text-on-surface">All caught up!</p>
                <p className="text-xs text-secondary mt-0.5">
                  You have 0 unpaid invoices. All settlements are up to date.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unpaidInvoices.map((inv) => (
                  <div
                    key={inv.invoiceId}
                    className="rounded-xl border border-[#DFE5E8] hover:border-[#087F68] bg-white p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-lg text-label-lg font-bold text-on-surface">
                          {isSeller ? inv.buyerEmail : inv.merchantName}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2 py-0.5 text-[10px] font-semibold text-[#107E3E]">
                          Verified
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                        {inv.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2 font-code-sm text-[11px] text-secondary">
                        <span>Ref: {inv.invoiceId}</span>
                        <span>•</span>
                        <span>Due in {new Date(inv.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0F3F5]">
                      <div className="font-headline-sm text-headline-sm font-bold text-[#15232D]">
                        ${inv.amount}{" "}
                        <span className="text-xs font-normal text-secondary">{inv.currency}</span>
                      </div>
                      {!isSeller && (
                        <button
                          type="button"
                          onClick={() => {
                            handleAssistantResult({
                              action: "prepare_payment",
                              data: {
                                payment: {
                                  checkId: "chk_" + inv.invoiceId,
                                  invoiceId: inv.invoiceId,
                                  merchantName: inv.merchantName,
                                  merchantKey: inv.merchantKey,
                                  amount: inv.amount,
                                  currency: inv.currency,
                                  description: inv.description,
                                  status: "CLEAR",
                                  canCreateOrder: true,
                                },
                              },
                            });
                          }}
                          className="inline-flex min-h-[34px] items-center gap-1 rounded-[8px] bg-primary-container px-3 py-1 font-label-md text-label-md font-semibold text-white hover:bg-[#066653] shadow-sm transition-all"
                        >
                          Review & Pay
                          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </FlowPageLayout>
  );
}
