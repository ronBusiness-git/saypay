import connectDB from "./db.js";
import Merchant from "../models/Merchant.js";
import DemoSettings from "../models/DemoSettings.js";
import { findDuplicatePayment, normalizeReference } from "./transactions.js";
import { toMinorUnits, compareMoney } from "./money.js";

/**
 * Escapes regex special characters.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Queries the Merchant model by merchantKey, normalizedAliases, or displayName.
 *
 * TN-37 Rules:
 * - Match by merchantKey OR find within normalizedAliases (case-insensitive trim).
 * - If found and status === 'ACTIVE': status 'CLEAR', merchantKey resolved.
 * - If found but status === 'INACTIVE': status 'BLOCKED', reasonCode 'INACTIVE_MERCHANT'.
 * - If not found: status 'REVIEW', reasonCode 'UNKNOWN_MERCHANT'.
 *
 * @param {string} identifier - merchantKey, alias, or display name to match
 * @returns {Promise<{ status: 'CLEAR'|'BLOCKED'|'REVIEW', reasonCode: string|null, merchantKey: string|null, merchant: object|null }>}
 */
export async function findMerchant(identifier) {
  if (!identifier || typeof identifier !== "string") {
    return {
      status: "REVIEW",
      reasonCode: "UNKNOWN_MERCHANT",
      merchantKey: null,
      merchant: null,
    };
  }

  const query = identifier.trim().toLowerCase();
  if (!query) {
    return {
      status: "REVIEW",
      reasonCode: "UNKNOWN_MERCHANT",
      merchantKey: null,
      merchant: null,
    };
  }

  await connectDB();

  // Search by exact merchantKey (lowercase) OR in normalizedAliases OR by displayName
  const merchant = await Merchant.findOne({
    $or: [
      { merchantKey: query },
      { normalizedAliases: { $regex: new RegExp(`^${escapeRegex(query)}$`, "i") } },
      { displayName: { $regex: new RegExp(`^${escapeRegex(query)}$`, "i") } },
    ],
  }).lean();

  if (!merchant) {
    return {
      status: "REVIEW",
      reasonCode: "UNKNOWN_MERCHANT",
      merchantKey: null,
      merchant: null,
    };
  }

  if (merchant.status === "ACTIVE") {
    return {
      status: "CLEAR",
      reasonCode: null,
      merchantKey: merchant.merchantKey,
      merchant,
    };
  }

  if (merchant.status === "INACTIVE") {
    return {
      status: "BLOCKED",
      reasonCode: "INACTIVE_MERCHANT",
      merchantKey: merchant.merchantKey,
      merchant,
    };
  }

  return {
    status: "REVIEW",
    reasonCode: "UNKNOWN_MERCHANT",
    merchantKey: merchant.merchantKey,
    merchant,
  };
}

/**
 * Helper to check if a name/key string matches a merchant record.
 *
 * @param {string} recipientStr
 * @param {object} merchant
 * @returns {boolean}
 */
export function isRecipientMatch(recipientStr, merchant) {
  if (!recipientStr || typeof recipientStr !== "string") return false;
  if (!merchant) return false;

  const target = recipientStr.trim().toLowerCase();
  if (!target) return false;

  if (merchant.merchantKey && merchant.merchantKey.toLowerCase() === target) {
    return true;
  }
  if (merchant.displayName && merchant.displayName.toLowerCase() === target) {
    return true;
  }
  if (Array.isArray(merchant.normalizedAliases)) {
    if (merchant.normalizedAliases.some((alias) => alias.toLowerCase() === target)) {
      return true;
    }
  }

  return false;
}

/**
 * Compares recipient details against resolved merchant or each other.
 *
 * TN-38 Rules:
 * - Check if intent recipient and request recipient match the resolved merchant.
 * - If merchant is unknown, check if intent and request recipient match each other.
 * - Mismatch -> status 'MISMATCH', reasonCode 'RECIPIENT_MISMATCH'.
 *
 * @param {string|null} intentRecipient
 * @param {string|null} requestRecipient
 * @param {object|null} merchant
 * @returns {{ status: 'MATCH'|'MISMATCH', reasonCode: 'RECIPIENT_MISMATCH'|null }}
 */
