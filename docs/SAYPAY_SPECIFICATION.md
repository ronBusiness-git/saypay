# SAYPAY — MVP Product & Technical Specification

> **Product Promise**: *Say it. Check it. Pay with confidence.*  
> A voice-first payment safety companion that compares what a user intends to pay with the details in a payment request, explains mismatches, and lets the user approve a PayPal Sandbox checkout.

---

## 1. Project Overview & Boundaries

- **Core Differentiator — MatchCheck**: Two-source verification comparing the user's stated intent (voice transcript or typed) against the received request (pasted text), field-by-field, using deterministic backend code before any PayPal order can be created.
- **Tech Stack**:
  - **Frontend**: Next.js App Router (JavaScript / React) — **STRICT: No TypeScript (.ts/.tsx)**. Use `.js` / `.jsx`.
  - **Backend**: Next.js Route Handlers on Node.js runtime.
  - **Database**: MongoDB + Mongoose (or native driver).
  - **AI Engine**: Gemini API called exclusively from server routes.
  - **Voice Input**: Browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) where supported, with mandatory typed fallback.
  - **Payments**: PayPal JavaScript SDK buttons + Orders v2 REST API (**Sandbox Only**).
  - **Deployment**: Render / Node-compatible HTTPS host.
- **Security Boundaries**:
  - `PAYPAL_CLIENT_SECRET`, `GEMINI_API_KEY`, and OAuth access tokens must **never** be exposed to the client or committed.
  - Client only receives `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to render PayPal SDK buttons.
  - The AI model must **never** authorize payments, decide if payment is safe, alter amounts, or directly call PayPal.
  - The browser must **never** calculate the authoritative payable amount or decide safety.

---

## 2. Directory Structure

Following the official specification (using Next.js `src/` convention mapped via `@/*`):

```text
saypay/
├── src/
│   ├── app/
│   │   ├── (product)/
│   │   │   ├── page.js                      # Dashboard / Home
│   │   │   ├── new-check/page.js            # New Payment Check
│   │   │   ├── checks/[checkId]/page.js     # MatchCheck Results
│   │   │   ├── checkout/[checkId]/page.js   # Final Review & Pay
│   │   │   ├── result/[transactionId]/page.js # Payment Result / Receipt
│   │   │   ├── history/page.js              # Transaction History
│   │   │   └── transactions/[transactionId]/page.js # Transaction Detail
│   │   └── api/
│   │       ├── intent/parse/route.js        # Parse voice/text intent via Gemini
│   │       ├── request/parse/route.js       # Parse pasted payment request via Gemini
│   │       ├── payment/check/route.js       # Run deterministic MatchCheck
│   │       ├── paypal/create-order/route.js # Server creates PayPal Orders v2
│   │       ├── paypal/capture-order/route.js# Server captures PayPal order
│   │       └── transactions/route.js        # List / filter transactions
│   ├── components/
│   │   ├── VoiceInput.js
│   │   ├── RequestPasteForm.js
│   │   ├── MatchCheckPanel.js
│   │   ├── SafetyStatusBadge.js
│   │   ├── PayPalCheckoutButton.js
│   │   └── TransactionTable.js
│   ├── lib/
│   │   ├── db.js                            # MongoDB connection
│   │   ├── gemini.js                        # Gemini SDK wrapper & structured extraction
│   │   ├── schemas.js                       # Validation schemas
│   │   ├── matchcheck.js                    # Deterministic MatchCheck engine
│   │   ├── paypal.js                        # PayPal OAuth & Orders v2 helpers
│   │   ├── money.js                         # Exact minor unit currency utilities
│   │   └── errors.js                        # Standard error handling
│   └── models/
│       ├── Merchant.js                      # Seeded demo merchant allowlist
│       ├── PaymentCheck.js                  # Payment check verification attempts
│       ├── Transaction.js                   # Payment transactions & audit log
│       └── DemoSettings.js                  # Demo preferences & workspace settings
├── scripts/
│   └── seed-demo-data.js                    # Demo merchants and settings seeder
├── docs/
│   └── SAYPAY_SPECIFICATION.md
├── .env.example
├── README.md
└── package.json
```

---

## 3. Environment Variables

| Variable | Where Used | Purpose / Value |
|---|---|---|
| `MONGODB_URI` | Server | MongoDB connection string |
| `GEMINI_API_KEY` | Server only | Google Gemini API key (never expose to client) |
| `GEMINI_MODEL` | Server | Model name (e.g. `gemini-2.0-flash` or `gemini-1.5-flash`) |
| `PAYPAL_ENV` | Server | `sandbox` |
| `PAYPAL_CLIENT_ID` | Client + Server | PayPal Sandbox Client ID |
| `PAYPAL_CLIENT_SECRET` | Server only | PayPal Sandbox Client Secret |
| `PAYPAL_BASE_URL` | Server | `https://api-m.sandbox.paypal.com` |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Browser SDK | Public PayPal Client ID for SDK button rendering |
| `APP_BASE_URL` | Server | Deployed base URL for redirects/callbacks |

---

## 4. Data Models & Schemas

### MongoDB Models:

1. **Merchant (`merchants`)**:
   - `merchantKey` (String, unique, indexed): e.g., `greenleaf-demo-store`
   - `displayName` (String): e.g., `"GreenLeaf Demo Store"`
   - `normalizedAliases` ([String]): e.g., `["greenleaf", "green leaf", "greenleaf store"]`
   - `status` (String): `'ACTIVE'` | `'INACTIVE'`
   - `allowedCurrencies` ([String]): e.g., `["USD"]`
   - `createdAt` (Date)

2. **PaymentCheck (`paymentChecks`)**:
   - `checkId` (String, unique, indexed): UUID or nanoid
   - `workspaceId` (String, default: `"demo-workspace"`)
   - `intent` (Object): `{ recipientName, merchantKey, amount, currency, reference, purpose, needsClarification }`
   - `request` (Object): `{ recipientName, amount, currency, reference, purpose, warningIndicators }`
   - `comparison` (Object): field-by-field check breakdown
   - `status` (String): `'CLEAR'` | `'REVIEW'` | `'BLOCKED'`
   - `canCreateOrder` (Boolean): `true` only when `status === 'CLEAR'`
   - `reasonCodes` ([String]): list of codes e.g. `["AMOUNT_MISMATCH"]`
   - `promptVersion` (String)
   - `modelName` (String)
   - `createdAt` (Date)
   - `expiresAt` (Date)

3. **Transaction (`transactions`)**:
   - `transactionId` (String, unique, indexed)
   - `checkId` (String, unique, indexed)
   - `merchantKey` (String, indexed)
   - `amountMinor` (Number): e.g. 1250 for $12.50
   - `currency` (String): e.g. `"USD"`
   - `reference` (String, indexed)
   - `paypalOrderId` (String, unique sparse, indexed)
   - `captureId` (String)
   - `createRequestId` (String): Idempotency key for PayPal create order
   - `captureRequestId` (String): Idempotency key for PayPal capture order
   - `paymentStatus` (String): State machine status
   - `paypalStatus` (String): Status returned by PayPal API
   - `createdAt`, `updatedAt` (Date)
   - Compound index: `{ merchantKey: 1, reference: 1 }` to prevent duplicate payments.

4. **DemoSettings (`demoSettings`)**:
   - `workspaceId` (String, unique)
   - `currency` (String, default: `"USD"`)
   - `transactionLimitMinor` (Number, default: 50000 = $500.00)
   - `updatedAt` (Date)

---

## 5. MatchCheck Engine & Deterministic Rules

The function `evaluatePaymentCheck(intent, request, merchant, settings, priorTransactions)` returns:

```json
{
  "status": "CLEAR" | "REVIEW" | "BLOCKED",
  "canCreateOrder": false,
  "checks": {
    "recipient": { "status": "MATCH" | "MISMATCH", "reasonCode": null | "RECIPIENT_MISMATCH" },
    "amount": { "status": "MATCH" | "MISMATCH", "reasonCode": null | "AMOUNT_MISMATCH" },
    "currency": { "status": "MATCH" | "MISMATCH", "reasonCode": null | "CURRENCY_MISMATCH" },
    "reference": { "status": "MATCH" | "MISMATCH", "reasonCode": null | "REFERENCE_MISMATCH" },
    "duplicate": { "status": "CLEAR" | "BLOCKED", "reasonCode": null | "DUPLICATE_PAYMENT" },
    "merchant": { "status": "CLEAR" | "BLOCKED", "reasonCode": null | "UNKNOWN_MERCHANT" | "INACTIVE_MERCHANT" }
  },
  "reasonCodes": []
}
```

### Strict Rules:
1. **Money**: Parse decimal string to integer minor units (e.g. `$12.50` -> `1250`). Exact integer comparison. **Never use floating point equality**.
2. **Currency**: Exact uppercase 3-letter ISO match against configured demo currency (`USD`).
3. **Recipient**: Server-side lookup against seeded `Merchant` records via `normalizedAliases`. Ambiguous or unlisted merchants cannot be `CLEAR`.
4. **Reference**: Case & whitespace normalized. If a completed transaction exists for `merchantKey` + `reference`, status is `BLOCKED` with `DUPLICATE_PAYMENT`.
5. **Missing/Ambiguous Data**: Sets status to `REVIEW`. Order creation is disabled.
6. **Hard Mismatch / Inactive / Duplicate**: Sets status to `BLOCKED`.
7. **Only `CLEAR` allows `canCreateOrder = true`**. Users cannot click through a `BLOCKED` check.

---

## 6. Payment State Machine & PayPal Integration

### State Transitions:
`CHECKED_CLEAR` → `ORDER_CREATED` → `BUYER_APPROVED` → `CAPTURE_PENDING` → `COMPLETED` / `FAILED` / `CANCELLED` / `UNKNOWN`

### PayPal REST Endpoints (Orders v2):
1. **OAuth 2.0**: `POST /v1/oauth2/token` with HTTP Basic Auth (Client ID + Secret). Token cached in-memory server-side.
2. **Create Order**: `POST /v2/checkout/orders`
   - `intent`: `"CAPTURE"`
   - Server reloads check from MongoDB and uses authoritative `amountMinor`, `currency`, and `reference`. Never trusts client values.
   - Header: `PayPal-Request-Id: <createRequestId>` (idempotency).
3. **Capture Order**: `POST /v2/checkout/orders/{id}/capture`
   - Triggered on client `onApprove`.
   - Header: `PayPal-Request-Id: <captureRequestId>`.
4. **Get Order Details (Reconciliation)**: `GET /v2/checkout/orders/{id}`

---

## 7. AI Responsibilities & Prompt Safety

- **Intent Parser** (`POST /api/intent/parse`): Extracts recipient, amount, currency, reference, purpose from user voice/text. Sets `needsClarification` flag if incomplete.
- **Request Parser** (`POST /api/request/parse`): Extracts invoice/request fields from pasted message. Identifies warning flags.
- **Explanation Helper**: Provides plain-English explanation for an already computed rule result (e.g. explaining why an amount mismatched).
- **Security Rule**: Gemini output is treated as **untrusted user input**. Prompts instruct the model to ignore prompt injections in pasted texts. Rule decisions and money comparisons are 100% deterministic code.

---

## 8. Screen Flow & UI Guidelines

1. **Dashboard (`/`)**: Summary stats, "New Payment Check" CTA, recent payment attempts, Demo Lab scenario shortcuts, Sandbox warning badge.
2. **New Payment Check (`/new-check`)**: Voice recording with live transcript, text fallback, paste request box, "Run MatchCheck" action.
3. **MatchCheck Results (`/checks/[checkId]`)**: Side-by-side comparison of user intent vs. merchant request, field status pills, badge (`CLEAR`, `REVIEW`, `BLOCKED`), retry/edit options.
4. **Final Review & Pay (`/checkout/[checkId]`)**: Read-only verified summary, explicit confirmation checkbox, PayPal button render.
5. **Payment Result / Receipt (`/result/[transactionId]`)**: Verified transaction receipt, capture ID, timestamp, PayPal order ID.
6. **Transaction History (`/history`)**: Searchable/filterable list of all checks & transactions.
7. **Transaction Detail (`/transactions/[transactionId]`)**: Full snapshot, comparison audit, rule logs, receipt.
