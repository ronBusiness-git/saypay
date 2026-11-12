import { ValidationError } from "./errors.js";

/**
 * Converts a decimal amount string to integer minor units (cents).
 * E.g., "12.50" -> 1250, "12" -> 1200, "0.5" -> 50.
 *
 * Strict rules:
 * - Rejects exponential notation (e.g. 1e2)
 * - Rejects negative amounts (e.g. -12.50)
 * - Rejects amounts with more than 2 decimal places (e.g. 12.345)
 * - Never uses floating point math for integer conversion
 *
 * @param {string|number} amountStr - Decimal amount string or number
 * @returns {number} Integer cents
 * @throws {ValidationError} If input is invalid, negative, exponential, or has >2 decimals
 */
export function toMinorUnits(amountStr) {
  if (amountStr === null || amountStr === undefined) {
    throw new ValidationError("Amount is required");
  }

  if (typeof amountStr !== "string" && typeof amountStr !== "number") {
    throw new ValidationError("Amount must be a decimal string or number");
  }

  const str = String(amountStr).trim();

  if (!str) {
    throw new ValidationError("Amount cannot be empty");
  }

  // Reject exponential notation (e.g. 1e2, 2.5e-3)
  if (/[eE]/.test(str)) {
    throw new ValidationError("Exponential notation is not supported");
  }

  // Reject negative amounts
  if (str.startsWith("-") || str.includes("-")) {
    throw new ValidationError("Negative amounts are not allowed");
  }

  // Strip leading currency symbol (e.g. $12.50 -> 12.50) if present
  const cleanStr = str.startsWith("$") ? str.slice(1).trim() : str;

  // Validate decimal format: digits, optional dot with 1 or 2 decimal digits
  if (!/^\d+(\.\d{1,2})?$/.test(cleanStr)) {
    throw new ValidationError(
      "Amount must be a valid non-negative decimal string with at most 2 decimal places"
    );
  }

  const [whole, frac = ""] = cleanStr.split(".");
  const cents = parseInt(whole, 10) * 100 + parseInt(frac.padEnd(2, "0"), 10);

  if (!Number.isSafeInteger(cents)) {
    throw new ValidationError("Amount exceeds maximum supported safe integer value");
  }

  return cents;
}

/**
 * Converts integer minor units (cents) to a formatted decimal string.
 * E.g., 1250 -> "12.50", 50 -> "0.50", 0 -> "0.00".
 *
 * @param {number} cents - Non-negative integer cents
 * @param {string} [currency="USD"] - 3-letter currency code
 * @returns {string} Formatted decimal string with 2 decimal places
 * @throws {ValidationError} If cents is not a non-negative integer
 */
export function fromMinorUnits(cents, currency = "USD") {
  if (typeof cents !== "number" || !Number.isInteger(cents) || cents < 0) {
    throw new ValidationError("Cents must be a non-negative integer");
  }

  const whole = Math.floor(cents / 100);
  const remainder = cents % 100;
  const frac = String(remainder).padStart(2, "0");

  return `${whole}.${frac}`;
}

/**
 * Compares two decimal amount strings for exact equality using integer minor units.
 * NEVER uses floating point equality.
 *
 * @param {string|number} amountStrA
 * @param {string|number} amountStrB
 * @returns {boolean} True if both represent the exact same minor unit amount
 */
export function compareMoney(amountStrA, amountStrB) {
  try {
    const minorA = toMinorUnits(amountStrA);
    const minorB = toMinorUnits(amountStrB);
    return minorA === minorB;
  } catch {
    return false;
  }
}

export default {
  toMinorUnits,
  fromMinorUnits,
  compareMoney,
};
