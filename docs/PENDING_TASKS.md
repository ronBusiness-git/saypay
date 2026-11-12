# SayPay — Master Pending Tasks & Implementation Ledger

This document tracks all user requirements from the prompt dated 2026-11-12 across Dashboard, History, and `/new-check` Conversational Gateway.

---

## Part 1: Dashboard Page (`/`)

- [x] **DB-01: Skeleton-Only Loading After Login**
  - Replaced full-page loading screen with inline skeleton loaders (`PageHeaderSkeleton`, `SummaryCardsSkeleton`, `ChartCardSkeleton`, `GridTableSkeleton`) so navigation is instant and smooth without a jarring full-screen overlay.
- [x] **DB-02: TopNavbar Cleanup**
  - In `TopNavbar.js`: Kept user profile badge & log out button on the right side. Removed the `Ask SayPay` button from the navbar.
- [x] **DB-03: Live Interactive AI Voice Assistant on Dashboard**
  - Replaced dummy `AssistantLiveCard` on the right column of the dashboard with the live, fully interactive `VoiceAssistPanel` connected to `/api/assistant` (same real capability as `/new-check`).
- [x] **DB-04: Recent Transactions Table Consistency with AG Grid**
  - Ensured the table below recent transactions on Dashboard uses the exact same AG Grid styling, columns, and data model as `/history`.

---

## Part 2: History Page (`/history`)

- [x] **HIST-01: Purge Mock Records — Real DB Transactions Only**
  - Database has actual transactions. Eliminated the hardcoded 33 mock records in `src/app/history/page.js`. Displays *only* real transactions fetched from MongoDB `/api/transactions`.
- [x] **HIST-02: Export to CSV Functionality**
  - Wired the "Export CSV" button to trigger AG Grid's `api.exportDataAsCsv()` with fallback blob download of filtered transactions with headers (Date, Reference, Merchant, Amount, Currency, MatchCheck Status, Payment Status, Transaction ID).
- [x] **HIST-03: Real-Time Table Filtering & Search**
  - Verified and wired the status filter pills (`ALL`, `CLEAR`, `REVIEW`, `BLOCKED`, `COMPLETED`) and text search input to dynamically filter the real database rows.

---

## Part 3: SayPay Conversational Gateway (`/new-check`)

- [x] **NC-01: Two-Track Safety Flow (Buyer vs Merchant)**
  - Separate state machine for Buyer (Invoicing cross-check, safety screening, 1-click PayPal pay) vs Merchant (Voice invoice creation, item count, recipient linking, status monitoring).
- [x] **NC-02: Automatic Multi-Step Progression with Timed Transitions**
  - Automatically advances the stepper:
    - Step 1: Capture intent/voice
    - Step 2: Auto-move to Safety Check (1.0s visual animated verification with 3 live check states)
    - Step 3: Review & Confirm (awaits human confirmation - 1-click Pay with PayPal)
    - Step 4: Result & PayPal Sandbox receipt
- [x] **NC-03: Real Security, Scam & Untrusted Merchant Screening**
  - Validated real MatchCheck rules against MongoDB:
    - Inactive/blacklisted merchants (`suspicious-shop` -> `BLOCKED` with warning dialog).
    - Amount mismatch rule -> `BLOCKED` or `REVIEW`.
    - Duplicate reference rule -> `BLOCKED` (`DUPLICATE_PAYMENT`).
    - Transaction limit rule ($500.00 max).
- [x] **NC-04: Strict Invoice Status Filtering (Unpaid vs Paid)**
  - In the right-hand panel, strictly displays *only* `UNPAID` invoices. When an invoice transitions to `PAID`, immediately removes it from the unpaid list.
- [x] **NC-05: Continuous Hands-Free Voice Conversation (ChatGPT Astra Style)**
  - Once user taps the mic, keeps microphone active across the dialogue until the user chooses to stop.
  - User speaks -> detects pause -> executes -> speaks back -> auto-resumes listening without user clicking the mic again.
  - When finished, assistant asks: *"Is there any other payment or invoice you need support with?"*. If user says no/done, gracefully closes session.
- [x] **NC-06: Synchronous Voice & Text Animation**
  - Eliminated delay between text display and speech synthesis: triggered `speakSoftly` simultaneously with response text.
- [x] **NC-07: Active Listening Visual State (Full Div Glow)**
  - When mic is recording, the entire voice assist card container fills with a soft pulsing mint/teal glow (`bg-[#EAF7F1] ring-2 ring-[#087F68]/40 border border-[#78D8BD] shadow-[0_4px_24px_rgba(8,127,104,0.12)]`); smoothly transitions back to plain white fill when idle.
- [x] **NC-08: Authoritative PayPal Sandbox Verification**
  - Confirmed every transaction creates and captures real PayPal Orders v2 in PayPal Sandbox (`api-m.sandbox.paypal.com`), storing order ID and capture ID.
- [x] **NC-09: Bulk Invoice Payment by Voice & Text**
  - Allowed commands like *"Pay all unpaid invoices"* or *"Pay invoices GL-1042 and TN-2210"* to batch-verify and batch-pay with single PayPal capture, marking all included invoices as `PAID`.
- [x] **NC-10: Date/Time & Context Queries**
  - Supported natural questions: *"Show bills due this week"*, *"What's my total pending amount?"*, *"Show invoices paid today"*.
- [x] **NC-11: Friendly Fallback & Graceful Recovery**
  - If voice or text is not understood, assistant replies politely: *"I'm sorry, I didn't catch that. I'm happy to help you check or pay your invoices. Could you please repeat that?"*.
- [x] **NC-12: Multi-Language Voice Recognition Support**
  - Configurable language support in speech recognition and TTS: English (`en-US`), Spanish (`es-ES`), French (`fr-FR`), German (`de-DE`) with quick selector in the assistant header.
- [x] **NC-13: Comprehensive Safety Dialogs**
  - Shows explicit modal/banner dialogs for:
    - Duplicate payment detected (`DUPLICATE_PAYMENT`).
    - Suspicious or inactive merchant (`UNTRUSTED_MERCHANT` / `INACTIVE_MERCHANT`).
    - Exceeds transaction limit (`AMOUNT_EXCEEDS_LIMIT`).
- [x] **NC-14: Consistent Design System**
  - All components, modals, and tables adhere 100% to Rabin's palette: `#0B3A33`, `#087F68`, `#78D8BD`, `#A7F3D0`, `#EAF7F1`, `#107E3E`, `#DFE5E8`.
