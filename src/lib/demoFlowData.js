export const FLOW_STAGES = [
  {
    number: 1,
    title: "Capture",
    subtitle: "Intent & request",
    icon: "record_voice_over",
  },
  {
    number: 2,
    title: "Safety check",
    subtitle: "AI match & rules",
    icon: "verified_user",
  },
  {
    number: 3,
    title: "Review & confirm",
    subtitle: "Approve payment",
    icon: "fact_check",
  },
  {
    number: 4,
    title: "Result",
    subtitle: "Receipt & log",
    icon: "receipt_long",
  },
];

export const TONE = {
  clear: {
    text: "text-[#107E3E]",
    bg: "bg-[#EAF7F1]",
    border: "border-[#A7F3D0]",
    solid: "bg-[#107E3E]",
    icon: "check_circle",
    label: "CLEAR",
    chip: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
    hero: "bg-[#F3FBF7] border-[#A7F3D0]",
  },
  review: {
    text: "text-[#B45309]",
    bg: "bg-[#FEF3C7]",
    border: "border-[#FDE68A]",
    solid: "bg-[#B45309]",
    icon: "warning",
    label: "REVIEW",
    chip: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
    hero: "bg-[#FFFBEB] border-[#FDE68A]",
  },
  blocked: {
    text: "text-[#DC2626]",
    bg: "bg-[#FEE2E2]",
    border: "border-[#FECACA]",
    solid: "bg-[#DC2626]",
    icon: "block",
    label: "BLOCKED",
    chip: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
    hero: "bg-[#FFF5F5] border-[#FECACA]",
  },
  pending: {
    text: "text-[#1D4ED8]",
    bg: "bg-[#EFF6FF]",
    border: "border-[#BFDBFE]",
    solid: "bg-[#1D4ED8]",
    icon: "schedule",
    label: "PENDING",
    chip: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
    hero: "bg-[#F5F9FF] border-[#BFDBFE]",
  },
  neutral: {
    text: "text-[#4B5563]",
    bg: "bg-[#F3F4F6]",
    border: "border-[#E5E7EB]",
    solid: "bg-[#6B7280]",
    icon: "cancel",
    label: "CANCELLED",
    chip: "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]",
    hero: "bg-[#FAFAFA] border-[#E5E7EB]",
  },
  unknown: {
    text: "text-[#7E22CE]",
    bg: "bg-[#F3E8FF]",
    border: "border-[#E9D5FF]",
    solid: "bg-[#7E22CE]",
    icon: "help",
    label: "UNKNOWN",
    chip: "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]",
    hero: "bg-[#FCF7FF] border-[#E9D5FF]",
  },
};

export const DEMO_PAYMENT = {
  checkId: "chk_demo_204",
  transactionId: "txn_demo_204",
  merchant: "GreenLeaf Demo Store",
  merchantId: "mer_990142",
  merchantInitials: "GL",
  amount: "USD 12.50",
  currency: "USD",
  amountMinor: 1250,
  reference: "GL-204",
  purpose: "Organic matcha starter kit",
  orderId: "ORDER-DEMO-204",
  captureId: "CAPTURE-DEMO-204",
  confirmedAt: "24 May 2024, 14:32:08 UTC",
  confirmationMethod: "Voice — heard “pay now”",
  voiceTranscript:
    "I intend to pay USD 12.50 to GreenLeaf Demo Store for invoice GL-204.",
  requestSnippet:
    "Invoice GL-204 · GreenLeaf Demo Store (mer_990142) · Amount due USD 12.50 · Organic matcha starter kit",
};

const CLEAR_COMPARISON = [
  {
    field: "Recipient",
    intent: "GreenLeaf Demo Store",
    request: "GreenLeaf Demo Store (mer_990142)",
    result: "Exact merchant match",
    status: "match",
  },
  {
    field: "Amount",
    intent: "USD 12.50",
    request: "USD 12.50",
    result: "No difference",
    status: "match",
  },
  {
    field: "Currency",
    intent: "USD",
    request: "USD",
    result: "Supported currency",
    status: "match",
  },
  {
    field: "Reference",
    intent: "GL-204",
    request: "GL-204",
    result: "Unused reference",
    status: "match",
  },
];

