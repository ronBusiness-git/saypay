import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Ensure .env.local and .env are loaded before any other imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(projectRoot, ".env.local") });
dotenv.config({ path: path.join(projectRoot, ".env") });

import { connectDB, disconnectDB } from "../src/lib/db.js";
import Merchant from "../src/models/Merchant.js";
import DemoSettings from "../src/models/DemoSettings.js";
import Transaction from "../src/models/Transaction.js";

const DEMO_MERCHANTS = [
  {
    merchantKey: "greenleaf-demo-store",
    displayName: "GreenLeaf Demo Store",
    normalizedAliases: [
      "greenleaf",
      "green leaf",
      "greenleaf demo store",
      "greenleaf store",
    ],
    status: "ACTIVE",
    allowedCurrencies: ["USD"],
  },
  {
    merchantKey: "technova-supplies",
    displayName: "TechNova Supplies",
    normalizedAliases: [
      "technova",
      "tech nova",
      "technova supplies",
    ],
    status: "ACTIVE",
    allowedCurrencies: ["USD"],
  },
  {
    merchantKey: "apex-utilities",
    displayName: "Apex Utilities",
    normalizedAliases: [
      "apex",
      "apex utilities",
    ],
    status: "ACTIVE",
    allowedCurrencies: ["USD"],
  },
  {
    merchantKey: "suspicious-shop",
    displayName: "Suspicious Shop",
    normalizedAliases: [
      "suspicious",
      "suspicious shop",
    ],
    status: "INACTIVE",
    allowedCurrencies: ["USD"],
  },
];

const DEFAULT_DEMO_SETTINGS = {
  workspaceId: "demo-workspace",
  currency: "USD",
  transactionLimitMinor: 50000, // $500.00
};

export async function seedDemoData() {
  console.log("==================================================");
  console.log("🌱 [SayPay] Seeding Demo Merchants & Demo Settings");
  console.log("==================================================");

  await connectDB();

  // 1. Sync indexes to ensure MongoDB Atlas indexes match schemas
  console.log("\n📦 Synchronizing MongoDB indexes...");
  await Promise.all([
    Merchant.syncIndexes(),
    DemoSettings.syncIndexes(),
    Transaction.syncIndexes(),
  ]);
  console.log("✅ Indexes synchronized successfully.");

  // 2. Seed Merchants (idempotent upsert)
  console.log("\n🏪 Upserting demo merchants...");
  const seededMerchants = [];
  for (const merchantData of DEMO_MERCHANTS) {
    const updated = await Merchant.findOneAndUpdate(
      { merchantKey: merchantData.merchantKey },
      { $set: merchantData },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    seededMerchants.push(updated);
    console.log(
      `   ✓ [${updated.status}] ${updated.displayName} (${updated.merchantKey}) - aliases: [${updated.normalizedAliases.join(", ")}]`
    );
  }

  // 3. Seed DemoSettings (idempotent upsert)
  console.log("\n⚙️  Upserting default demo settings...");
  const settings = await DemoSettings.findOneAndUpdate(
    { workspaceId: DEFAULT_DEMO_SETTINGS.workspaceId },
    { $set: DEFAULT_DEMO_SETTINGS },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  console.log(
    `   ✓ Workspace: ${settings.workspaceId} | Currency: ${settings.currency} | Limit: $${(settings.transactionLimitMinor / 100).toFixed(2)} (${settings.transactionLimitMinor} cents)`
  );

  console.log("\n==================================================");
  console.log(`🎉 Seeding complete! (${seededMerchants.length} merchants, 1 settings profile)`);
  console.log("==================================================\n");

  return { merchants: seededMerchants, settings };
}

// Auto-run if executed directly from CLI
const isDirectExecution =
  process.argv[1] &&
  (process.argv[1] === __filename ||
    process.argv[1].endsWith("seed-demo-data.js"));

if (isDirectExecution) {
  seedDemoData()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("\n❌ Seeding failed with error:", err);
      await disconnectDB();
      process.exit(1);
    });
}
