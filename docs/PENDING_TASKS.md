# SayPay — Master Pending Tasks & Implementation Ledger

This document tracks all user requirements from the prompt dated 2026-11-12 across Dashboard, History, and `/new-check` Conversational Gateway.

---

## Active Task Punch List (Execute One by One with Playwright Verification)

- [x] **REQ-01: Universal Invoice Querying by Date, Status (PAID vs UNPAID), and Details**
  - Expanded `processAssistantRequest`, `callGroqAssistant`, and `heuristicAssistant` in `src/lib/assistant.js` to load all invoices (`allInvoices`, `unpaidInvoices`, `paidInvoices`).
  - Echo can now answer any query: "Is GL-1042 paid?", "Check invoice TN-2210", "Show paid invoices", "What invoices are due in November?", "How much did I pay to TechNova?", and reports full details conversationally with real database verification.

- [x] **REQ-02: End of Conversation Stops Voice Loop Without Retriggering**
  - Updated `VoiceAssistPanel.js` so that conversational exit phrases ("bye", "goodbye", "stop", "cancel", "thank you", "thanks", "ok thanks bye", "that's all") permanently set `continuousListeningRef.current = false` and invoke `safeStop()`.
  - Added guards in `speakSoftly`'s `onEnd` callback to ensure recognition is never re-triggered when conversation has ended or when in Stage 3.

- [x] **REQ-03: PayPal Payment Review Stage (Stage 3) Disables Mic for Manual Approval**
  - In `VoiceAssistPanel.js`, when `stage === 3` or when payment preparation finishes, microphone is automatically stopped (`continuousListeningRef.current = false; safeStop(); setListening(false);`).
  - `safeStart` is explicitly blocked in Stage 3, displaying "MatchCheck Verified · Manual authorization required", ensuring the human user must manually click "Pay with PayPal".

- [x] **REQ-04: Echo Explains Safety Check Status Aloud to User**
  - When safety screening finishes and advances to Stage 3 MatchCheck card, Echo automatically speaks the safety verdict aloud to the user using `speakSoftly`, stating verified merchant, amount, reference match, duplicate check status, and prompt to authorize.

- [x] **REQ-05: History Page Automatic Fresh Fetch, Live Loader, and Empty State**
  - In `src/app/history/page.js`:
    - Auto-fetches latest records on mount with cache-busting `cache: "no-store"` and timestamp query.
    - Displays a centered spinner and loading text while synchronizing with MongoDB Atlas.
    - If no records match search/filter or if collection is empty, displays a polished "No records found" empty state with clear filters button.

- [x] **REQ-06: Full-Screen Logout Loading Overlay Including Navbar**
  - In `src/components/layout/TopNavbar.js`: Added `isLoggingOut` state. When logout is clicked, renders a full-screen overlay (`fixed inset-0 z-50 bg-white/95 backdrop-blur-sm`) covering the entire screen including the navbar and banner with "Signing out..." spinner and text, then redirects to `/login`.

- [x] **REQ-07: Route Protection for Unauthenticated Users**
  - In `src/components/layout/AppShell.js`: Added route guard with `useDemoSession()`. If an unauthenticated user attempts to visit any protected route (`/`, `/new-check`, `/history`, `/checks/*`, etc.), they are immediately blocked with an authenticating screen and redirected to `/login`.

- [x] **REQ-08: Merchant-Specific Stepper & Process Stages**
  - In `src/lib/demoFlowData.js`: Defined `MERCHANT_FLOW_STAGES`:
    1. Capture (Billing details)
    2. Validation (Items & tax check)
    3. Review & Issue (Confirm & create)
    4. Dispatched (Invoice sent & logged)
  - Updated `FlowStepper.js`, `FlowPageLayout.js`, and `new-check/page.js` to accept `role={isSeller ? "seller" : "buyer"}` and render merchant-tailored flow titles, subtitles, chips, and progression states.

---