const CLEAR_SECURITY = [
  {
    label: "Merchant on allowlist",
    detail: "GreenLeaf Demo Store is an approved merchant",
    result: "PASS",
  },
  {
    label: "Merchant active",
    detail: "Sandbox account is active and accepting payments",
    result: "PASS",
  },
  {
    label: "Duplicate reference",
    detail: "GL-204 has not been paid before",
    result: "PASS",
  },
  {
    label: "Within transaction limit",
    detail: "USD 12.50 is inside the demo workspace limit",
    result: "PASS",
  },
  {
    label: "Currency supported",
    detail: "USD is enabled for PayPal Sandbox",
    result: "PASS",
  },
];

export const CHECK_STATES = {
  CLEAR: {
    key: "CLEAR",
    tone: "clear",
    statusLabel: "CLEAR",
    checkId: DEMO_PAYMENT.checkId,
    title: "AI Match & Safety Check",
    tagline: "Compare your intent with the payment request and inspect the safety result.",
    heroTitle: "All details match. This payment is clear.",
    heroReason:
      "Recipient, amount, currency and reference match the payment request exactly.",
    noOrderNote: "",
    readOnly: false,
    payment: DEMO_PAYMENT,
    comparison: CLEAR_COMPARISON,
    security: CLEAR_SECURITY,
    spam: {
      result: "PASS",
      title: "No spam signals",
      detail:
        "Formatting, sender patterns and invoice frequency are within normal demo tolerances.",
    },
    scam: {
      result: "PASS",
      title: "No scam signals",
      detail:
        "No urgency wording, payment redirection or suspicious links were found.",
    },
    explanation:
      "Both sources describe the same payment. The merchant is approved, the amount and currency match, and the invoice reference has not been paid before.",
    remediations: [],
    auditCount: 6,
  },
  REVIEW: {
    key: "REVIEW",
    tone: "review",
    statusLabel: "REVIEW",
    checkId: "chk_demo_205",
    title: "AI Match & Safety Check",
    tagline: "Some details need your attention before this payment can continue.",
    heroTitle: "Some details need your attention before you can pay.",
    heroReason:
      "The recipient name differs slightly from the registered merchant and the invoice reference is missing from your intent.",
    noOrderNote: "No PayPal order has been created.",
    readOnly: false,
    payment: {
      ...DEMO_PAYMENT,
      checkId: "chk_demo_205",
      merchant: "Aura Cloud Hosting LLC",
      merchantInitials: "AC",
      amount: "USD 125.00",
      amountMinor: 12500,
      reference: "AC-901",
      purpose: "Cloud hosting renewal",
    },
    comparison: [
      {
        field: "Recipient",
        intent: "Aura Cloud Services",
        request: "Aura Cloud Hosting LLC (mer_182903)",
        result: "Alias mismatch",
        status: "warn",
      },
      {
        field: "Amount",
        intent: "USD 125.00",
        request: "USD 125.00",
        result: "No difference",
        status: "match",
      },
      {
        field: "Currency",
        intent: "USD",
        request: "USD",
        result: "Supported currency",
        status: "match",
      },
      {
        field: "Reference",
        intent: "Not provided (omitted in voice)",
        request: "AC-901",
        result: "Needs clarification",
        status: "warn",
      },
    ],
    security: [
      {
        label: "Merchant on allowlist",
        detail: "Spoken trading name does not exactly match the registered entity",
        result: "WARN",
      },
      {
        label: "Merchant active",
        detail: "Aura Cloud Hosting LLC is active in the sandbox",
        result: "PASS",
      },
      {
        label: "Duplicate reference",
        detail: "No prior settlement for AC-901",
        result: "PASS",
      },
      {
        label: "Within transaction limit",
        detail: "USD 125.00 is inside the demo workspace limit",
        result: "PASS",
      },
      {
        label: "Currency supported",
        detail: "USD is enabled for PayPal Sandbox",
        result: "PASS",
      },
    ],
    spam: {
      result: "PASS",
      title: "No spam signals",
      detail: "No bulk or repeated template patterns were detected.",
    },
    scam: {
      result: "WARN",
      title: "1 scam signal",
      detail:
        "The spoken trading name differs from the registered merchant account name.",
    },
    explanation:
      "Your spoken intent used a shorter trading name and did not include the invoice reference. Review the merchant and provide reference AC-901 before re-running the check.",
    remediations: [
      "Confirm “Aura Cloud Hosting LLC” is the intended payee.",
      "Add invoice reference AC-901 to your intent.",
    ],
    auditCount: 7,
  },
  BLOCKED: {
    key: "BLOCKED",
    tone: "blocked",
    statusLabel: "BLOCKED",
    checkId: "chk_demo_202",
    title: "AI Match & Safety Check",
    tagline: "A hard rule stopped this payment before any PayPal order was created.",
    heroTitle: "Payment blocked. No PayPal order was created.",
    heroReason:
      "The merchant is not approved, the requested amount is higher than your intent, and the reference has already been paid.",
    noOrderNote: "No PayPal order has been created. Nothing was charged.",
    readOnly: false,
    payment: {
      ...DEMO_PAYMENT,
      checkId: "chk_demo_202",
      merchant: "Untrusted Escrow Node 7",
      merchantInitials: "UE",
      amount: "USD 500.00",
      amountMinor: 50000,
      reference: "ESC-312",
      purpose: "Release fee",
    },
    comparison: [
      {
        field: "Recipient",
        intent: "Untrusted Escrow Node 7",
        request: "Untrusted Escrow Node 7 (mer_664120)",
        result: "Merchant not approved",
        status: "block",
      },
      {
        field: "Amount",
        intent: "USD 50.00",
        request: "USD 500.00",
        result: "+USD 450.00 difference",
        status: "block",
      },
      {
        field: "Currency",
        intent: "USD",
        request: "USD",
        result: "Supported currency",
        status: "match",
      },
      {
        field: "Reference",
        intent: "ESC-312",
        request: "ESC-312",
        result: "Reference already paid",
        status: "block",
      },
    ],
    security: [
      {
        label: "Merchant on allowlist",
        detail: "Untrusted Escrow Node 7 is not an approved demo merchant",
        result: "FAIL",
      },
      {
        label: "Merchant active",
        detail: "Account is unverified in the merchant registry",
        result: "FAIL",
      },
      {
        label: "Duplicate reference",
        detail: "ESC-312 already has a completed sandbox payment",
        result: "FAIL",
      },
      {
        label: "Within transaction limit",
        detail: "USD 500.00 exceeds the demo workspace limit",
        result: "FAIL",
      },
      {
        label: "Currency supported",
        detail: "USD is enabled for PayPal Sandbox",
        result: "PASS",
      },
    ],
    spam: {
      result: "PASS",
      title: "No spam signals",
      detail: "No bulk or unsolicited message patterns were detected.",
    },
    scam: {
      result: "FAIL",
      title: "2 scam signals",
      detail:
        "The request asks for payment outside PayPal and uses urgency wording to pressure approval.",
    },
    explanation:
      "Deterministic safety rules blocked this payment. The merchant is not approved, the amount is USD 450.00 higher than you intended, and reference ESC-312 was already paid. No PayPal order was created.",
    remediations: [
      "Correct the recipient to an approved merchant.",
      "Re-check the amount against the original request.",
      "Use an unpaid invoice reference.",
    ],
    auditCount: 8,
  },
  HISTORICAL: {
    key: "HISTORICAL",
    tone: "neutral",
    statusLabel: "HISTORICAL",
    icon: "archive",
    checkId: "chk_demo_201",
    title: "AI Match & Safety Check",
    tagline: "Historical check opened from History. This record is read-only.",
    heroTitle: "Historical record — read only.",
    heroReason:
      "This check was cleared on 23 May 2024. The payment was later cancelled by voice at confirmation.",
    noOrderNote:
      "Read-only archive. No action can move this attempt forward.",
    readOnly: true,
    payment: {
      ...DEMO_PAYMENT,
      checkId: "chk_demo_201",
      transactionId: "txn_demo_201",
      merchant: "Artisan Roast Roastery",
      merchantInitials: "AR",
      amount: "USD 34.00",
      amountMinor: 3400,
      reference: "AR-118",
      purpose: "Coffee beans subscription",
    },
    comparison: [
      {
        field: "Recipient",
        intent: "Artisan Roast Roastery",
        request: "Artisan Roast Roastery (mer_551203)",
        result: "Exact merchant match",
        status: "match",
      },
      {
        field: "Amount",
        intent: "USD 34.00",
        request: "USD 34.00",
        result: "No difference",
        status: "match",
      },
      {
        field: "Currency",
        intent: "USD",
        request: "USD",
        result: "Supported currency",
        status: "match",
      },
      {
        field: "Reference",
        intent: "AR-118",
        request: "AR-118",
        result: "Unused reference",
        status: "match",
      },
    ],
    security: CLEAR_SECURITY.map((item) => ({
      ...item,
      detail: item.detail
        .replace("GreenLeaf Demo Store", "Artisan Roast Roastery")
        .replace("GL-204", "AR-118")
        .replace("USD 12.50", "USD 34.00"),
    })),
    spam: {
      result: "PASS",
      title: "No spam signals",
      detail: "Archived scan found no spam patterns.",
    },
    scam: {
      result: "PASS",
      title: "No scam signals",
      detail: "Archived scan found no scam patterns.",
    },
    explanation:
      "This attempt passed the safety check and was logged. The user cancelled the payment at the confirmation stage, so no PayPal order was created.",
    remediations: [],
    auditCount: 9,
  },
};

