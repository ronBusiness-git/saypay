import connectDB from "./db.js";
import Transaction from "../models/Transaction.js";
import { DatabaseError } from "./errors.js";

/**
 * Escapes regex special characters in a string.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes a payment reference string for consistent duplicate checking.
 * Trims leading/trailing whitespace and collapses internal multiple spaces.
 *
 * @param {string|null|undefined} reference
 * @returns {string}
 */
export function normalizeReference(reference) {
  if (!reference || typeof reference !== "string") {
    return "";
  }
  return reference.trim().replace(/\s+/g, " ");
}

/**
 * Normalizes a merchantKey string.
 *
 * @param {string|null|undefined} merchantKey
 * @returns {string}
 */
export function normalizeMerchantKey(merchantKey) {
  if (!merchantKey || typeof merchantKey !== "string") {
    return "";
  }
  return merchantKey.trim().toLowerCase();
}

/**
 * Finds an existing COMPLETED transaction for the same merchantKey and reference.
 * Used by MatchCheck engine to prevent duplicate payments.
 *
 * Rule from SAYPAY_SPECIFICATION.md Section 5:
 * "If a completed transaction exists for merchantKey + reference, status is BLOCKED with DUPLICATE_PAYMENT."
 *
 * @param {object} params
 * @param {string} params.merchantKey - The merchant key (e.g. 'greenleaf-demo-store')
 * @param {string} params.reference - The payment reference / invoice number (e.g. 'INV-2024-001')
 * @returns {Promise<object|null>} The completed transaction document, or null if no duplicate exists.
 */
export async function findDuplicatePayment({ merchantKey, reference }) {
  const normKey = normalizeMerchantKey(merchantKey);
  const normRef = normalizeReference(reference);

  // If either merchantKey or reference is missing/empty, there cannot be a duplicate
  if (!normKey || !normRef) {
    return null;
  }

  try {
    await connectDB();

    // Case-insensitive exact string match on reference, scoped by merchantKey and COMPLETED status
    const existingTx = await Transaction.findOne({
      merchantKey: normKey,
      reference: { $regex: new RegExp(`^${escapeRegex(normRef)}$`, "i") },
      paymentStatus: "COMPLETED",
    }).lean();

    return existingTx || null;
  } catch (error) {
    if (error.name === "AppError" || error.code === "DATABASE_ERROR") {
      throw error;
    }
    throw new DatabaseError(
      `Failed to check duplicate payment: ${error?.message || "Unknown database error"}`
    );
  }
}

const transactions = {
  findDuplicatePayment,
  normalizeReference,
  normalizeMerchantKey,
};

export default transactions;
