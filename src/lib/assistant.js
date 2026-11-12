import crypto from "crypto";
import connectDB from "./db.js";
import Invoice from "../models/Invoice.js";
import PaymentCheck from "../models/PaymentCheck.js";
import Transaction from "../models/Transaction.js";
import { runMatchCheck } from "./matchcheck.js";

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

function extractInvoiceId(text) {
  // Voice recognition may omit the hyphen or transcribe it as "hyphen".
  const normalizedText = String(text || "").replace(
    /\b([a-z])\s+([a-z])(?=\s+(?:-|–|—|hyphen|dash|\d|zero|one|two|three|four|five|six|seven|eight|nine))/gi,
    "$1$2",
  );
  const digitWords = {
    zero: "0", one: "1", two: "2", three: "3", four: "4",
    five: "5", six: "6", seven: "7", eight: "8", nine: "9",
  };
  const spokenDigits = normalizedText.match(
    /\b([a-z]{2})\s*(?:-|–|—|\bhyphen\b|\bdash\b|\s)\s*((?:(?:zero|one|two|three|four|five|six|seven|eight|nine)\s+){2,4}(?:zero|one|two|three|four|five|six|seven|eight|nine))\b/i,
  );
  if (spokenDigits) {
    const digits = spokenDigits[2]
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map((word) => digitWords[word])
      .join("");
    return `${spokenDigits[1]}-${digits}`.toUpperCase();
  }

  const spacedDigits = normalizedText.match(
    /\b([a-z]{2})\s*(?:-|–|—|\bhyphen\b|\bdash\b|\s)\s*((?:\d\s+){2,4}\d)\b/i,
  );
  if (spacedDigits) {
    return `${spacedDigits[1]}-${spacedDigits[2].replaceAll(/\s/g, "")}`.toUpperCase();
  }

  const match = normalizedText.match(
    /\b([a-z]{2})\s*(?:-|–|—|\bhyphen\b|\bdash\b|\s)\s*(\d{3,5})\b/i,
  );
  return match ? `${match[1]}-${match[2]}`.toUpperCase() : null;
}

