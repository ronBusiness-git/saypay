# SayPay — 3-minute demo video script & recording guide

**Target length: 2:50** (leaves a 10-second buffer under the 3:00 limit)

## Before you hit record (5 minutes)
1. Run `npm run dev`, open **Chrome** at `http://localhost:3000`, zoom to **110%**, close other tabs, mute notifications.
2. Log in as buyer once, open `/new-check`, allow the microphone, then log out.
3. Look at the **unpaid invoice list** on `/new-check` and pick **one unpaid invoice** for the happy path (the script uses *TechNova*; if TechNova is already PAID, use whatever merchant is at the top and say that name instead).
4. Your **blocked** example is **GL-1042**, which is already settled, so MatchCheck flags `DUPLICATE_PAYMENT`.
5. Recorder: OBS or Windows `Win + Alt + R` (Game Bar). Record **system audio + mic** so Echo's voice is captured. Use a headset so Echo doesn't hear itself.
6. Safety net: if voice misbehaves on camera, click **Type instead** and type the same sentence. Same flow, no retake needed.

---

## Scene-by-scene

### Scene 1 · Hook (0:00 – 0:15) · Screen: login page
**Say:**
> "Last month I almost paid an invoice that looked perfect, except the amount was wrong. Fake and duplicate invoices are one of the easiest ways to lose money. And now AI agents want to pay bills *for* us. We asked: what if AI made paying easier, without ever touching the money?"

### Scene 2 · Intro (0:15 – 0:25) · Click: **Buyer login** → dashboard
**Say:**
> "This is **SayPay**. You talk to **Echo**, our AI assistant. Strict rules check every payment. And only you can approve it, through PayPal."

### Scene 3 · Talk to Echo (0:25 – 0:50) · Click: **New Check** → tap the **mic**
**Speak to Echo:** *"Hey Echo, is my TechNova invoice paid?"*
→ Echo answers out loud that it's unpaid, with the amount and due date.
**Speak:** *"Okay, pay it."*
**Narrate while stages move:**
> "I didn't fill in a form. Echo understood me, found the real invoice in our database, and now it's running our safety check."

### Scene 4 · Safety check + human approval (0:50 – 1:25) · Screen: MatchCheck card
Let Echo read the verdict (*"MatchCheck verified… recipient, amount, reference matched, no duplicate"*).
**Point at:** the four green checks and the **mic is now off**.
**Say:**
> "Look at the mic. Echo turned it off. The AI can prepare a payment, but it can't send one. Only my click can."

**Click:** **Pay with PayPal** → receipt (Stage 4).
> "That's a real PayPal Sandbox order, created and captured. The invoice is now marked paid and it's gone from my unpaid list."

### Scene 5 · The scam catch (1:25 – 1:55) · Click the mic again
**Speak:** *"Pay invoice GL-1042."*
→ Status turns **BLOCKED** / `DUPLICATE_PAYMENT`, and Echo says the warning out loud.
**Say:**
> "This one was already paid. A normal checkout would charge me twice. SayPay blocks it, and Echo tells me why in plain English. No PayPal call is ever made."

### Scene 6 · Merchant side (1:55 – 2:20) · Click: **Log out** (full-screen loader) → **Seller login** → **New Check**
**Speak:** *"Create invoice for buyer@saypay.app for 3 coffee bags at 45 dollars."*
→ Merchant stepper jumps to **Dispatched**.
**Say:**
> "Merchants get the same assistant. One sentence, and the invoice is created and waiting in the buyer's list."

### Scene 7 · Under the hood (2:20 – 2:40) · Click: **History**, then show the README architecture diagram on GitHub
**Say:**
> "Every payment is recorded here, filterable and exportable. Under the hood: four PayPal REST endpoints, OAuth token, create order, capture, and order lookup, with idempotency so nothing is charged twice. Groq powers Echo, Gemini is the fallback, the browser handles the voice, and MongoDB stores everything."

### Scene 8 · Moral (2:40 – 2:50) · Screen: dashboard or SayPay logo
**Say, slowly:**
> "**AI talks. Rules decide. Humans approve.** That's SayPay. Say it, check it, pay with confidence."

---

## Recording tips
- Speak a bit slower than feels normal; pause **one beat** before talking to Echo so the mic catches the first word.
- If a scene goes wrong, **don't restart the whole video**: re-record that scene and cut it in (YouTube Studio editor or Clipchamp both work).
- Upload as **Unlisted or Public** (not Private), title: *"SayPay — Voice AI payments with PayPal, where only humans approve | PayPal AI Hackathon"*.
- Paste the YouTube link into README.md and Devpost.

## Why this structure (what tends to work for hackathon judges)
- **Story first, product second.** Judges remember a problem they can feel.
- **Live product, not slides.** Over 80% of the runtime here is the app working.
- **Show a failure being caught.** A blocked scam shows trust better than any happy path.
- **Name the sponsor tech clearly.** Say "PayPal" and list the endpoints out loud, because judges score sponsor integration.
- **End on one memorable line.**