export function matchRecipient(intentRecipient, requestRecipient, merchant) {
  const normIntent = intentRecipient ? String(intentRecipient).trim().toLowerCase() : "";
  const normRequest = requestRecipient ? String(requestRecipient).trim().toLowerCase() : "";

  if (!normIntent && !normRequest) {
    return { status: "MISMATCH", reasonCode: "RECIPIENT_MISMATCH" };
  }

  if (merchant) {
    const intentMatches = isRecipientMatch(normIntent, merchant);
    const requestMatches = isRecipientMatch(normRequest, merchant);

    if (intentMatches && requestMatches) {
      return { status: "MATCH", reasonCode: null };
    }
    return { status: "MISMATCH", reasonCode: "RECIPIENT_MISMATCH" };
  }

  // If merchant is not resolved, check if intent and request match each other exactly
  if (normIntent && normRequest && normIntent === normRequest) {
    return { status: "MATCH", reasonCode: null };
  }

  return { status: "MISMATCH", reasonCode: "RECIPIENT_MISMATCH" };
}

/**
 * Compares decimal amounts using integer minor units.
 *
 * TN-38 Rules:
 * - Exact minor unit integer comparison via compareMoney.
 * - Mismatch -> status 'MISMATCH', reasonCode 'AMOUNT_MISMATCH'.
 *
 * @param {string|number|null} intentAmount
 * @param {string|number|null} requestAmount
 * @returns {{ status: 'MATCH'|'MISMATCH', reasonCode: 'AMOUNT_MISMATCH'|null }}
 */
export function matchAmount(intentAmount, requestAmount) {
  if (
    intentAmount === null ||
    intentAmount === undefined ||
    requestAmount === null ||
    requestAmount === undefined
  ) {
    return { status: "MISMATCH", reasonCode: "AMOUNT_MISMATCH" };
  }

  const isMatch = compareMoney(intentAmount, requestAmount);
  if (isMatch) {
    return { status: "MATCH", reasonCode: null };
  }

  return { status: "MISMATCH", reasonCode: "AMOUNT_MISMATCH" };
}

/**
 * Compares currencies against configured demo currency.
 *
 * TN-38 Rules:
 * - Exact uppercase 3-letter ISO match against configured demo currency (USD).
 * - Mismatch -> status 'MISMATCH', reasonCode 'CURRENCY_MISMATCH'.
 *
 * @param {string|null} intentCurrency
 * @param {string|null} requestCurrency
 * @param {string} [configuredCurrency="USD"]
 * @returns {{ status: 'MATCH'|'MISMATCH', reasonCode: 'CURRENCY_MISMATCH'|null }}
 */
export function matchCurrency(intentCurrency, requestCurrency, configuredCurrency = "USD") {
  const config = (configuredCurrency || "USD").trim().toUpperCase();
  const intentCurr = intentCurrency ? String(intentCurrency).trim().toUpperCase() : "";
  const requestCurr = requestCurrency ? String(requestCurrency).trim().toUpperCase() : "";

  if (intentCurr === config && requestCurr === config) {
    return { status: "MATCH", reasonCode: null };
  }

  return { status: "MISMATCH", reasonCode: "CURRENCY_MISMATCH" };
}

/**
 * Compares payment references with whitespace and case normalization.
 *
 * TN-38 Rules:
 * - Normalize whitespace & case.
 * - Mismatch -> status 'MISMATCH', reasonCode 'REFERENCE_MISMATCH'.
 *
 * @param {string|null} intentReference
 * @param {string|null} requestReference
 * @returns {{ status: 'MATCH'|'MISMATCH', reasonCode: 'REFERENCE_MISMATCH'|null }}
 */
export function matchReference(intentReference, requestReference) {
  const normIntent = normalizeReference(intentReference).toLowerCase();
  const normRequest = normalizeReference(requestReference).toLowerCase();

  // If both normalize to the exact same reference string (including both empty)
  if (normIntent === normRequest) {
    return { status: "MATCH", reasonCode: null };
  }

  return { status: "MISMATCH", reasonCode: "REFERENCE_MISMATCH" };
}

/**
 * Evaluates duplicate payment rule.
 *
 * TN-39 Rules:
 * - If a completed transaction exists for merchantKey + reference:
 *   status 'BLOCKED', reasonCode 'DUPLICATE_PAYMENT'.
 *
 * @param {object|boolean|null} duplicateTransaction
 * @returns {{ status: 'CLEAR'|'BLOCKED', reasonCode: 'DUPLICATE_PAYMENT'|null }}
 */
export function matchDuplicate(duplicateTransaction) {
  if (duplicateTransaction) {
    return { status: "BLOCKED", reasonCode: "DUPLICATE_PAYMENT" };
  }
  return { status: "CLEAR", reasonCode: null };
}

