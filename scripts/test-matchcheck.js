/**
 * SayPay MatchCheck & Safety Engine Comprehensive Test Suite
 *
 * Covers:
 * 1. Money parsing utilities (toMinorUnits, fromMinorUnits, compareMoney)
 * 2. Deterministic Payment MatchCheck scenarios (Tasks TN-36 to TN-43):
 *    - Happy path -> CLEAR (canCreateOrder === true)
 *    - Amount tamper -> BLOCKED (canCreateOrder === false)
 *    - Currency mismatch -> BLOCKED (canCreateOrder === false)
 *    - Unknown merchant -> REVIEW (canCreateOrder === false)
 *    - Inactive merchant -> BLOCKED (canCreateOrder === false)
 *    - Duplicate payment -> BLOCKED (canCreateOrder === false)
 *    - Over-limit amount -> REVIEW (canCreateOrder === false)
 * 3. Additional edge cases and API route contract assertions
 */

import assert from "assert";
import { toMinorUnits, fromMinorUnits, compareMoney } from "../src/lib/money.js";
import {
  evaluatePaymentCheck,
  matchRecipient,
  matchAmount,
  matchCurrency,
  matchReference,
  matchDuplicate,
  matchMerchantStatus,
  isRecipientMatch,
} from "../src/lib/matchcheck.js";
import { ValidationError } from "../src/lib/errors.js";

let testsRun = 0;
let testsPassed = 0;