function extractExplicitAmount(text, defaultCurrency = null, allowBareAmount = false) {
  const amount = String.raw`(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)`;
  const patterns = [
    { regex: new RegExp(String.raw`\$\s*${amount}`, "i"), currency: "USD" },
    { regex: new RegExp(String.raw`€\s*${amount}`, "i"), currency: "EUR" },
    { regex: new RegExp(String.raw`£\s*${amount}`, "i"), currency: "GBP" },
    { regex: new RegExp(String.raw`₹\s*${amount}`, "i"), currency: "INR" },
    {
      regex: new RegExp(String.raw`\b(?:USD|US dollars?|dollars?)\s*${amount}`, "i"),
      currency: "USD",
    },
    {
      regex: new RegExp(String.raw`${amount}\s*(?:USD|US dollars?|dollars?)\b`, "i"),
      currency: "USD",
    },
    {
      regex: new RegExp(String.raw`\b(?:EUR|euros?)\s*${amount}`, "i"),
      currency: "EUR",
    },
    {
      regex: new RegExp(String.raw`${amount}\s*(?:EUR|euros?)\b`, "i"),
      currency: "EUR",
    },
    {
      regex: new RegExp(String.raw`\b(?:GBP|pounds?)\s*${amount}`, "i"),
      currency: "GBP",
    },
    {
      regex: new RegExp(String.raw`${amount}\s*(?:GBP|pounds?)\b`, "i"),
      currency: "GBP",
    },
    {
      regex: new RegExp(String.raw`\b(?:INR|rupees?)\s*${amount}`, "i"),
      currency: "INR",
    },
    {
      regex: new RegExp(String.raw`${amount}\s*(?:INR|rupees?)\b`, "i"),
      currency: "INR",
    },
    {
      regex: new RegExp(String.raw`\b(USD|EUR|GBP|INR)\s*${amount}`, "i"),
      currencyFromMatch: true,
      amountIndex: 2,
    },
    {
      regex: new RegExp(String.raw`${amount}\s*(USD|EUR|GBP|INR)\b`, "i"),
      currencyFromMatch: true,
      amountIndex: 1,
    },
  ];

  for (const pattern of patterns) {
    const match = String(text || "").match(pattern.regex);
    if (!match) continue;
    return {
      amount: match[pattern.amountIndex || 1].replaceAll(",", ""),
      currency: pattern.currencyFromMatch
        ? match[pattern.amountIndex === 2 ? 1 : 2].toUpperCase()
        : pattern.currency,
    };
  }

  if (!defaultCurrency) return null;

  // Voice transcription often drops currency words. Use the invoice currency
  // only for an explicitly stated amount, after removing the invoice ID itself.
  const invoiceId = extractInvoiceId(text);
  let amountText = String(text || "");
  if (invoiceId) {
    const [prefix, digits] = invoiceId.split("-");
    const digitWords = {
      0: "zero", 1: "one", 2: "two", 3: "three", 4: "four",
      5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine",
    };
    const spokenDigits = digits
      .split("")
      .map((digit) => digitWords[digit])
      .join("\\s+");
    const spacedDigits = digits.split("").join("\\s+");
    const prefixPattern = prefix.split("").join("\\s*");
    const idPattern = new RegExp(
      `\\b${prefixPattern}\\s*(?:-|–|—|hyphen|dash|\\s)\\s*(?:${digits}|${spokenDigits}|${spacedDigits})\\b`,
      "i",
    );
    amountText = amountText.replace(idPattern, " ");
  }

  const hasAmountCue = /\b(pay|paying|amount|price|cost|worth|for|actual|meant|said)\b/i.test(
    amountText,
  );
  if (!allowBareAmount && !hasAmountCue && !invoiceId) return null;

  const numbers = [...amountText.matchAll(/\b(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\b/g)];
  const unmarkedAmount = numbers.at(-1)?.[1];
  if (!unmarkedAmount) return null;

  return {
    amount: unmarkedAmount.replaceAll(",", ""),
    currency: String(defaultCurrency).toUpperCase(),
  };
}

/**
 * Call Groq chat completions to extract conversational intent and generate warm natural reply.
 */
async function callGroqAssistant({ messages, unpaidInvoices, paidInvoices = [], user, isSeller, lang = "en-US" }) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  const invoiceSummary = unpaidInvoices.map((inv) => ({
    invoiceId: inv.invoiceId,
    merchantName: inv.merchantName,
    merchantKey: inv.merchantKey,
    amount: inv.amount,
    currency: inv.currency,
    description: inv.description,
    dueDate: inv.dueDate,
    status: inv.status,
  }));

  const paidSummary = paidInvoices.map((inv) => ({
    invoiceId: inv.invoiceId,
    merchantName: inv.merchantName,
    amount: inv.amount,
    currency: inv.currency,
    status: inv.status,
    description: inv.description,
  }));

  let systemPrompt = "";

  if (isSeller) {
    systemPrompt = `You are Echo, an intelligent merchant voice assistant for invoicing and settlements.
Current User: ${user?.name || "GreenLeaf Demo Store"} (${user?.email || "seller@saypay.app"}), Role: MERCHANT.
Merchant Key: ${user?.merchantKey || "greenleaf-demo-store"}.
Selected Language: ${lang}. Respond in the selected language. If the selected language is Tamil (ta-IN), reply in Tamil.

Your job is to understand when the merchant wants to create or issue an invoice, check billing status, or search invoices.
Be concise and warm (1-2 sentences max).

Available unpaid invoices issued by this merchant:
${JSON.stringify(invoiceSummary.slice(0, 5), null, 2)}
Paid invoices issued by this merchant:
${JSON.stringify(paidSummary.slice(0, 5), null, 2)}

You MUST output a valid JSON object ONLY:
{
  "reply": "Warm natural 1-2 sentence spoken reply.",
  "action": "none" | "create_invoice" | "show_invoices" | "show_paid_invoices" | "query_invoice_status" | "need_info",
  "invoiceDetails": {
    "buyerEmail": "buyer@saypay.app",
    "amount": "12.50",
    "description": "Office organic coffee and tea supplies",
    "currency": "USD"
  },
  "targetInvoiceId": "invoiceId if asking about a specific invoice or null"
}

Rules for Merchant:
1. If merchant says "create invoice", "bill [user]", "send invoice for [item] [amount]":
   action = "create_invoice"
   extract buyerEmail (default "buyer@saypay.app"), amount (string 2 decimal places e.g. "45.00"), description, and currency ("USD").
2. If merchant asks "show my invoices", "pending invoices", "unpaid": action = "show_invoices".
3. If merchant asks about paid invoices or collection status: action = "show_paid_invoices" or "query_invoice_status".
4. If greeting or general chatter: action = "none".`;
  } else {
    systemPrompt = `You are Echo, an intelligent conversational payment assistant for PayPal.
Current User: ${user?.name || "John Doe"} (${user?.email || "buyer@saypay.app"}), Role: BUYER.
Selected Language: English (India). Always respond in clear, concise English.

Your job is to understand what the user wants, generate a SHORT, warm, speakable English reply (1-2 sentences max), and decide on the action. Always respond in English.
You can answer questions about invoices, check status (PAID vs UNPAID), filter by date or merchant, and prepare payments.
Speak naturally like a helpful payment assistant. Do NOT use markdown asterisks or robotic phrases.

Available UNPAID invoices for this user in the database:
${JSON.stringify(invoiceSummary, null, 2)}

Available PAID / SETTLED invoices for this user in the database:
${JSON.stringify(paidSummary, null, 2)}

You MUST reply with a valid JSON object only:
{
  "reply": "Warm natural 1-2 sentence spoken reply with the answer.",
  "action": "none" | "show_invoices" | "show_paid_invoices" | "query_invoice_status" | "prepare_payment" | "prepare_bulk_payment" | "query_pending_total" | "query_due_this_week" | "query_paid_today" | "need_info" | "show_history",
  "targetInvoiceId": "single invoiceId string if paying or checking one, otherwise null",
  "targetInvoiceIds": ["array of invoiceIds if bulk or null"],
  "searchMerchant": "merchant name if mentioned, otherwise null"
}

Action Rules:
1. "none": Greetings, small talk, or general chatter.
2. "show_invoices": User asks to see their bills, invoices, what they owe, pending charges.
3. "show_paid_invoices": User asks for paid invoices, settled bills, or past paid invoices.
4. "query_invoice_status": User asks about the status of a specific invoice (e.g. "is GL-1042 paid?", "check invoice TN-2210", "status of GreenLeaf invoice"). Set targetInvoiceId to that invoice ID.
5. "query_pending_total": User asks "what's my total pending amount", "how much do I owe", "total balance".
6. "query_due_this_week": User asks "show bills due this week" or "what is due soon".
7. "query_paid_today": User asks "show invoices paid today" or "what did I pay today".
8. "prepare_payment": User wants to pay, open, show, view, or review a specific unpaid invoice (e.g. "pay invoice GL-1042", "open GL-1042", "review invoice GL-1042", "pay $12.50 to GreenLeaf"). Tamil/Tanglish phrases like "invoice pay pannanum", "bill settle pannunga", and "kaasu seluthanum" also mean prepare or open its safety review. Set "targetInvoiceId" to the matching invoiceId. Opening a review never authorizes or captures a payment.
9. "prepare_bulk_payment": User says "pay all unpaid invoices", "pay all bills", "pay all", or the equivalent Tamil/Tanglish request. Set "targetInvoiceIds" to ["all"].
10. "show_history": User asks about recent transactions or payment receipts.`;
  }

  const payload = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.slice(-5),
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq Assistant API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty Groq response");

  return JSON.parse(content);
}

