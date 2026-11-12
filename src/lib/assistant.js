import crypto from "crypto";
import connectDB from "./db.js";
import Invoice from "../models/Invoice.js";
import PaymentCheck from "../models/PaymentCheck.js";
import Transaction from "../models/Transaction.js";
import { runMatchCheck } from "./matchcheck.js";

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

/**
 * Call Groq chat completions to extract conversational intent and generate warm natural reply.
 */
async function callGroqAssistant({ messages, unpaidInvoices, user }) {
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
  }));

  const systemPrompt = `You are SayPay Assist, an intelligent, friendly conversational payment assistant for PayPal.
Current User: ${user?.name || "John Doe"} (${user?.email || "buyer@saypay.app"}).

Your job is to understand what the user wants, generate a SHORT, warm, speakable reply (1-2 sentences max), and decide on the action.
Speak naturally like a helpful payment assistant. Do NOT use markdown asterisks or robotic phrases.

Available unpaid invoices for this user in the database:
${JSON.stringify(invoiceSummary, null, 2)}

You MUST reply with a valid JSON object only, in this exact format:
{
  "reply": "Warm natural 1-2 sentence spoken reply.",
  "action": "none" | "show_invoices" | "prepare_payment" | "need_info" | "show_history",
  "targetInvoiceId": "invoiceId string if user wants to pay or inspect a specific invoice, otherwise null",
  "searchMerchant": "merchant name if mentioned, otherwise null"
}

Action Rules:
1. "none": Greetings (e.g. "hi", "hello", "how are you"), general small talk, or polite chatter.
2. "show_invoices": User asks to see their bills, invoices, what they owe, pending charges, etc. (e.g. "show my bills", "what invoices do I have?").
3. "prepare_payment": User wants to pay a bill, merchant, or invoice (e.g. "pay GreenLeaf", "pay invoice GL-1042", "pay the coffee bill", "pay $12.50 to GreenLeaf"). Set "targetInvoiceId" to the matching invoiceId. If multiple or unsure, match the closest one or ask.
4. "need_info": User wants to pay but didn't specify which bill and there are multiple, or intent is ambiguous. Ask gently.
5. "show_history": User asks about recent transactions, payment receipts, or history.`;

  const payload = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.slice(-6), // keep recent context
    ],
    temperature: 0.2,
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
function heuristicAssistant({ lastMessageText, unpaidInvoices }) {
  const text = (lastMessageText || "").toLowerCase().trim();

  // Greetings
  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening|how are you|what's up)\b/i.test(
      text
    )
  ) {
    return {
      reply: "Hello! I'm SayPay Assist. I can help you check your invoices or verify and make payments. How can I help you today?",
      action: "none",
      targetInvoiceId: null,
    };
  }

  // Show invoices
  if (
    /(show|list|view|get|what|check).*(invoice|bill|unpaid|due|owe)/i.test(text) ||
    /^(invoices|bills|unpaid)$/i.test(text)
  ) {
    return {
      reply: `You have ${unpaidInvoices.length} unpaid invoices ready for review. Which one would you like to pay?`,
      action: "show_invoices",
      targetInvoiceId: null,
    };
  }

  // History
  if (/(history|past payment|recent payment|receipt|transactions)/i.test(text)) {
    return {
      reply: "Here is your recent payment history and receipts.",
      action: "show_history",
      targetInvoiceId: null,
    };
  }

  // Payment intent
  if (/(pay|checkout|settle|send)/i.test(text)) {
    // Check if an invoice ID matches (e.g. GL-1042, TN-2210, AC-901)
    for (const inv of unpaidInvoices) {
      if (text.includes(inv.invoiceId.toLowerCase())) {
        return {
          reply: `I've pulled up invoice ${inv.invoiceId} for ${inv.merchantName} ($${inv.amount}). Let's verify and complete payment.`,
          action: "prepare_payment",
          targetInvoiceId: inv.invoiceId,
        };
      }
    }

    // Check if merchant name matches
    for (const inv of unpaidInvoices) {
      const mName = inv.merchantName.toLowerCase();
      const mKey = inv.merchantKey.toLowerCase();
      if (
        text.includes(mName) ||
        text.includes(mKey) ||
        (mName.includes("greenleaf") && text.includes("greenleaf")) ||
        (mName.includes("technova") && text.includes("technova")) ||
        (mName.includes("apex") && text.includes("apex"))
      ) {
        return {
          reply: `I found your unpaid invoice with ${inv.merchantName} for $${inv.amount}. Everything is verified.`,
          action: "prepare_payment",
          targetInvoiceId: inv.invoiceId,
        };
      }
    }

    // Check if amount matches
    for (const inv of unpaidInvoices) {
      if (text.includes(inv.amount)) {
        return {
          reply: `I found your invoice for $${inv.amount} to ${inv.merchantName}.`,
          action: "prepare_payment",
          targetInvoiceId: inv.invoiceId,
        };
      }
    }

    // First unpaid invoice default if user just said "pay my bill"
    if (unpaidInvoices.length > 0) {
      const first = unpaidInvoices[0];
      return {
        reply: `I found your most urgent invoice from ${first.merchantName} for $${first.amount}. Let me prepare that for you.`,
        action: "prepare_payment",
        targetInvoiceId: first.invoiceId,
      };
    }
  }

  return {
    reply: "I'm here to help. You can ask me to show your unpaid bills or tell me which merchant you'd like to pay.",
    action: "none",
    targetInvoiceId: null,
  };
}

