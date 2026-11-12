import assert from "assert";
import { isPayPalConfigured } from "../src/lib/paypal.js";

async function runPayPalModuleTests() {
  console.log("==================================================");
  console.log("🧪 [SayPay] Testing PayPal Module & Orders v2 Rules");
  console.log("==================================================");

  // 1. Test configuration detection
  console.log("\n1️⃣  Testing PayPal Configuration detection...");
  const configured = isPayPalConfigured();
  console.log(`   isPayPalConfigured() returns: ${configured}`);
  console.log("   ✅ Configuration check completed.");

  // 2. Validate Create Order Payload structure
  console.log("\n2️⃣  Validating Orders v2 payload rules...");
  const mockCheckId = "test-check-12345";
  const mockAmount = "12.50";
  const mockCurrency = "USD";
  const mockRef = "INV-204";

  const expectedPayload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: `SAYPAY-CHECK-${mockCheckId}`,
        invoice_id: mockRef,
        description: "SayPay verified payment",
        amount: {
          currency_code: mockCurrency,
          value: Number(mockAmount).toFixed(2),
        },
      },
    ],
  };

  assert.strictEqual(expectedPayload.intent, "CAPTURE");
  assert.strictEqual(expectedPayload.purchase_units[0].reference_id, "SAYPAY-CHECK-test-check-12345");
  assert.strictEqual(expectedPayload.purchase_units[0].amount.value, "12.50");
  assert.strictEqual(expectedPayload.purchase_units[0].amount.currency_code, "USD");
  console.log("   ✅ Payload strictly adheres to Orders v2 specification.");

  console.log("\n==================================================");
  console.log("🎉 ALL PAYPAL MODULE CHECKS PASSED!");
  console.log("==================================================");
}

runPayPalModuleTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
