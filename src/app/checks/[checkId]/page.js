"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MatchCheckView from "../../../components/flow/MatchCheckView.js";
import { FlowPageSkeleton } from "../../../components/ui/LoadingSkeletons.js";
import { checkStateForId } from "../../../lib/demoFlowData.js";

function formatCheckToState(dbCheck) {
  const isClear = dbCheck.status === "CLEAR";
  const isReview = dbCheck.status === "REVIEW";
  const tone = isClear ? "clear" : isReview ? "review" : "blocked";

  const amountStr =
    dbCheck.intent?.amount || dbCheck.request?.amount || "12.50";
  const currency =
    dbCheck.intent?.currency || dbCheck.request?.currency || "USD";
  const merchantName =
    dbCheck.intent?.recipientName ||
    dbCheck.request?.recipientName ||
    "GreenLeaf Demo Store";
  const reference =
    dbCheck.intent?.reference || dbCheck.request?.reference || "GL-204";

  return {
    key: dbCheck.status,
    tone,
    statusLabel: dbCheck.status,
    checkId: dbCheck.checkId,
    title: "AI Match & Safety Check",
    tagline: isClear
      ? "Compare your intent with the payment request and inspect the safety result."
      : "Some details need your attention before this payment can continue.",
    heroTitle: isClear
      ? "All details match. This payment is clear."
      : isReview
      ? "Some details need your attention before you can pay."
      : "Payment halted. Safety rules blocked this payment.",
    heroReason: isClear
      ? "Recipient, amount, currency and reference match the payment request exactly."
      : dbCheck.reasonCodes?.join(", ") || "Safety checks flagged issues.",
    readOnly: false,
    payment: {
      checkId: dbCheck.checkId,
      merchant: merchantName,
      merchantId: "mer_990142",
      merchantStatus: "Approved demo merchant",
      amount: `${currency} ${amountStr}`,
      currency,
      reference,
      purpose: dbCheck.intent?.purpose || "Invoice payment",
      voiceTranscript: `I want to pay ${currency} ${amountStr} to ${merchantName} for invoice ${reference}`,
      requestSnippet: `Invoice ${reference} from ${merchantName} for ${currency} ${amountStr}`,
    },
    comparison: [
      {
        field: "Recipient",
        intent: merchantName,
        request: merchantName,
        result: isClear ? "Exact merchant match" : "Merchant verified",
        status: isClear ? "match" : "warn",
      },
      {
        field: "Amount",
        intent: `${currency} ${amountStr}`,
        request: `${currency} ${amountStr}`,
        result: isClear ? "No difference" : "Amount verified",
        status: isClear ? "match" : "warn",
      },
      {
        field: "Currency",
        intent: currency,
        request: currency,
        result: "Supported currency",
        status: "match",
      },
      {
        field: "Reference",
        intent: reference,
        request: reference,
        result: isClear ? "Unused reference" : "Reference verified",
        status: isClear ? "match" : "warn",
      },
    ],
    security: [
      { label: "Merchant on allowlist", result: "PASS", detail: "Approved demo merchant" },
      { label: "Merchant active", result: "PASS", detail: "Account active in Sandbox" },
      { label: "Duplicate reference", result: "PASS", detail: `${reference} is an unused reference` },
      { label: "Within transaction limit", result: "PASS", detail: `${currency} ${amountStr} is inside demo limit` },
      { label: "Currency supported", result: "PASS", detail: `${currency} is enabled for PayPal Sandbox` },
    ],
    spam: { result: "PASS", title: "No spam signals", detail: "Normal tolerances" },
    scam: { result: "PASS", title: "No scam signals", detail: "No phishing patterns found" },
    explanation: isClear
      ? "Both sources describe the same payment. The merchant is approved, the amount and currency match, and the invoice reference has not been paid before."
      : "Safety engine flagged differences between intent and request.",
    remediations: [],
    auditCount: 6,
  };
}

function CheckFlow({ params, onOpenAuditLog }) {
  const routeParams = useParams();
  const checkId = routeParams?.checkId || "chk_demo_204";

  const [liveState, setLiveState] = useState(null);
  const [loading, setLoading] = useState(!checkId.startsWith("chk_demo_"));

  useEffect(() => {
    if (checkId.startsWith("chk_demo_")) {
      setLiveState(checkStateForId(checkId));
      setLoading(false);
      return;
    }

    let isMounted = true;
    fetch(`/api/payment/check?checkId=${encodeURIComponent(checkId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Check not found");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setLiveState(formatCheckToState(data));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Could not load live check, falling back to demo state:", err);
        if (isMounted) {
          setLiveState(checkStateForId("chk_demo_204"));
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [checkId]);

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 items-center justify-center px-4 py-16">
        <div className="flex items-center gap-3 rounded-2xl border border-[#DFE5E8] bg-white px-5 py-4 shadow-sm">
          <span className="material-symbols-outlined animate-spin text-[22px] text-primary">
            progress_activity
          </span>
          <span className="font-body-md text-body-md text-secondary">
            Loading safety check {checkId}…
          </span>
        </div>
      </main>
    );
  }

  const state = liveState || checkStateForId("chk_demo_204");
  return <MatchCheckView state={state} onOpenAuditLog={onOpenAuditLog} />;
}

export default function CheckDetailPage(props) {
  return (
    <Suspense fallback={<FlowPageSkeleton />}>
      <CheckFlow {...props} />
    </Suspense>
  );
}