function it(name, fn) {
  testsRun++;
  try {
    fn();
    testsPassed++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (error) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${error.message}`);
    if (error.stack) {
      const relevant = error.stack.split("\n").slice(1, 4).join("\n");
      console.error(relevant);
    }
  }
}

console.log("==================================================");
console.log("🛡️  [SayPay] Running Safety Engine / MatchCheck Tests");
console.log("==================================================\n");

// ==========================================
// Suite 1: Money parsing helper (TN-36)
// ==========================================
console.log("--- 1. Testing Money Utilities (TN-36) ---");

it("toMinorUnits: correctly parses standard decimal strings", () => {
  assert.strictEqual(toMinorUnits("12.50"), 1250);
  assert.strictEqual(toMinorUnits("12"), 1200);
  assert.strictEqual(toMinorUnits("0.5"), 50);
  assert.strictEqual(toMinorUnits("0.50"), 50);
  assert.strictEqual(toMinorUnits("0.05"), 5);
  assert.strictEqual(toMinorUnits("0"), 0);
  assert.strictEqual(toMinorUnits("0.00"), 0);
  assert.strictEqual(toMinorUnits("500"), 50000);
  assert.strictEqual(toMinorUnits("100.99"), 10099);
  assert.strictEqual(toMinorUnits("$12.50"), 1250); // strips leading $
});

it("toMinorUnits: rejects exponential notation", () => {
  assert.throws(() => toMinorUnits("1e2"), ValidationError);
  assert.throws(() => toMinorUnits("1E2"), ValidationError);
  assert.throws(() => toMinorUnits("2.5e-3"), ValidationError);
});

it("toMinorUnits: rejects negative amounts", () => {
  assert.throws(() => toMinorUnits("-12.50"), ValidationError);
  assert.throws(() => toMinorUnits("-0.01"), ValidationError);
  assert.throws(() => toMinorUnits("-5"), ValidationError);
});

it("toMinorUnits: rejects amounts with >2 decimal places", () => {
  assert.throws(() => toMinorUnits("12.345"), ValidationError);
  assert.throws(() => toMinorUnits("0.001"), ValidationError);
  assert.throws(() => toMinorUnits("99.999"), ValidationError);
});

it("toMinorUnits: rejects non-numeric or empty inputs", () => {
  assert.throws(() => toMinorUnits(""), ValidationError);
  assert.throws(() => toMinorUnits("   "), ValidationError);
  assert.throws(() => toMinorUnits("abc"), ValidationError);
  assert.throws(() => toMinorUnits(null), ValidationError);
  assert.throws(() => toMinorUnits(undefined), ValidationError);
  assert.throws(() => toMinorUnits("12.50.1"), ValidationError);
});

it("fromMinorUnits: formats integer cents into decimal string", () => {
  assert.strictEqual(fromMinorUnits(1250), "12.50");
  assert.strictEqual(fromMinorUnits(1200), "12.00");
  assert.strictEqual(fromMinorUnits(50), "0.50");
  assert.strictEqual(fromMinorUnits(5), "0.05");
  assert.strictEqual(fromMinorUnits(0), "0.00");
  assert.strictEqual(fromMinorUnits(50000), "500.00");
});

it("fromMinorUnits: rejects invalid or negative cents", () => {
  assert.throws(() => fromMinorUnits(-10), ValidationError);
  assert.throws(() => fromMinorUnits(12.5), ValidationError); // not an integer
  assert.throws(() => fromMinorUnits("1250"), ValidationError); // string
  assert.throws(() => fromMinorUnits(null), ValidationError);
});

it("compareMoney: exact equality without floating point errors", () => {
  assert.strictEqual(compareMoney("12.50", "12.5"), true);
  assert.strictEqual(compareMoney("12.50", "12.50"), true);
  assert.strictEqual(compareMoney("0.1", "0.10"), true);
  assert.strictEqual(compareMoney("12.50", "12.51"), false);
  assert.strictEqual(compareMoney("12.50", "25.00"), false);
  assert.strictEqual(compareMoney("invalid", "12.50"), false);
});

// ==========================================
// Suite 2: Merchant & Field Matching Helpers (TN-37, TN-38)
// ==========================================
console.log("\n--- 2. Testing Field Match Helpers (TN-37, TN-38) ---");

const demoMerchant = {
  merchantKey: "greenleaf-demo-store",
  displayName: "GreenLeaf Demo Store",
  normalizedAliases: ["greenleaf", "green leaf", "greenleaf demo store", "greenleaf store"],
  status: "ACTIVE",
  allowedCurrencies: ["USD"],
};

const inactiveMerchant = {
  merchantKey: "suspicious-shop",
  displayName: "Suspicious Shop",
  normalizedAliases: ["suspicious", "suspicious shop"],
  status: "INACTIVE",
  allowedCurrencies: ["USD"],
};

it("isRecipientMatch: matches key, display name, and normalized aliases", () => {
  assert.strictEqual(isRecipientMatch("greenleaf-demo-store", demoMerchant), true);
  assert.strictEqual(isRecipientMatch("GreenLeaf Demo Store", demoMerchant), true);
  assert.strictEqual(isRecipientMatch("greenleaf", demoMerchant), true);
  assert.strictEqual(isRecipientMatch("green leaf", demoMerchant), true);
  assert.strictEqual(isRecipientMatch("GREENLEAF STORE", demoMerchant), true);
  assert.strictEqual(isRecipientMatch("Unrelated Store", demoMerchant), false);
  assert.strictEqual(isRecipientMatch("", demoMerchant), false);
  assert.strictEqual(isRecipientMatch("greenleaf", null), false);
});

it("matchRecipient: returns MATCH when both intent and request match resolved merchant", () => {
  const result = matchRecipient("GreenLeaf Demo Store", "greenleaf", demoMerchant);
  assert.strictEqual(result.status, "MATCH");
  assert.strictEqual(result.reasonCode, null);
});

it("matchRecipient: returns MISMATCH when request does not match resolved merchant", () => {
  const result = matchRecipient("GreenLeaf Demo Store", "Fraudulent Impostor", demoMerchant);
  assert.strictEqual(result.status, "MISMATCH");
  assert.strictEqual(result.reasonCode, "RECIPIENT_MISMATCH");
});

it("matchRecipient: matches unlisted merchants if intent and request match each other", () => {
  const result = matchRecipient("Unknown Coffee Shop", "unknown coffee shop", null);
  assert.strictEqual(result.status, "MATCH");
  assert.strictEqual(result.reasonCode, null);
});

it("matchRecipient: returns MISMATCH if unlisted merchants differ", () => {
  const result = matchRecipient("Unknown Shop A", "Unknown Shop B", null);
  assert.strictEqual(result.status, "MISMATCH");
  assert.strictEqual(result.reasonCode, "RECIPIENT_MISMATCH");
});

it("matchAmount: returns MATCH for equivalent amounts and MISMATCH otherwise", () => {
  assert.deepStrictEqual(matchAmount("12.50", "12.50"), { status: "MATCH", reasonCode: null });
  assert.deepStrictEqual(matchAmount("12.50", "12.5"), { status: "MATCH", reasonCode: null });
  assert.deepStrictEqual(matchAmount("12.50", "25.00"), {
    status: "MISMATCH",
    reasonCode: "AMOUNT_MISMATCH",
  });
  assert.deepStrictEqual(matchAmount(null, "25.00"), {
    status: "MISMATCH",
    reasonCode: "AMOUNT_MISMATCH",
  });
});

it("matchCurrency: validates 3-letter ISO code against demo configuration", () => {
  assert.deepStrictEqual(matchCurrency("USD", "USD", "USD"), { status: "MATCH", reasonCode: null });
  assert.deepStrictEqual(matchCurrency("usd", "USD", "USD"), { status: "MATCH", reasonCode: null });
  assert.deepStrictEqual(matchCurrency("EUR", "USD", "USD"), {
    status: "MISMATCH",
    reasonCode: "CURRENCY_MISMATCH",
  });
  assert.deepStrictEqual(matchCurrency("EUR", "EUR", "USD"), {
    status: "MISMATCH",
    reasonCode: "CURRENCY_MISMATCH",
  });
});

it("matchReference: normalizes whitespace and case", () => {
  assert.deepStrictEqual(matchReference("GL-204", "gl-204"), { status: "MATCH", reasonCode: null });
  assert.deepStrictEqual(matchReference("  INV-001  ", "INV-001"), {
    status: "MATCH",
    reasonCode: null,
  });
  assert.deepStrictEqual(matchReference("INV  2024   001", "inv 2024 001"), {
    status: "MATCH",
    reasonCode: null,
  });
  assert.deepStrictEqual(matchReference("GL-204", "GL-999"), {
    status: "MISMATCH",
    reasonCode: "REFERENCE_MISMATCH",
  });
});

it("matchDuplicate: blocks if duplicate completed transaction is present", () => {
  assert.deepStrictEqual(matchDuplicate(null), { status: "CLEAR", reasonCode: null });
  assert.deepStrictEqual(matchDuplicate({ transactionId: "tx_123" }), {
    status: "BLOCKED",
    reasonCode: "DUPLICATE_PAYMENT",
  });
});

it("matchMerchantStatus: checks ACTIVE, INACTIVE, and unknown", () => {
  assert.deepStrictEqual(matchMerchantStatus(demoMerchant), { status: "CLEAR", reasonCode: null });
  assert.deepStrictEqual(matchMerchantStatus(inactiveMerchant), {
    status: "BLOCKED",
    reasonCode: "INACTIVE_MERCHANT",
  });
  assert.deepStrictEqual(matchMerchantStatus(null), {
    status: "REVIEW",
    reasonCode: "UNKNOWN_MERCHANT",
  });
});

// ==========================================
// Suite 3: Mandatory MatchCheck Scenarios (TN-41, TN-42, TN-43)
// ==========================================
console.log("\n--- 3. Testing Mandatory MatchCheck Scenarios (TN-41) ---");

const defaultSettings = {
  workspaceId: "demo-workspace",
  currency: "USD",
  transactionLimitMinor: 50000, // $500.00
};

// 1. Happy Path -> CLEAR
it("Scenario 1: Happy path -> CLEAR (canCreateOrder === true)", () => {
  const intent = {
    recipientName: "GreenLeaf Demo Store",
    merchantKey: "greenleaf-demo-store",
    amount: "12.50",
    currency: "USD",
    reference: "GL-204",
  };
  const request = {
    recipientName: "GreenLeaf Demo Store",
    amount: "12.50",
    currency: "USD",
    reference: "GL-204",
  };

  const decision = evaluatePaymentCheck({
    intent,
    request,
    merchant: demoMerchant,
    settings: defaultSettings,
    duplicateTransaction: null,
  });

  assert.strictEqual(decision.status, "CLEAR");
  assert.strictEqual(decision.canCreateOrder, true);
  assert.deepStrictEqual(decision.reasonCodes, []);
  assert.strictEqual(decision.checks.recipient.status, "MATCH");
  assert.strictEqual(decision.checks.amount.status, "MATCH");
  assert.strictEqual(decision.checks.currency.status, "MATCH");
  assert.strictEqual(decision.checks.reference.status, "MATCH");
  assert.strictEqual(decision.checks.duplicate.status, "CLEAR");
  assert.strictEqual(decision.checks.merchant.status, "CLEAR");
});

// 2. Amount Tamper -> BLOCKED
it("Scenario 2: Amount tamper -> BLOCKED (canCreateOrder === false)", () => {
  const intent = {
    recipientName: "GreenLeaf Demo Store",
    amount: "12.50",
    currency: "USD",
    reference: "GL-204",
  };
  const request = {
    recipientName: "GreenLeaf Demo Store",
    amount: "25.00", // Tampered amount!
    currency: "USD",
    reference: "GL-204",
  };

  const decision = evaluatePaymentCheck({
    intent,
    request,
    merchant: demoMerchant,
    settings: defaultSettings,
    duplicateTransaction: null,
  });

  assert.strictEqual(decision.status, "BLOCKED");
  assert.strictEqual(decision.canCreateOrder, false);
  assert.ok(decision.reasonCodes.includes("AMOUNT_MISMATCH"));
  assert.strictEqual(decision.checks.amount.status, "MISMATCH");
  assert.strictEqual(decision.checks.amount.reasonCode, "AMOUNT_MISMATCH");
});

// 3. Currency Mismatch -> BLOCKED
it("Scenario 3: Currency mismatch -> BLOCKED (canCreateOrder === false)", () => {
  const intent = {
    recipientName: "GreenLeaf Demo Store",
    amount: "12.50",
    currency: "USD",
    reference: "GL-204",
  };
  const request = {
    recipientName: "GreenLeaf Demo Store",
    amount: "12.50",
    currency: "EUR", // Mismatched currency!
    reference: "GL-204",
  };

  const decision = evaluatePaymentCheck({
    intent,
    request,
    merchant: demoMerchant,
    settings: defaultSettings,
    duplicateTransaction: null,
  });

  assert.strictEqual(decision.status, "BLOCKED");
  assert.strictEqual(decision.canCreateOrder, false);
  assert.ok(decision.reasonCodes.includes("CURRENCY_MISMATCH"));
  assert.strictEqual(decision.checks.currency.status, "MISMATCH");
  assert.strictEqual(decision.checks.currency.reasonCode, "CURRENCY_MISMATCH");
});

// 4. Unknown Merchant -> REVIEW
it("Scenario 4: Unknown merchant -> REVIEW (canCreateOrder === false)", () => {
  const intent = {
    recipientName: "Acme Mystery Goods",
    amount: "12.50",
    currency: "USD",
    reference: "INV-999",
  };
  const request = {
    recipientName: "Acme Mystery Goods",
    amount: "12.50",
    currency: "USD",
    reference: "INV-999",
  };

  const decision = evaluatePaymentCheck({
    intent,
    request,
    merchant: null, // Unknown merchant!
    settings: defaultSettings,
    duplicateTransaction: null,
  });

  assert.strictEqual(decision.status, "REVIEW");
  assert.strictEqual(decision.canCreateOrder, false);
  assert.ok(decision.reasonCodes.includes("UNKNOWN_MERCHANT"));
  assert.strictEqual(decision.checks.merchant.status, "REVIEW");
  assert.strictEqual(decision.checks.merchant.reasonCode, "UNKNOWN_MERCHANT");
  // Individual fields themselves matched
  assert.strictEqual(decision.checks.amount.status, "MATCH");
  assert.strictEqual(decision.checks.currency.status, "MATCH");
  assert.strictEqual(decision.checks.reference.status, "MATCH");
});

// 5. Inactive Merchant -> BLOCKED
it("Scenario 5: Inactive merchant -> BLOCKED (canCreateOrder === false)", () => {
  const intent = {
    recipientName: "Suspicious Shop",
    amount: "12.50",
    currency: "USD",
    reference: "INV-001",
  };
  const request = {
    recipientName: "Suspicious Shop",
    amount: "12.50",
    currency: "USD",
    reference: "INV-001",
  };

  const decision = evaluatePaymentCheck({
    intent,
    request,
    merchant: inactiveMerchant, // Inactive merchant!
    settings: defaultSettings,
    duplicateTransaction: null,
  });

  assert.strictEqual(decision.status, "BLOCKED");
  assert.strictEqual(decision.canCreateOrder, false);
  assert.ok(decision.reasonCodes.includes("INACTIVE_MERCHANT"));
  assert.strictEqual(decision.checks.merchant.status, "BLOCKED");
  assert.strictEqual(decision.checks.merchant.reasonCode, "INACTIVE_MERCHANT");
});

// 6. Duplicate Payment -> BLOCKED
it("Scenario 6: Duplicate payment -> BLOCKED (canCreateOrder === false)", () => {
  const intent = {
    recipientName: "GreenLeaf Demo Store",
    amount: "12.50",
    currency: "USD",
    reference: "GL-204",
  };
  const request = {
    recipientName: "GreenLeaf Demo Store",
    amount: "12.50",
    currency: "USD",
    reference: "GL-204",
  };

  const existingTransaction = {
    transactionId: "tx_already_paid",
    merchantKey: "greenleaf-demo-store",
    reference: "GL-204",
    paymentStatus: "COMPLETED",
  };

  const decision = evaluatePaymentCheck({
    intent,
    request,
    merchant: demoMerchant,
    settings: defaultSettings,
    duplicateTransaction: existingTransaction, // Duplicate found!
  });

  assert.strictEqual(decision.status, "BLOCKED");
  assert.strictEqual(decision.canCreateOrder, false);
  assert.ok(decision.reasonCodes.includes("DUPLICATE_PAYMENT"));
  assert.strictEqual(decision.checks.duplicate.status, "BLOCKED");
  assert.strictEqual(decision.checks.duplicate.reasonCode, "DUPLICATE_PAYMENT");
});

// 7. Over-limit Amount -> REVIEW
it("Scenario 7: Over-limit amount -> REVIEW (canCreateOrder === false)", () => {
  const intent = {
    recipientName: "GreenLeaf Demo Store",
    amount: "600.00", // $600.00 > $500.00 limit!
    currency: "USD",
    reference: "GL-204",
  };
  const request = {
    recipientName: "GreenLeaf Demo Store",
    amount: "600.00",
    currency: "USD",
    reference: "GL-204",
  };

  const decision = evaluatePaymentCheck({
    intent,
    request,
    merchant: demoMerchant,
    settings: defaultSettings, // limit 50000 cents ($500.00)
    duplicateTransaction: null,
  });

  assert.strictEqual(decision.status, "REVIEW");
  assert.strictEqual(decision.canCreateOrder, false);
  assert.ok(decision.reasonCodes.includes("AMOUNT_EXCEEDS_LIMIT"));
  assert.strictEqual(decision.checks.amount.status, "MATCH");
  assert.strictEqual(decision.checks.merchant.status, "CLEAR");
});

// ==========================================
// Suite 4: Edge Cases and Priority Rules
// ==========================================
console.log("\n--- 4. Testing Edge Cases & Priority Rules ---");

it("Recipient mismatch triggers BLOCKED and RECIPIENT_MISMATCH", () => {
  const intent = {
    recipientName: "GreenLeaf Demo Store",
    amount: "12.50",
    currency: "USD",
    reference: "GL-204",
  };
  const request = {
    recipientName: "Hacked Impostor Store",
    amount: "12.50",
    currency: "USD",
    reference: "GL-204",
  };

  const decision = evaluatePaymentCheck({
    intent,
    request,
    merchant: demoMerchant,
    settings: defaultSettings,
    duplicateTransaction: null,
  });

  assert.strictEqual(decision.status, "BLOCKED");
  assert.strictEqual(decision.canCreateOrder, false);
  assert.ok(decision.reasonCodes.includes("RECIPIENT_MISMATCH"));
  assert.strictEqual(decision.checks.recipient.status, "MISMATCH");
});

it("Reference mismatch triggers BLOCKED and REFERENCE_MISMATCH", () => {
  const intent = {
    recipientName: "GreenLeaf Demo Store",
    amount: "12.50",
    currency: "USD",
    reference: "INV-111",
  };
  const request = {
    recipientName: "GreenLeaf Demo Store",
    amount: "12.50",
    currency: "USD",
    reference: "INV-222",
  };

  const decision = evaluatePaymentCheck({
    intent,
    request,
    merchant: demoMerchant,
    settings: defaultSettings,
    duplicateTransaction: null,
  });

  assert.strictEqual(decision.status, "BLOCKED");
  assert.strictEqual(decision.canCreateOrder, false);
  assert.ok(decision.reasonCodes.includes("REFERENCE_MISMATCH"));
  assert.strictEqual(decision.checks.reference.status, "MISMATCH");
});

it("BLOCKED takes strict precedence over REVIEW", () => {
  // Over-limit ($600 > $500) normally triggers REVIEW
  // But amount tamper ($600 vs $700) triggers BLOCKED
  const intent = {
    recipientName: "GreenLeaf Demo Store",
    amount: "600.00",
    currency: "USD",
    reference: "GL-204",
  };
  const request = {
    recipientName: "GreenLeaf Demo Store",
    amount: "700.00",
    currency: "USD",
    reference: "GL-204",
  };

  const decision = evaluatePaymentCheck({
    intent,
    request,
    merchant: demoMerchant,
    settings: defaultSettings,
    duplicateTransaction: null,
  });

  assert.strictEqual(decision.status, "BLOCKED");
  assert.strictEqual(decision.canCreateOrder, false);
  assert.ok(decision.reasonCodes.includes("AMOUNT_MISMATCH"));
  assert.ok(decision.reasonCodes.includes("AMOUNT_EXCEEDS_LIMIT"));
});

it("Positional arguments signature is supported alongside object signature", () => {
  const intent = {
    recipientName: "GreenLeaf Demo Store",
    amount: "12.50",
    currency: "USD",
    reference: "GL-204",
  };
  const request = {
    recipientName: "GreenLeaf Demo Store",
    amount: "12.50",
    currency: "USD",
    reference: "GL-204",
  };

  const decision = evaluatePaymentCheck(
    intent,
    request,
    demoMerchant,
    defaultSettings,
    null
  );

  assert.strictEqual(decision.status, "CLEAR");
  assert.strictEqual(decision.canCreateOrder, true);
});

console.log("\n==================================================");
console.log(`📊 Test Summary: ${testsPassed}/${testsRun} passed`);
console.log("==================================================");

if (testsPassed !== testsRun) {
  process.exit(1);
}
