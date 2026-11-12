# Devpost submission — SayPay (copy each section into the matching Devpost field)

## Project name
SayPay

## Tagline (short)
Say it. Check it. Pay with confidence. Echo, a voice AI, prepares your PayPal payment; deterministic rules verify it; only you can approve it.

## Inspiration
One of us almost paid an invoice that looked right but had the wrong amount. Invoice fraud and accidental double payments are among the most common ways small businesses lose money. At the same time, everyone is building AI agents that pay *for* you. We wanted the opposite: an AI that makes paying easier **without ever being the one that moves the money**.

## What it does
SayPay is a voice-first payment companion built on PayPal.
- **Buyers** talk to **Echo**: "Is the TechNova invoice paid?", "What's due this week?", "Pay GreenLeaf." Echo finds the real invoice, and SayPay moves through four stages automatically: Capture → Safety check → Review & confirm → Receipt.
- **MatchCheck**, a set of deterministic rules, compares what you said with the invoice: recipient, amount, currency, reference, duplicate payment, merchant status. A suspicious payment is blocked and Echo explains why, out loud.
- If the check is CLEAR, Echo switches the mic off and shows a pre-filled PayPal card. **Only a human click** creates and captures the PayPal Sandbox order. The invoice is then marked PAID.
- **Merchants** create invoices by voice ("Create invoice for buyer@saypay.app for 3 coffee bags at $45") and follow a merchant flow: Capture → Validation → Review & Issue → Dispatched.
- History on AG Grid with filters and CSV export, from real database records.

**AI talks. Rules decide. Humans approve.**

## How we built it
- **Next.js 16** (App Router, plain JavaScript), Tailwind, AG Grid.
- **PayPal REST API (Sandbox), 4 endpoints:** `POST /v1/oauth2/token`, `POST /v2/checkout/orders`, `POST /v2/checkout/orders/{id}/capture`, `GET /v2/checkout/orders/{id}`, with idempotency keys and explicit transaction states so a retried capture never charges twice.
- **AI:** Groq (`openai/gpt-oss-120b`) as Echo's main brain, returning structured JSON actions; Google Gemini as a fallback for extraction and explanations; a heuristic parser as an offline fallback; the browser Web Speech API for continuous speech-to-text and soft text-to-speech.
- **MongoDB Atlas** for users, invoices, payment checks and transactions.
- **Playwright** end-to-end tests for the voice/text → safety check → PayPal → receipt flow.

## Challenges we ran into
- **AI rate limits mid-sprint.** We hit our Gemini quota, then moved Echo to Groq with Gemini and a rule-based parser as fallbacks, so the demo never goes silent.
- **Continuous voice in the browser.** Speech recognition kept crashing (`InvalidStateError`, duplicated transcripts like "Hey Hey how Hey how are…"). We rebuilt it as a single recognition lifecycle that pauses while Echo speaks and resumes cleanly.
- **Keeping AI away from the money.** Making the mic switch off at the payment step, and making the PayPal button depend only on the rules engine, took several redesigns.
- **Wiring three people's work together** (UI, backend, AI) in a few days.

## Accomplishments we're proud of
- A complete talk → verify → approve → PayPal → receipt loop running on real Sandbox orders and a real database.
- Safety that's explainable: every block has a reason code, and Echo says it in plain language.
- Our first hackathon, shipped as a team.

## What we learned
AI is great at understanding people and bad at being trusted with money. Splitting "understand" (AI), "decide" (rules) and "approve" (human) made the product both easier to use and safer.

## What's next for SayPay
- PayPal JS SDK buyer approval and PayPal Invoicing API for merchant invoices.
- Multi-language voice, and payee verification against PayPal merchant data.
- Recurring bills and spending limits per merchant.

## Built with
nextjs, react, javascript, tailwindcss, paypal, paypal-rest-api, groq, gemini, web-speech-api, mongodb, mongoose, ag-grid, playwright

## Links
- GitHub (MIT): https://github.com/ronBusiness-git/saypay
- Demo video: <paste YouTube link>
