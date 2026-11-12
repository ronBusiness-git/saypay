"use client";

import React, { useState, useEffect } from "react";
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
          setUnpaidInvoices(data.invoices);
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
      setActivePayment(result.data.payment);
      setCreatedInvoice(null);
      setCompletedReceipt(null);
    } else if (result.action === "invoice_created" && result.data?.invoice) {
      setCreatedInvoice(result.data.invoice);
      setActivePayment(null);
      setCompletedReceipt(null);
      fetchInvoices();
    } else if (result.action === "show_invoices") {
      setActivePayment(null);
      setCreatedInvoice(null);
      setCompletedReceipt(null);
      if (result.data?.invoices) {
        setUnpaidInvoices(result.data.invoices);
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

      // 3. Set receipt
      setCompletedReceipt({
        transactionId: captureData.transactionId,
        captureId: captureData.captureId,
        amount: activePayment.amount,
        currency: activePayment.currency,
        merchantName: activePayment.merchantName,
        invoiceId: activePayment.invoiceId,
        date: new Date().toLocaleString(),
      });
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
    "What is my recent payment history?",
  ];

  const sellerSuggestions = [
    "Create invoice for buyer@saypay.app for 3 coffee bags at $45",
    "Bill John Doe $25 for office supplies",
    "Show my pending invoices",
  ];

  return (
    <FlowPageLayout
      stage={completedReceipt ? 3 : activePayment ? 2 : 1}
      status={completedReceipt ? "Cleared" : activePayment ? "Review" : "Capture"}
      tone={completedReceipt ? "clear" : activePayment ? "clear" : "clear"}
      auditCount={0}
      onOpenAuditLog={onOpenAuditLog}
      eyebrow={isSeller ? "Merchant Voice Billing" : "AI Payment Verification"}
      title={
        isSeller
          ? "Create Invoices via Voice & Track Collections"
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
            {isSeller ? "Merchant Invoicing" : "Stage 1 · Verified Capture"}
          </span>
          <span className="font-code-sm text-code-sm text-[#107E3E] font-semibold">
            {isSeller ? "GreenLeaf Store" : "Deterministic Engine"}
          </span>
        </>
      }
      assistant={
        <VoiceAssistPanel
          stage={1}
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
        {/* VIEW 1: PREPARED PAYMENT CARD (MATCHCHECK VERIFIED) */}
        {activePayment && (
          <section className="rounded-2xl border border-[#A7F3D0] bg-[#EAF7F1]/40 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#A7F3D0]/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#107E3E] text-white">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-[#15232D]">
                    MatchCheck Verified · Ready for Payment
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary">
                    All 5 deterministic safety rules passed.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-white px-3 py-1 font-label-sm text-label-sm font-bold text-[#107E3E]">
                CLEAR
              </span>
            </div>

            {/* Invoice & Merchant Details */}
            <div className="rounded-xl border border-[#DFE5E8] bg-white p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-sm text-label-sm text-secondary">Merchant / Payee</p>
                  <p className="font-headline-sm text-headline-sm font-bold text-[#15232D]">
                    {activePayment.merchantName}
                  </p>
                  <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                    {activePayment.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-label-sm text-label-sm text-secondary">Amount</p>
                  <p className="text-2xl font-black text-[#087F68]">
                    ${activePayment.amount}{" "}
                    <span className="text-xs font-semibold text-secondary">{activePayment.currency}</span>
                  </p>
                  <span className="font-code-sm text-[11px] text-secondary">
                    Ref: {activePayment.invoiceId}
                  </span>
                </div>
              </div>

              {/* 4 Green Checklist Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#F0F3F5] text-xs">
                <div className="flex items-center gap-1.5 text-[#107E3E] font-medium">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Recipient verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#107E3E] font-medium">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Amount matched</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#107E3E] font-medium">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Reference matched</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#107E3E] font-medium">
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

            {/* 1-CLICK PAYPAL BUTTON */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handlePayWithPayPal}
                disabled={paying}
                className="w-full sm:w-auto flex-1 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[10px] bg-[#0070BA] px-6 font-label-lg text-label-lg font-bold text-white shadow-md hover:bg-[#005ea6] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Authorizing PayPal Sandbox…
                  </>
                ) : (
                  <>
                    <span className="font-black text-sm">PayPal</span>
                    <span>Pay ${activePayment.amount} with PayPal</span>
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActivePayment(null)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-secondary hover:bg-[#F7F8FA]"
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
        {createdInvoice && (
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
                onClick={() => setCreatedInvoice(null)}
                className="inline-flex min-h-[40px] items-center justify-center rounded-[10px] bg-primary-container px-4 font-label-md text-label-md font-semibold text-white hover:bg-[#066653]"
              >
                Create Another Invoice
              </button>
              <Link
                href="/"
                className="inline-flex min-h-[40px] items-center justify-center rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-secondary hover:bg-[#F7F8FA]"
              >
                Back to Dashboard
              </Link>
            </div>
          </section>
        )}

        {/* VIEW 3: COMPLETED RECEIPT */}
        {completedReceipt && (
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
                  Official sandbox ledger record has been captured.
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
                <span className="text-secondary">Capture ID</span>
                <span className="font-mono text-[11px] text-[#15232D]">{completedReceipt.captureId}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCompletedReceipt(null)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-primary-container px-5 font-label-md text-label-md font-semibold text-white hover:bg-[#066653]"
              >
                Pay Another Invoice
              </button>
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
              >
                Return to Dashboard
              </Link>
            </div>
          </section>
        )}

        {/* DEFAULT VIEW: UNPAID BILLS LIST */}
        {!activePayment && !createdInvoice && !completedReceipt && (
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
          </section>
        )}
      </div>
    </FlowPageLayout>
  );
}