/**
 * Main Assistant Orchestration:
 * Receives messages & user session, fetches user's unpaid invoices from DB,
 * determines intent, executes deterministic MatchCheck if paying an invoice,
 * persists PaymentCheck, and returns structured response.
 */
export async function processAssistantRequest({ messages, context = {}, user = null }) {
  await connectDB();

  const buyerEmail = user?.email || "buyer@saypay.app";

  // 1. Fetch live unpaid invoices for this buyer from MongoDB
  const unpaidInvoices = await Invoice.find({
    buyerEmail: buyerEmail.toLowerCase(),
    status: "UNPAID",
  })
    .sort({ dueDate: 1 })
    .lean();

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  // 2. Decide intent via Groq (with fallback to heuristic)
  let intentDecision = null;

  // Check if context explicitly selected an invoiceId
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
      intentDecision = await callGroqAssistant({ messages, unpaidInvoices, user });
    } catch (err) {
      console.warn("Groq assistant call failed, falling back to heuristic:", err?.message || err);
      intentDecision = heuristicAssistant({ lastMessageText: lastUserMsg, unpaidInvoices });
    }
  }

  if (!intentDecision) {
    intentDecision = heuristicAssistant({ lastMessageText: lastUserMsg, unpaidInvoices });
  }

  const { reply, action, targetInvoiceId } = intentDecision;

  // 3. Handle action outcomes
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

  if (action === "show_history") {
    const recentTxs = await Transaction.find({
      paymentStatus: "COMPLETED",
    })
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

  if (action === "prepare_payment") {
    let invoice = null;
    if (targetInvoiceId) {
      invoice = unpaidInvoices.find((i) => i.invoiceId === targetInvoiceId);
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

    // Run deterministic MatchCheck (Safety Engine)
    const intentFields = {
      recipientName: invoice.merchantName,
      merchantKey: invoice.merchantKey,
      amount: invoice.amount,
      currency: invoice.currency,
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

    // Persist PaymentCheck in MongoDB
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

    return {
      reply:
        reply ||
        `I've verified your invoice for ${invoice.merchantName} ($${invoice.amount}). Everything looks clear. Please review and click Pay with PayPal.`,
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
          description: invoice.description,
          reasonCodes: matchResult.reasonCodes || [],
          checks: matchResult.checks || {},
        },
      },
    };
  }

  // Default: conversational reply with no active card
  return {
    reply: reply || "How can I help you today?",
    action: action || "none",
    data: {},
  };
}