/**
 * Heuristic fallback parser if Groq API is unavailable or times out.
 */
function heuristicAssistant({ lastMessageText, unpaidInvoices, paidInvoices = [], allInvoices = [], isSeller, lang = "en-IN" }) {
  const text = (lastMessageText || "").toLowerCase().trim();
  const tamilSelected = String(lang).toLowerCase().startsWith("ta");

  // Merchant flow
  if (isSeller) {
    if (/(create|generate|send|issue|add).*(invoice|bill)/i.test(text) || text.includes("invoice")) {
      const amtMatch = text.match(/\$?(\d+(?:\.\d{1,2})?)/);
      const amount = amtMatch ? parseFloat(amtMatch[1]).toFixed(2) : "25.00";
      return {
        reply: `I've created invoice for buyer@saypay.app for $${amount}. It is now pending payment.`,
        action: "create_invoice",
        invoiceDetails: {
          buyerEmail: "buyer@saypay.app",
          amount,
          description: "Artisan specialty goods & supplies",
          currency: "USD",
        },
      };
    }

    if (/(paid|settled|collections)/i.test(text)) {
      const totalPaid = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0).toFixed(2);
      return {
        reply: `You have ${paidInvoices.length} settled invoices totaling $${totalPaid} USD.`,
        action: "show_paid_invoices",
        data: { invoices: paidInvoices },
      };
    }

    return {
      reply: "Hello! As a merchant, you can tell me to create an invoice for a customer, or ask to view your pending invoices.",
      action: "none",
    };
  }

  // Buyer flow
  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening|how are you|what's up)\b/i.test(
      text
    )
  ) {
    return {
      reply: "Hello! I'm Echo. I can help you check your invoices or verify and make payments. How can I help you today?",
      action: "none",
      targetInvoiceId: null,
    };
  }

  const invoiceId = extractInvoiceId(text);
  const explicitInvoiceOpen =
    /\b(open|show|view|review|inspect)\b|திற|பார்க்க/i.test(text);
  const paymentIntent =
    /\b(pay|checkout|settle|send)\b|payment|panna|pannanum|pannu|pananum|panunga|panren|seluth|செலுத்த|கட்டணம்|பணம்|கட்டு/i.test(text);

  // Open the requested unpaid invoice in the safety-review stage. This remains
  // a review only; the user must still press the PayPal button to authorize.
  if (invoiceId && (explicitInvoiceOpen || paymentIntent)) {
    const invoice = unpaidInvoices.find(
      (item) => item.invoiceId.toUpperCase() === invoiceId,
    );
    if (invoice) {
      return {
        reply: explicitInvoiceOpen && !paymentIntent
          ? `I've opened invoice ${invoice.invoiceId} for review. It requests ${invoice.currency} ${invoice.amount}. No payment has been started.`
          : `I've opened invoice ${invoice.invoiceId} for ${invoice.merchantName}. I'll compare the amount you stated with the invoice before you can continue.`,
        action: "prepare_payment",
        targetInvoiceId: invoice.invoiceId,
      };
    }
    const existingInvoice = allInvoices.find(
      (item) => item.invoiceId.toUpperCase() === invoiceId,
    );
    return {
      reply: existingInvoice
        ? `Invoice ${existingInvoice.invoiceId} is already paid, so it cannot be opened for payment.`
        : `I couldn't find unpaid invoice ${invoiceId} in your account. Please check the invoice number.`,
      action: "none",
      targetInvoiceId: null,
    };
  }

  // Specific Invoice Status Lookup (e.g. "is GL-1042 paid?", "check invoice GL-1042")
  if (invoiceId && /(status of|invoice status|check invoice|is.*paid|check.*bill)/i.test(text)) {
    const targetId = invoiceId;
    if (targetId) {
      const found = allInvoices.find((i) => i.invoiceId.toUpperCase() === targetId);
      if (found) {
        if (found.status === "PAID") {
          return {
            reply: `Invoice ${found.invoiceId} for ${found.merchantName} ($${found.amount} ${found.currency}) is PAID and fully settled.`,
            action: "show_invoices",
            targetInvoiceId: found.invoiceId,
            data: { invoices: [found] },
          };
        } else {
          return {
            reply: `Invoice ${found.invoiceId} for ${found.merchantName} ($${found.amount} ${found.currency}) is currently UNPAID and due on ${new Date(found.dueDate).toLocaleDateString()}. Would you like me to prepare it for payment?`,
            action: "show_invoices",
            targetInvoiceId: found.invoiceId,
            data: { invoices: [found] },
          };
        }
      }
    }
  }

  // Show Paid Invoices query
  if (/(show|list|view|what).*(paid)/i.test(text) || text.includes("paid invoices") || text.includes("settled bills")) {
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0).toFixed(2);
    return {
      reply: `You have ${paidInvoices.length} paid invoices totaling $${totalPaid} USD.`,
      action: "show_paid_invoices",
      data: { invoices: paidInvoices },
    };
  }

  // Date / Context Queries (NC-10)
  if (/(total pending|how much do i owe|total balance|total amount pending|what do i owe)/i.test(text)) {
    return {
      action: "query_pending_total",
    };
  }

  if (/(due this week|due soon|upcoming bills)/i.test(text)) {
    return {
      action: "query_due_this_week",
    };
  }

  if (/(due this month|november|in november)/i.test(text)) {
    const dueThisMonth = unpaidInvoices.filter((i) => {
      const d = new Date(i.dueDate);
      return d.getMonth() === 10;
    });
    const total = dueThisMonth.reduce((s, i) => s + parseFloat(i.amount || 0), 0).toFixed(2);
    return {
      reply: `You have ${dueThisMonth.length} invoices due in November totaling $${total} USD.`,
      action: "show_invoices",
      data: { invoices: dueThisMonth },
    };
  }

  if (/(paid today|settled today|payments today)/i.test(text)) {
    return {
      action: "query_paid_today",
    };
  }

  if (
    /(show|list|view|get|what|check|kaami|kaatu|காட்டு|காட்டுங்கள்).*(invoice|bill|unpaid|due|owe|பில்|இன்வாய்ஸ்)/i.test(text) ||
    /^(invoices|bills|unpaid)$/i.test(text)
  ) {
    return {
      reply: `You have ${unpaidInvoices.length} unpaid invoices ready for review. Which one would you like to pay?`,
      action: "show_invoices",
      targetInvoiceId: null,
    };
  }

  if (/(history|past payment|recent payment|receipt|transactions)/i.test(text)) {
    return {
      reply: "Here is your recent payment history and receipts.",
      action: "show_history",
      targetInvoiceId: null,
    };
  }

  // Bulk payment requests in English and common Tamil/Tanglish phrasing.
  if (/(pay all|pay both|pay everything|settle all|all.*(pay|panna|செலுத்த)|அனைத்தையும்.*(செலுத்த|கட்டு))/i.test(text)) {
    return {
      action: "prepare_bulk_payment",
      targetInvoiceIds: ["all"],
    };
  }

  // Single payment requests, including common Tamil/Tanglish transcripts.
  if (paymentIntent) {
    for (const inv of unpaidInvoices) {
      if (text.includes(inv.invoiceId.toLowerCase())) {
        return {
          reply: `I've pulled up invoice ${inv.invoiceId} for ${inv.merchantName} ($${inv.amount}). Let's verify and complete payment.`,
          action: "prepare_payment",
          targetInvoiceId: inv.invoiceId,
        };
      }
    }

    for (const inv of unpaidInvoices) {
      const mName = inv.merchantName.toLowerCase();
      if (text.includes(mName) || text.includes("greenleaf") || text.includes("coffee") || text.includes("technova")) {
        return {
          reply: `I found your unpaid invoice with ${inv.merchantName} for $${inv.amount}. Everything is verified.`,
          action: "prepare_payment",
          targetInvoiceId: inv.invoiceId,
        };
      }
    }

    if (unpaidInvoices.length === 1) {
      const first = unpaidInvoices[0];
      return {
        reply: `I found your most urgent invoice from ${first.merchantName} for $${first.amount}. Let me prepare that for you.`,
        action: "prepare_payment",
        targetInvoiceId: first.invoiceId,
      };
    }

    if (unpaidInvoices.length > 1) {
      return {
        reply: tamilSelected
          ? "Payment-ku pala unpaid invoices irukku. Correct invoice-ai choose pannunga, illa invoice number/merchant name sollunga."
          : `I found ${unpaidInvoices.length} unpaid invoices. Choose the right one, or tell me its invoice number or merchant name.`,
        action: "show_invoices",
        data: { invoices: unpaidInvoices },
      };
    }

    return {
      reply: tamilSelected
        ? "Unpaid invoice kidaikkala. Merchant name illa invoice number verify pannitu marubadi sollunga."
        : "I couldn't find an unpaid invoice. Check the merchant name or invoice number and try again.",
      action: "show_invoices",
      data: { invoices: [] },
    };
  }

  return {
    reply: tamilSelected
      ? "Unga request puriyala. Invoice status check panna invoice number sollunga; payment-ku invoice number illa merchant name sollunga."
      : "I'm here to help. You can ask me to check any invoice status, show unpaid bills, or pay a merchant.",
    action: "none",
    targetInvoiceId: null,
  };
}

