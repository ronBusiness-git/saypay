import {
  AppError,
  DatabaseError,
  NotFoundError,
  ValidationError,
  ConflictError,
  formatApiError,
  handleApiError,
  sanitizeErrorMessage,
} from "../src/lib/errors.js";

async function runErrorHandlingTests() {
  console.log("==================================================");
  console.log("🧪 [SayPay] Testing Database & API Error Handling (TN-16)");
  console.log("==================================================");

  // 1. Test Custom Error Classes
  console.log("\n1️⃣  Testing custom error classes...");
  const valErr = new ValidationError("Invalid amount", { field: "amount" });
  if (valErr.statusCode !== 400 || valErr.code !== "VALIDATION_ERROR") {
    throw new Error(`ValidationError failed: ${valErr.statusCode}, ${valErr.code}`);
  }

  const notFoundErr = new NotFoundError("Payment check check-123 not found");
  if (notFoundErr.statusCode !== 404 || notFoundErr.code !== "NOT_FOUND") {
    throw new Error(`NotFoundError failed: ${notFoundErr.statusCode}, ${notFoundErr.code}`);
  }

  const dbErr = new DatabaseError("Connection timeout");
  if (dbErr.statusCode !== 500 || dbErr.code !== "DATABASE_ERROR") {
    throw new Error(`DatabaseError failed: ${dbErr.statusCode}, ${dbErr.code}`);
  }

  const conflictErr = new ConflictError("Transaction already completed");
  if (conflictErr.statusCode !== 409 || conflictErr.code !== "CONFLICT_ERROR") {
    throw new Error(`ConflictError failed: ${conflictErr.statusCode}, ${conflictErr.code}`);
  }
  console.log("   ✅ All custom error classes have correct status codes and names.");

  // 2. Test Credential Scrubbing / Sanitization
  console.log("\n2️⃣  Testing credential scrubbing (sanitizeErrorMessage)...");
  const leakedString =
    "Mongo connection failed at mongodb+srv://admin_user:SuperSecretPassword123@cluster0.mongodb.net/saypay?retryWrites=true";
  const sanitized = sanitizeErrorMessage(leakedString);
  console.log(`   Before: ${leakedString}`);
  console.log(`   After:  ${sanitized}`);

  if (sanitized.includes("SuperSecretPassword123") || sanitized.includes("admin_user:")) {
    throw new Error("Credentials were NOT properly scrubbed!");
  }
  if (!sanitized.includes("mongodb+srv://***:***@cluster0.mongodb.net")) {
    throw new Error("Scrubbed string does not match expected masked format!");
  }
  console.log("   ✅ MongoDB credentials successfully masked in error messages.");

  // 3. Test formatApiError & handleApiError
  console.log("\n3️⃣  Testing formatApiError and handleApiError...");

  // 3a. With ValidationError
  const { status: s1, body: b1 } = formatApiError(valErr);
  if (s1 !== 400 || b1.success !== false || b1.error.code !== "VALIDATION_ERROR" || !b1.error.details) {
    throw new Error("formatApiError with ValidationError failed");
  }

  // 3b. With Mongo Duplicate Key Error (code 11000)
  const fakeMongoDup = {
    code: 11000,
    keyPattern: { merchantKey: 1, reference: 1 },
    message: "E11000 duplicate key error collection",
  };
  const { status: s2, body: b2 } = formatApiError(fakeMongoDup);
  if (s2 !== 409 || b2.success !== false || b2.error.code !== "DUPLICATE_KEY") {
    throw new Error("formatApiError with Mongo duplicate key failed");
  }
  console.log(`   Mongo duplicate key response (409): ${JSON.stringify(b2.error)}`);

  // 3c. With handleApiError returning a Response
  const response = handleApiError(notFoundErr);
  if (!(response instanceof Response)) {
    throw new Error("handleApiError should return a standard web Response object");
  }
  if (response.status !== 404) {
    throw new Error(`Expected response status 404, got ${response.status}`);
  }
  const responseJson = await response.json();
  if (responseJson.success !== false || responseJson.error.code !== "NOT_FOUND") {
    throw new Error("handleApiError JSON body mismatch");
  }
  console.log("   ✅ handleApiError returns valid JSON Response with HTTP status 404.");

  console.log("\n==================================================");
  console.log("🎉 ALL ERROR HANDLING TESTS PASSED! (TN-16)");
  console.log("==================================================\n");
}

runErrorHandlingTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Error handling tests failed:", err);
    process.exit(1);
  });