/**
 * Evaluates merchant status check.
 *
 * @param {object|null} merchant
 * @returns {{ status: 'CLEAR'|'BLOCKED'|'REVIEW', reasonCode: string|null }}
 */
export function matchMerchantStatus(merchant) {
  if (!merchant) {
    return { status: "REVIEW", reasonCode: "UNKNOWN_MERCHANT" };
  }

  const status = merchant.status;
  if (status === "ACTIVE") {
    return { status: "CLEAR", reasonCode: null };
  }
  if (status === "INACTIVE") {
    return { status: "BLOCKED", reasonCode: "INACTIVE_MERCHANT" };
  }

  return { status: "REVIEW", reasonCode: "UNKNOWN_MERCHANT" };
}

/**
 * Pure decision engine for Payment MatchCheck.
 *
 * TN-41 Specification:
 * Pure function evaluatePaymentCheck({ intent, request, merchant, settings, duplicateTransaction }).
 *
 * Returns standard decision object matching Section 5:
 * {
 *   "status": "CLEAR" | "REVIEW" | "BLOCKED",
 *   "canCreateOrder": boolean, // strictly true ONLY if status === 'CLEAR'
 *   "checks": {
 *     "recipient": { "status": "MATCH" | "MISMATCH", "reasonCode": null | "RECIPIENT_MISMATCH" },
 *     "amount": { "status": "MATCH" | "MISMATCH", "reasonCode": null | "AMOUNT_MISMATCH" },
 *     "currency": { "status": "MATCH" | "MISMATCH", "reasonCode": null | "CURRENCY_MISMATCH" },
 *     "reference": { "status": "MATCH" | "MISMATCH", "reasonCode": null | "REFERENCE_MISMATCH" },
 *     "duplicate": { "status": "CLEAR" | "BLOCKED", "reasonCode": null | "DUPLICATE_PAYMENT" },
 *     "merchant": { "status": "CLEAR" | "BLOCKED" | "REVIEW", "reasonCode": null | "UNKNOWN_MERCHANT" | "INACTIVE_MERCHANT" }
 *   },
 *   "reasonCodes": string[]
 * }
 *
 * @param {object} params
 * @param {object} params.intent - Parsed user intent fields
 * @param {object} params.request - Parsed merchant request fields
 * @param {object|null} [params.merchant] - Merchant model document or findMerchant result
 * @param {object|null} [params.settings] - DemoSettings document
 * @param {object|null} [params.duplicateTransaction] - Existing completed transaction if any
 * @returns {object} Standard decision object
 */
