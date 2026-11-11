import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(projectRoot, ".env.local") });
dotenv.config({ path: path.join(projectRoot, ".env") });

import { connectDB, disconnectDB } from "../src/lib/db.js";
import Transaction from "../src/models/Transaction.js";
import Merchant from "../src/models/Merchant.js";
import { findDuplicatePayment, normalizeReference } from "../src/lib/transactions.js";

async function runDuplicateTests() {
  console.log("==================================================");
  console.log("🧪 [SayPay] Testing Duplicate Query & Indexes (TN-15)");
  console.log("==================================================");

  await connectDB();

  // 1. Verify and Sync Indexes
  console.log("\n1️⃣  Verifying schema indexes in MongoDB...");
  await Transaction.syncIndexes();
  await Merchant.syncIndexes();

  const txIndexes = await Transaction.collection.indexes();
  console.log("   Transaction indexes found in MongoDB:");
  let foundCompound = false;
  let foundCheckIdUnique = false;
  let foundPaypalOrderUniqueSparse = false;

  for (const idx of txIndexes) {
    const keyStr = JSON.stringify(idx.key);
    console.log(`   - ${idx.name}: ${keyStr} (unique: ${!!idx.unique}, sparse: ${!!idx.sparse})`);
    if (idx.key.merchantKey === 1 && idx.key.reference === 1) {
      foundCompound = true;
    }
    if (idx.key.checkId === 1 && idx.unique) {
      foundCheckIdUnique = true;
    }
    if (idx.key.paypalOrderId === 1 && idx.unique && idx.sparse) {
      foundPaypalOrderUniqueSparse = true;
    }
  }

  if (!foundCompound) {
    throw new Error("Missing required compound index: { merchantKey: 1, reference: 1 }");
  }
  if (!foundCheckIdUnique) {
    throw new Error("Missing unique index on checkId");
  }
  if (!foundPaypalOrderUniqueSparse) {
    throw new Error("Missing unique sparse index on paypalOrderId");
  }
  console.log("   ✅ All required Transaction indexes verified in MongoDB Atlas!");

  // 2. Test findDuplicatePayment with non-existent reference
  console.log("\n2️⃣  Testing query with non-existent reference...");
  const nonExistent = await findDuplicatePayment({
    merchantKey: "greenleaf-demo-store",
    reference: "REF-DOES-NOT-EXIST-" + Date.now(),
  });
  if (nonExistent !== null) {
    throw new Error(`Expected null for non-existent reference, got: ${JSON.stringify(nonExistent)}`);
  }
  console.log("   ✅ Non-existent reference returns null as expected.");

  // 3. Test with non-COMPLETED transaction (should return null)
  console.log("\n3️⃣  Testing query against non-completed (ORDER_CREATED) transaction...");
  const testRef = `TEST-REF-${Date.now()}`;
  const testCheckId = `check-test-${Date.now()}`;
  const testTxId = `tx-test-${Date.now()}`;

  const nonCompletedTx = await Transaction.create({
    transactionId: testTxId,
    checkId: testCheckId,
    merchantKey: "greenleaf-demo-store",
    amountMinor: 1500,
    currency: "USD",
    reference: testRef,
    paymentStatus: "ORDER_CREATED",
  });

  const duplicateCheck1 = await findDuplicatePayment({
    merchantKey: "greenleaf-demo-store",
    reference: testRef,
  });

  if (duplicateCheck1 !== null) {
    throw new Error(
      `Expected null for ORDER_CREATED status, but got transaction: ${duplicateCheck1.transactionId}`
    );
  }
  console.log("   ✅ Non-completed transaction correctly ignored (returns null).");

  // 4. Update transaction to COMPLETED (now should return duplicate)
  console.log("\n4️⃣  Testing query against COMPLETED transaction...");
  nonCompletedTx.paymentStatus = "COMPLETED";
  await nonCompletedTx.save();

  const duplicateMatch = await findDuplicatePayment({
    merchantKey: "greenleaf-demo-store",
    reference: testRef,
  });

  if (!duplicateMatch || duplicateMatch.transactionId !== testTxId) {
    throw new Error(
      `Expected duplicate match for ${testTxId}, got: ${duplicateMatch?.transactionId}`
    );
  }
  console.log(`   ✅ Correctly detected duplicate completed transaction: ${duplicateMatch.transactionId}`);

  // 5. Test Case-insensitivity & whitespace normalization
  console.log("\n5️⃣  Testing case-insensitivity and whitespace normalization...");
  const messyRef = `   ${testRef.toLowerCase()}   `;
  const normalizedMessy = normalizeReference(messyRef);
  console.log(`   Original: "${messyRef}" -> Normalized: "${normalizedMessy}"`);

  const duplicateMatchCase = await findDuplicatePayment({
    merchantKey: "greenleaf-demo-store",
    reference: messyRef,
  });

  if (!duplicateMatchCase || duplicateMatchCase.transactionId !== testTxId) {
    throw new Error("Case-insensitive/whitespace normalized duplicate check failed!");
  }
  console.log("   ✅ Case-insensitive & trimmed reference correctly matched duplicate!");

  // 6. Test Different Merchant (should return null)
  console.log("\n6️⃣  Testing same reference under different merchant...");
  const differentMerchantMatch = await findDuplicatePayment({
    merchantKey: "technova-supplies",
    reference: testRef,
  });
  if (differentMerchantMatch !== null) {
    throw new Error("Duplicate matched across different merchants, but should be scoped by merchantKey!");
  }
  console.log("   ✅ Correctly scoped to specific merchantKey (returns null for other merchant).");

  // 7. Cleanup
  console.log("\n7️⃣  Cleaning up test transaction...");
  await Transaction.deleteOne({ _id: nonCompletedTx._id });
  console.log("   ✅ Cleaned up temporary test transaction.");

  console.log("\n==================================================");
  console.log("🎉 ALL DUPLICATE QUERY & INDEX TESTS PASSED! (TN-15)");
  console.log("==================================================\n");
}

runDuplicateTests()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("\n❌ Duplicate tests failed with error:", err);
    await disconnectDB();
    process.exit(1);
  });