- [x] **TASK-01: Fix `/api/paypal/create-order` 404 from Unpaid Invoice List & Proper Error String Formatting**
  - Bug: Clicking "Review & Pay" on the unpaid invoices list passed a dummy `chk_` ID that was never saved to MongoDB, causing a 404 in `create-order`.
  - Fix: Wired "Review & Pay" to call `/api/assistant` with `{ context: { selectedInvoiceId: inv.invoiceId } }` so a real, verified `PaymentCheck` is created in MongoDB before displaying the MatchCheck card. Added atomic fallback upsert in `/api/paypal/create-order/route.js` so any unpersisted `chk_` or invoice reference is auto-created.
  - Defensively formatted error objects across client & server so `[object Object]` is never rendered or spoken.

- [x] **TASK-02: Strict Invoice Marking to `PAID` on Capture & Instant UI Refresh**
  - PayPal capture route (`/api/paypal/capture-order/route.js`) updates all matching invoice IDs (`paymentCheck.invoiceId` and `transaction.reference`) in MongoDB to `PAID`.
  - Instantly removes paid invoices from client state in `/new-check` and refreshes dashboard stats.

- [x] **TASK-03: Rename AI Assistant to "Echo" Across All Pages**
  - Renamed "SayPay Assist" to "Echo" in UI headers, badges, transcript bubbles, greetings, and AI system prompts.

- [x] **TASK-04: Remove Language Switch Buttons (EN, ES, FR, DE)**
  - Removed language selector buttons from both the dashboard and `/new-check` assistant card headers.

- [x] **TASK-05: Robust Continuous Voice AI ("Echo") & Mute Button**
  - Eliminated `[object SpeechRecognitionErrorEvent]` bug and browser recognition collisions:
    - Single recognition instance lifecycle with `isRunningRef` and `safeStart()` / `safeStop()`.
    - Ignored benign errors (`no-speech`, `aborted`).
    - Added delay coordination with `speakSoftly` so microphone resumes cleanly after Echo finishes speaking.
  - Added dedicated Mute/Unmute toggle button and state.
  - Supported conversational exit triggers ("stop", "wait", "hold on", "pause", "bye", "cancel", "that's all", "ok thanks bye").
  - Auto-executes utterance on pause without manual submission.

- [x] **TASK-06: Voice-Read Errors & Warnings to User**
  - When an error or security warning occurs (e.g. PayPal failure, duplicate payment, untrusted merchant), Echo speaks the error aloud using `speakSoftly`.

- [x] **TASK-07: Synchronize Dashboard Voice Assistant Capabilities with `/new-check`**
  - Wired Echo voice assistant on the dashboard to store prepared payments in `sessionStorage` and seamlessly transition to `/new-check` Stage 3 Review & Confirm.

- [x] **TASK-08: Playwright Verification**
  - Created end-to-end test suite (`tests/echo-conversational-gateway.spec.js`) covering Echo branding, mute toggle, unpaid invoice screening, PayPal 1-click payment, duplicate payment blocking, conversational intent, and dashboard integration. Build verified with exit code 0.

---

## Completed Tasks Archive

- [x] **DB-01**: Skeleton-Only Loading After Login
- [x] **DB-02**: TopNavbar Cleanup
- [x] **DB-03**: Live Interactive AI Voice Assistant on Dashboard
- [x] **DB-04**: Recent Transactions Table Consistency with AG Grid
- [x] **HIST-01**: Purge Mock Records — Real DB Transactions Only
- [x] **HIST-02**: Export to CSV Functionality
- [x] **HIST-03**: Real-Time Table Filtering & Search
- [x] **NC-01**: Two-Track Safety Flow (Buyer vs Merchant)
- [x] **NC-02**: Automatic Multi-Step Progression with Timed Transitions
- [x] **NC-03**: Real Security, Scam & Untrusted Merchant Screening
- [x] **NC-04**: Strict Invoice Status Filtering (Unpaid vs Paid)
- [x] **NC-07**: Active Listening Visual State (Full Div Glow)
- [x] **NC-08**: Authoritative PayPal Sandbox Verification
- [x] **NC-09**: Bulk Invoice Payment by Voice & Text
- [x] **NC-10**: Date/Time & Context Queries