export function evaluatePaymentCheck(intentOrParams, requestArg, merchantArg, settingsArg, duplicateArg) {
  let intent, request, merchant, settings, duplicateTransaction;

  if (
    intentOrParams &&
    typeof intentOrParams === "object" &&
    ("intent" in intentOrParams || "request" in intentOrParams)
  ) {
    intent = intentOrParams.intent;
    request = intentOrParams.request;
    merchant = intentOrParams.merchant;
    settings = intentOrParams.settings;
    duplicateTransaction = intentOrParams.duplicateTransaction ?? intentOrParams.priorTransactions;
  } else {
    intent = intentOrParams;
    request = requestArg;
    merchant = merchantArg;
    settings = settingsArg;
    duplicateTransaction = duplicateArg;
  }

  // Unwrap merchant if findMerchant result was passed
  const merchantDoc = merchant && merchant.merchant ? merchant.merchant : merchant;

  const configuredCurrency = (settings?.currency || "USD").toUpperCase();
  const limitMinor =
    typeof settings?.transactionLimitMinor === "number"
      ? settings.transactionLimitMinor
      : 50000; // default $500.00

  // 1. Recipient check
  const intentRecipient = intent?.merchantKey || intent?.recipientName;
  const requestRecipient = request?.recipientName;
  const recipientCheck = matchRecipient(intentRecipient, requestRecipient, merchantDoc);

  // 2. Amount check
  const amountCheck = matchAmount(intent?.amount, request?.amount);

  // 3. Currency check
  const currencyCheck = matchCurrency(intent?.currency, request?.currency, configuredCurrency);

  // 4. Reference check
  const referenceCheck = matchReference(intent?.reference, request?.reference);

  // 5. Duplicate check
  const duplicateCheck = matchDuplicate(duplicateTransaction);

  // 6. Merchant status check
  // If merchant has an explicit status from findMerchant result
  const merchantCheck =
    merchant && merchant.status && merchant.reasonCode !== undefined
      ? { status: merchant.status, reasonCode: merchant.reasonCode }
      : matchMerchantStatus(merchantDoc);

  // 7. Amount limit rule (TN-40)
  let amountExceedsLimit = false;
  try {
    const amt = request?.amount || intent?.amount;
    if (amt) {
      const minor = toMinorUnits(amt);
      if (minor > limitMinor) {
        amountExceedsLimit = true;
      }
    }
  } catch {
    // If parsing fails, amountCheck already records mismatch
  }

  // Collect reason codes
  const reasonCodes = [];
  function addReasonCode(code) {
    if (code && !reasonCodes.includes(code)) {
      reasonCodes.push(code);
    }
  }

  if (recipientCheck.reasonCode) addReasonCode(recipientCheck.reasonCode);
  if (amountCheck.reasonCode) addReasonCode(amountCheck.reasonCode);
  if (currencyCheck.reasonCode) addReasonCode(currencyCheck.reasonCode);
  if (referenceCheck.reasonCode) addReasonCode(referenceCheck.reasonCode);
  if (duplicateCheck.reasonCode) addReasonCode(duplicateCheck.reasonCode);
  if (merchantCheck.reasonCode) addReasonCode(merchantCheck.reasonCode);
  if (amountExceedsLimit) addReasonCode("AMOUNT_EXCEEDS_LIMIT");

  if (intent?.needsClarification) {
    addReasonCode("NEEDS_CLARIFICATION");
  }

  // Determine overall status
  // Priority: BLOCKED > REVIEW > CLEAR
  const isBlocked =
    recipientCheck.status === "MISMATCH" ||
    amountCheck.status === "MISMATCH" ||
    currencyCheck.status === "MISMATCH" ||
    referenceCheck.status === "MISMATCH" ||
    duplicateCheck.status === "BLOCKED" ||
    merchantCheck.status === "BLOCKED";

  const isReview =
    merchantCheck.status === "REVIEW" ||
    amountExceedsLimit ||
    Boolean(intent?.needsClarification) ||
    !intent?.amount ||
    !request?.amount ||
    !intentRecipient ||
    !requestRecipient;

  let overallStatus = "CLEAR";
  if (isBlocked) {
    overallStatus = "BLOCKED";
  } else if (isReview) {
    overallStatus = "REVIEW";
  }

  const canCreateOrder = overallStatus === "CLEAR";

  return {
    status: overallStatus,
    canCreateOrder,
    checks: {
      recipient: recipientCheck,
      amount: amountCheck,
      currency: currencyCheck,
      reference: referenceCheck,
      duplicate: duplicateCheck,
      merchant: merchantCheck,
    },
    reasonCodes,
  };
}

/**
 * End-to-end orchestration helper for running a MatchCheck against MongoDB models.
 *
 * @param {object} params
 * @param {object} params.intentFields
 * @param {object} params.requestFields
 * @param {string} [params.workspaceId="demo-workspace"]
 * @returns {Promise<object>} MatchCheck decision plus resolved models
 */
export async function runMatchCheck({
  intentFields,
  requestFields,
  workspaceId = "demo-workspace",
}) {
  await connectDB();

  // 1. Resolve merchant
  const merchantIdentifier =
    intentFields?.merchantKey ||
    intentFields?.recipientName ||
    requestFields?.recipientName;

  const merchantResult = await findMerchant(merchantIdentifier);
  const merchant = merchantResult.merchant;

  // 2. Fetch DemoSettings
  let settings = null;
  try {
    settings = await DemoSettings.findOne({ workspaceId }).lean();
  } catch {
    // Fall back to default
  }
  if (!settings) {
    settings = {
      workspaceId,
      currency: "USD",
      transactionLimitMinor: 50000,
    };
  }

  // 3. Check for duplicate payment
  let duplicateTx = null;
  const merchantKey = merchant?.merchantKey;
  const reference = requestFields?.reference || intentFields?.reference;

  if (merchantKey && reference) {
    try {
      duplicateTx = await findDuplicatePayment({ merchantKey, reference });
    } catch {
      duplicateTx = null;
    }
  }

  // 4. Pure evaluation
  const decision = evaluatePaymentCheck({
    intent: intentFields,
    request: requestFields,
    merchant: merchantResult,
    settings,
    duplicateTransaction: duplicateTx,
  });

  return {
    ...decision,
    merchant,
    settings,
    duplicateTransaction: duplicateTx,
  };
}

export default {
  findMerchant,
  isRecipientMatch,
  matchRecipient,
  matchAmount,
  matchCurrency,
  matchReference,
  matchDuplicate,
  matchMerchantStatus,
  evaluatePaymentCheck,
  runMatchCheck,
};