export const CHECK_ID_STATE = {
  chk_demo_204: "CLEAR",
  chk_demo_205: "REVIEW",
  chk_demo_203: "REVIEW",
  chk_demo_202: "BLOCKED",
  chk_demo_201: "HISTORICAL",
  chk_demo_200: "HISTORICAL",
};

export function checkStateForId(checkId) {
  return CHECK_STATES[CHECK_ID_STATE[checkId]] || CHECK_STATES.CLEAR;
}

export const RESULT_STATES = {
  completed: {
    key: "completed",
    label: "Completed",
    tone: "clear",
    icon: "check_circle",
    statusLabel: "COMPLETED",
    heroTitle: "Payment completed (Sandbox)",
    heroLine:
      "The backend verified the PayPal capture before this receipt was shown.",
    subline: "Verified by the server · Sandbox only · No real money moved",
    showReceipt: true,
    readAloud:
      "Payment completed in Sandbox. USD 12.50 to GreenLeaf Demo Store for invoice GL-204.",
    primaryAction: { label: "Print / save receipt", icon: "print" },
    secondaryActions: [
      { label: "New payment check", icon: "add", href: "/new-check" },
      { label: "View details", icon: "receipt_long", href: "/transactions/txn_demo_204" },
      { label: "History", icon: "history", href: "/history" },
    ],
  },
  pending: {
    key: "pending",
    label: "Capture pending",
    tone: "pending",
    icon: "schedule",
    statusLabel: "CAPTURE_PENDING",
    heroTitle: "Payment is being confirmed",
    heroLine:
      "PayPal has approved the payment and SayPay is waiting for the server to verify the capture.",
    subline: "Auto-refresh runs for up to 30 seconds. Do not pay again.",
    showReceipt: false,
    readAloud:
      "Your payment is being confirmed. Do not pay again while SayPay checks the capture with PayPal.",
    primaryAction: { label: "View history", icon: "history", href: "/history" },
    secondaryActions: [
      { label: "Check status with PayPal", icon: "sync", href: "/result/txn_demo_pending" },
    ],
  },
  cancelled_confirm: {
    key: "cancelled_confirm",
    label: "Cancelled at confirmation",
    tone: "neutral",
    icon: "cancel",
    statusLabel: "CANCELLED",
    heroTitle: "You cancelled this payment — nothing was paid",
    heroLine:
      "You cancelled at the confirmation step before a PayPal order was created.",
    subline: "Cancelled at confirmation (by voice) · This attempt was logged",
    showReceipt: false,
    readAloud:
      "You cancelled this payment at confirmation. Nothing was paid. This attempt was logged.",
    primaryAction: {
      label: "Start a new check with the same details",
      icon: "replay",
      href: "/new-check",
    },
    secondaryActions: [{ label: "History", icon: "history", href: "/history" }],
  },
  failed: {
    key: "failed",
    label: "Failed",
    tone: "blocked",
    icon: "error",
    statusLabel: "FAILED",
    heroTitle: "Payment failed — no money moved",
    heroLine:
      "PayPal could not complete the capture. SayPay has recorded the failure for reconciliation.",
    subline: "No receipt was issued. Nothing was charged in Sandbox.",
    showReceipt: false,
    readAloud:
      "The payment failed. No money moved. You can start a new payment check.",
    primaryAction: {
      label: "Start a new check",
      icon: "replay",
      href: "/new-check",
    },
    secondaryActions: [{ label: "History", icon: "history", href: "/history" }],
  },
  cancelled_paypal: {
    key: "cancelled_paypal",
    label: "Cancelled in PayPal",
    tone: "neutral",
    icon: "cancel",
    statusLabel: "CANCELLED",
    heroTitle: "You cancelled this payment — nothing was paid",
    heroLine:
      "The PayPal approval window was closed before the buyer approved the payment.",
    subline: "Cancelled in PayPal · Nothing was captured",
    showReceipt: false,
    readAloud:
      "You cancelled this payment in PayPal. Nothing was paid. This attempt was logged.",
    primaryAction: {
      label: "Start a new check with the same details",
      icon: "replay",
      href: "/new-check",
    },
    secondaryActions: [{ label: "History", icon: "history", href: "/history" }],
  },
};