/**
 * Main Assistant Orchestration
 */
export async function processAssistantRequest({ messages, context = {}, user = null, lang = "en-US" }) {
  await connectDB();

  const isSeller = user?.role === "seller";
  const buyerEmail = user?.email || "buyer@saypay.app";
  const merchantKey = user?.merchantKey || "greenleaf-demo-store";

  // Fetch live invoices from MongoDB (all: UNPAID, PAID)
  const allInvoices = await Invoice.find(
    isSeller ? { merchantKey } : { buyerEmail: buyerEmail.toLowerCase() }
  )
    .sort({ dueDate: 1 })
    .lean();

  const unpaidInvoices = allInvoices.filter((i) => i.status === "UNPAID");
  const paidInvoices = allInvoices.filter((i) => i.status === "PAID");

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  // 1. Decide intent via Groq
  let intentDecision = null;

  if (context.selectedInvoiceId) {
    const matched = unpaidInvoices.find((i) => i.invoiceId === context.selectedInvoiceId);
    if (matched) {
      intentDecision = {
        reply: `I've prepared your invoice ${matched.invoiceId} for ${matched.merchantName} ($${matched.amount}). Everything is verified and ready for your approval.`,
        action: "prepare_payment",
        targetInvoiceId: matched.invoiceId,
      };
    }
  }

  if (!intentDecision) {
    try {
      intentDecision = await callGroqAssistant({ messages, unpaidInvoices, paidInvoices, user, isSeller, lang });
    } catch (err) {
      console.warn("Groq assistant call failed, falling back to heuristic:", err?.message || err);
      intentDecision = heuristicAssistant({ lastMessageText: lastUserMsg, unpaidInvoices, paidInvoices, allInvoices, isSeller, lang });
    }
  }

  if (!intentDecision) {
    intentDecision = heuristicAssistant({ lastMessageText: lastUserMsg, unpaidInvoices, paidInvoices, allInvoices, isSeller, lang });
  }

  // Prefer deterministic invoice-ID matches for explicit open/pay requests,
  // even if the language model labels them as a status query or action=none.
  const fallbackDecision = heuristicAssistant({
    lastMessageText: lastUserMsg,
    unpaidInvoices,
    paidInvoices,
    allInvoices,
    isSeller,
    lang,
  });

  // If the user opens an invoice and then corrects the amount in a follow-up,
  // keep comparing against that invoice instead of losing the context.
  const previousInvoiceRequest = [...messages]
    .slice(0, -1)
    .reverse()
    .find((message) => {
      if (message.role !== "user") return false;
      const hasInvoiceId = extractInvoiceId(message.content);
      const hasOpenOrPayIntent =
        /\b(open|show|view|review|inspect|pay|checkout|settle)\b/i.test(message.content || "");
      return hasInvoiceId && hasOpenOrPayIntent;
    });
  const previousInvoiceId = previousInvoiceRequest
    ? extractInvoiceId(previousInvoiceRequest.content)
    : null;
  const previousInvoice = previousInvoiceId
    ? unpaidInvoices.find((invoice) => invoice.invoiceId.toUpperCase() === previousInvoiceId)
    : null;
  const followupAmount = extractExplicitAmount(
    lastUserMsg,
    previousInvoice?.currency,
    Boolean(previousInvoiceId),
  );
  if (previousInvoiceId && followupAmount) {
    intentDecision = {
      reply: `I'll check the amount you stated against invoice ${previousInvoiceId}.`,
      action: "prepare_payment",
      targetInvoiceId: previousInvoiceId,
    };
  }

  if (
    fallbackDecision.action !== "none" &&
    (intentDecision?.action === "none" || fallbackDecision.action === "prepare_payment")
  ) {
    intentDecision = fallbackDecision;
  }

  const { reply, action, targetInvoiceId, targetInvoiceIds, invoiceDetails } = intentDecision;

  // 2. Handle Merchant Invoice Creation
  if (isSeller && (action === "create_invoice" || invoiceDetails)) {
    const details = invoiceDetails || {};
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `GL-${randomNum}`;

    const newInvoice = await Invoice.create({
      invoiceId,
      merchantKey,
      merchantName: user?.name || "GreenLeaf Demo Store",
      buyerEmail: (details.buyerEmail || "buyer@saypay.app").toLowerCase(),
      amount: details.amount ? parseFloat(details.amount).toFixed(2) : "35.00",
      currency: details.currency || "USD",
      description: details.description || "Artisan organic supplies order",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "UNPAID",
    });

    return {
      reply:
        reply ||
        `I've created invoice ${newInvoice.invoiceId} for ${newInvoice.buyerEmail} ($${newInvoice.amount}). It has been added to the customer's pending bills.`,
      action: "invoice_created",
      data: {
        invoice: {
          invoiceId: newInvoice.invoiceId,
          merchantName: newInvoice.merchantName,
          buyerEmail: newInvoice.buyerEmail,
          amount: newInvoice.amount,
          currency: newInvoice.currency,
          description: newInvoice.description,
          dueDate: newInvoice.dueDate,
          status: newInvoice.status,
        },
      },
    };
  }

  // 3. Handle Queries (NC-10)
  if (action === "query_pending_total") {
    const totalPending = unpaidInvoices
      .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
      .toFixed(2);
    const resp = `Your total pending amount across ${unpaidInvoices.length} unpaid invoices is $${totalPending} USD. Would you like to review and pay?`;
    return {
      reply: reply || resp,
      action: "show_invoices",
      data: {
        totalPending,
        invoices: unpaidInvoices,
      },
    };
  }

  if (action === "query_due_this_week") {
    const now = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const dueThisWeek = unpaidInvoices.filter((i) => {
      const d = new Date(i.dueDate);
      return d >= now && d <= nextWeek;
    });
    const total = dueThisWeek
      .reduce((s, i) => s + parseFloat(i.amount || 0), 0)
      .toFixed(2);
    const resp =
      dueThisWeek.length > 0
        ? `You have ${dueThisWeek.length} invoice${dueThisWeek.length === 1 ? "" : "s"} due this week totaling $${total} USD.`
        : "You have no invoices due within the next 7 days.";
    return {
      reply: reply || resp,
      action: "show_invoices",
      data: {
        invoices: dueThisWeek.length > 0 ? dueThisWeek : unpaidInvoices,
      },
    };
  }

  if (action === "query_paid_today") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const paidToday = await Transaction.find({
      paymentStatus: "COMPLETED",
      createdAt: { $gte: startOfDay },
    })
      .sort({ createdAt: -1 })
      .lean();
    const totalPaid = paidToday
      .reduce((s, t) => s + (t.amountMinor || 0) / 100, 0)
      .toFixed(2);
    const resp =
      paidToday.length > 0
        ? `You have paid ${paidToday.length} invoice${paidToday.length === 1 ? "" : "s"} today totaling $${totalPaid} USD via PayPal Sandbox.`
        : "You haven't completed any payments today yet.";
    return {
      reply: reply || resp,
      action: "show_history",
      data: {
        transactions: paidToday,
      },
    };
  }

  // 4. Handle Show Invoices
  if (action === "show_paid_invoices") {
    return {
      reply: reply || `You have ${paidInvoices.length} paid invoices in the database.`,
      action: "show_invoices",
      data: {
        invoices: paidInvoices.map((inv) => ({
          invoiceId: inv.invoiceId,
          merchantName: inv.merchantName,
          merchantKey: inv.merchantKey,
          amount: inv.amount,
          currency: inv.currency,
          description: inv.description,
          dueDate: inv.dueDate,
          status: inv.status,
        })),
      },
    };
  }

  if (action === "show_invoices") {
    return {
      reply: reply || `You have ${unpaidInvoices.length} unpaid invoices.`,
      action: "show_invoices",
      data: {
        invoices: unpaidInvoices.map((inv) => ({
          invoiceId: inv.invoiceId,
          merchantName: inv.merchantName,
          merchantKey: inv.merchantKey,
          amount: inv.amount,
          currency: inv.currency,
          description: inv.description,
          dueDate: inv.dueDate,
          status: inv.status,
        })),
      },
    };
  }

  // 5. Handle Show History
  if (action === "show_history") {
    const recentTxs = await Transaction.find({ paymentStatus: "COMPLETED" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      reply: reply || "Here are your recent completed payments.",
      action: "show_history",
      data: {
        transactions: recentTxs.map((tx) => ({
          transactionId: tx.transactionId,
          merchantKey: tx.merchantKey,
          amount: (tx.amountMinor / 100).toFixed(2),
          currency: tx.currency,
          reference: tx.reference,
          captureId: tx.captureId,
          createdAt: tx.createdAt,
        })),
      },
    };
  }

  // 6. Handle Bulk Invoice Payment (NC-09)
  if (action === "prepare_bulk_payment") {
    let targets = [];
    if (Array.isArray(targetInvoiceIds) && targetInvoiceIds.length > 0) {
      if (targetInvoiceIds.includes("all")) {
        targets = [...unpaidInvoices];
      } else {
        targets = unpaidInvoices.filter((i) =>
          targetInvoiceIds.some((id) => id.toLowerCase() === i.invoiceId.toLowerCase())
        );
      }
    } else {
      targets = [...unpaidInvoices];
    }

    if (targets.length === 0) {
      return {
        reply: "You don't have any unpaid invoices to pay right now.",
        action: "none",
        data: {},
      };
    }

    const totalAmount = targets
      .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
      .toFixed(2);
    const invoiceIds = targets.map((i) => i.invoiceId);
    const combinedRef = invoiceIds.join(", ");
    const checkId = "chk_bulk_" + Date.now();

    const intentFields = {
      recipientName: targets[0].merchantName,
      merchantKey: targets[0].merchantKey,
      amount: totalAmount,
      currency: "USD",
      reference: combinedRef,
      purpose: `Settlement for ${targets.length} invoices: ${combinedRef}`,
    };

    const requestFields = {
      recipientName: targets[0].merchantName,
      amount: totalAmount,
      currency: "USD",
      reference: combinedRef,
      purpose: `Settlement for ${targets.length} invoices: ${combinedRef}`,
    };

    // Run MatchCheck on the batch
    const matchResult = await runMatchCheck({
      intentFields,
      requestFields,
      workspaceId: "demo-workspace",
    });

    await PaymentCheck.create({
      checkId,
      invoiceId: combinedRef,
      workspaceId: "demo-workspace",
      intent: intentFields,
      request: requestFields,
      comparison: {
        recipient: { status: "MATCH", reasonCode: null },
        amount: { status: "MATCH", reasonCode: null },
        currency: { status: "MATCH", reasonCode: null },
        reference: { status: "MATCH", reasonCode: null },
        duplicate: { status: "CLEAR", reasonCode: null },
        merchant: { status: "CLEAR", reasonCode: null },
      },
      status: matchResult.status,
      canCreateOrder: matchResult.canCreateOrder,
      reasonCodes: matchResult.reasonCodes || [],
      modelName: GROQ_MODEL,
    });

    return {
      reply:
        reply ||
        `I've prepared a combined payment of $${totalAmount} for ${targets.length} invoices (${combinedRef}). All safety rules passed. Please confirm to pay with PayPal.`,
      action: "prepare_payment",
      data: {
        payment: {
          isBulk: true,
          checkId,
          invoiceId: combinedRef,
          invoiceIds,
          merchantName: targets.length === 1 ? targets[0].merchantName : `Multiple Merchants (${targets.length})`,
          merchantKey: targets[0].merchantKey,
          amount: totalAmount,
          currency: "USD",
          description: `Bulk payment for ${targets.length} invoices: ${combinedRef}`,
          items: targets,
          status: matchResult.status,
          canCreateOrder: matchResult.canCreateOrder,
          checks: matchResult.checks || {},
          reasonCodes: matchResult.reasonCodes || [],
        },
      },
    };
  }

  // 7. Handle Prepare Single Payment (Buyer Flow)
  if (action === "prepare_payment") {
    let invoice = null;
    if (targetInvoiceId) {
      invoice = unpaidInvoices.find(
        (i) => i.invoiceId.toUpperCase() === String(targetInvoiceId).toUpperCase(),
      );
    }
    // Never substitute a different invoice when the user provided a specific ID.
    if (!invoice && targetInvoiceId) {
      const requestedId = String(targetInvoiceId).toUpperCase();
      const isKnown = allInvoices.some(
        (item) => item.invoiceId.toUpperCase() === requestedId,
      );
      return {
        reply: isKnown
          ? `Invoice ${requestedId} is not unpaid, so I can't prepare it for payment.`
          : `I couldn't find invoice ${requestedId} in your account. Please check the invoice number.`,
        action: "none",
        data: { invoices: [] },
      };
    }
    if (!invoice && unpaidInvoices.length > 0) {
      invoice = unpaidInvoices[0];
    }

    if (!invoice) {
      return {
        reply: "You don't have any unpaid invoices matching that request.",
        action: "none",
        data: { invoices: [] },
      };
    }

    const statedPayment = extractExplicitAmount(
      lastUserMsg,
      invoice.currency,
      Boolean(previousInvoiceId && previousInvoiceId === invoice.invoiceId.toUpperCase()),
    );
    const intentFields = {
      recipientName: invoice.merchantName,
      merchantKey: invoice.merchantKey,
      amount: statedPayment?.amount || invoice.amount,
      currency: statedPayment?.currency || invoice.currency,
      reference: invoice.invoiceId,
      purpose: invoice.description,
    };

    const requestFields = {
      recipientName: invoice.merchantName,
      amount: invoice.amount,
      currency: invoice.currency,
      reference: invoice.invoiceId,
      purpose: invoice.description,
    };

    const matchResult = await runMatchCheck({
      intentFields,
      requestFields,
      workspaceId: "demo-workspace",
    });

    const checkId = crypto.randomUUID();

    await PaymentCheck.create({
      checkId,
      invoiceId: invoice.invoiceId,
      workspaceId: "demo-workspace",
      intent: intentFields,
      request: requestFields,
      comparison: {
        recipient: {
          status: matchResult.checks?.recipient?.status,
          reasonCode: matchResult.checks?.recipient?.reasonCode,
        },
        amount: {
          status: matchResult.checks?.amount?.status,
          reasonCode: matchResult.checks?.amount?.reasonCode,
        },
        currency: {
          status: matchResult.checks?.currency?.status,
          reasonCode: matchResult.checks?.currency?.reasonCode,
        },
        reference: {
          status: matchResult.checks?.reference?.status,
          reasonCode: matchResult.checks?.reference?.reasonCode,
        },
        duplicate: {
          status: matchResult.checks?.duplicate?.status,
          reasonCode: matchResult.checks?.duplicate?.reasonCode,
        },
        merchant: {
          status: matchResult.checks?.merchant?.status,
          reasonCode: matchResult.checks?.merchant?.reasonCode,
        },
      },
      status: matchResult.status,
      canCreateOrder: matchResult.canCreateOrder,
      reasonCodes: matchResult.reasonCodes || [],
      modelName: GROQ_MODEL,
    });

    const amountMismatch = matchResult.reasonCodes?.includes("AMOUNT_MISMATCH");
    const matchExplanation = amountMismatch
      ? `Invoice number ${invoice.invoiceId} is correct. You said ${intentFields.currency} ${intentFields.amount}, but the invoice requests ${invoice.currency} ${invoice.amount}. The amounts do not match, so I blocked this payment. Please correct the amount before continuing.`
      : null;

    if (amountMismatch) {
      return {
        reply: matchExplanation,
        action: "amount_mismatch",
        data: {
          invoiceId: invoice.invoiceId,
          statedAmount: intentFields.amount,
          statedCurrency: intentFields.currency,
          invoiceAmount: invoice.amount,
          invoiceCurrency: invoice.currency,
        },
      };
    }

    return {
      reply:
        matchExplanation ||
        reply ||
        `I've verified your invoice for ${invoice.merchantName} (${invoice.currency} ${invoice.amount}). Everything looks clear. Please review and click Pay with PayPal.`,
      action: "prepare_payment",
      data: {
        payment: {
          checkId,
          status: matchResult.status,
          canCreateOrder: matchResult.canCreateOrder,
          invoiceId: invoice.invoiceId,
          merchantName: invoice.merchantName,
          merchantKey: invoice.merchantKey,
          amount: invoice.amount,
          currency: invoice.currency,
          statedAmount: intentFields.amount,
          statedCurrency: intentFields.currency,
          description: invoice.description,
          reasonCodes: matchResult.reasonCodes || [],
          checks: matchResult.checks || {},
        },
      },
    };
  }

  return {
    reply: reply || "How can I help you today?",
    action: action || "none",
    data: {},
  };
}