export const RESULT_ROUTES = [
  { id: "txn_demo_204", key: "completed", label: "Completed" },
  { id: "txn_demo_pending", key: "pending", label: "Capture pending" },
  {
    id: "txn_demo_cancelled_confirm",
    key: "cancelled_confirm",
    label: "Cancelled at confirmation",
  },
  { id: "txn_demo_failed", key: "failed", label: "Failed" },
  {
    id: "txn_demo_cancelled_paypal",
    key: "cancelled_paypal",
    label: "Cancelled in PayPal",
  },
];

export function resultStateForId(transactionId) {
  const match = RESULT_ROUTES.find((route) => route.id === transactionId);
  return RESULT_STATES[match?.key || "completed"];
}

export const FLOW_DEMO_LINKS = [
  {
    group: "Stage 1 · Capture",
    links: [
      { label: "Start", href: "/new-check" },
      { label: "Clarification", href: "/new-check/clarify" },
      { label: "Listening", href: "/new-check/listening" },
      { label: "AI failure", href: "/new-check/failure" },
    ],
  },
  {
    group: "Stage 2 · Safety check",
    links: [
      { label: "Review", href: "/new-check/review" },
      { label: "Clear", href: "/checks/chk_demo_204" },
      { label: "Blocked", href: "/new-check/blocked" },
      { label: "Historical", href: "/new-check/historical" },
    ],
  },
  {
    group: "Stage 3 · Review & confirm",
    links: [
      { label: "Review payment", href: "/checkout/chk_demo_204" },
      { label: "Confirm", href: "/checkout/chk_demo_204/confirm" },
      { label: "PayPal", href: "/checkout/chk_demo_204/pay" },
    ],
  },
  {
    group: "Stage 4 · Result",
    links: [
      { label: "Completed", href: "/result/txn_demo_204" },
      { label: "Capture pending", href: "/result/txn_demo_pending" },
      {
        label: "Cancelled at confirmation",
        href: "/result/txn_demo_cancelled_confirm",
      },
      { label: "Failed", href: "/result/txn_demo_failed" },
      {
        label: "Cancelled in PayPal",
        href: "/result/txn_demo_cancelled_paypal",
      },
    ],
  },
];
