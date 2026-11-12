import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import crypto from "crypto";

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
import User from "../src/models/User.js";
import Invoice from "../src/models/Invoice.js";
import { generateSalt, hashPassword } from "../src/lib/session.js";

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

const DEMO_USERS = [
  {
    userId: "usr_buyer_john_doe",
    email: "buyer@saypay.app",
    name: "John Doe",
    role: "buyer",
    merchantKey: null,
    password: "saypay123",
  },
  {
    userId: "usr_seller_greenleaf",
    email: "seller@saypay.app",
    name: "GreenLeaf Demo Store",
    role: "seller",
    merchantKey: "greenleaf-demo-store",
    password: "saypay123",
  },
];

const DEMO_INVOICES = [
  {
    invoiceId: "GL-1042",
    merchantKey: "greenleaf-demo-store",
    merchantName: "GreenLeaf Demo Store",
    buyerEmail: "buyer@saypay.app",
    amount: "12.50",
    currency: "USD",
    description: "Office organic coffee and tea supplies",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: "UNPAID",
  },
  {
    invoiceId: "TN-2210",
    merchantKey: "technova-supplies",
    merchantName: "TechNova Supplies",
    buyerEmail: "buyer@saypay.app",
    amount: "49.99",
    currency: "USD",
    description: "Ergonomic keyboard wrist rest & USB-C hub",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: "UNPAID",
  },
  {
    invoiceId: "AC-901",
    merchantKey: "apex-utilities",
    merchantName: "Apex Utilities",
    buyerEmail: "buyer@saypay.app",
    amount: "125.00",
    currency: "USD",
    description: "Monthly high-speed fiber internet subscription",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    status: "UNPAID",
  },
  {
    invoiceId: "GL-1043",
    merchantKey: "greenleaf-demo-store",
    merchantName: "GreenLeaf Demo Store",
    buyerEmail: "buyer@saypay.app",
    amount: "24.00",
    currency: "USD",
    description: "Eco-friendly recyclable desk stationery kit",
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    status: "UNPAID",
  },
  {
    invoiceId: "TN-2215",
    merchantKey: "technova-supplies",
    merchantName: "TechNova Supplies",
    buyerEmail: "buyer@saypay.app",
    amount: "85.50",
    currency: "USD",
    description: "Dual-monitor stand with integrated cable organizer",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: "UNPAID",
  },
  {
    invoiceId: "AC-902",
    merchantKey: "apex-utilities",
    merchantName: "Apex Utilities",
    buyerEmail: "buyer@saypay.app",
    amount: "35.00",
    currency: "USD",
    description: "Server room backup electricity surge protection plan",
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    status: "UNPAID",
  },
  {
    invoiceId: "GL-1020",
    merchantKey: "greenleaf-demo-store",
    merchantName: "GreenLeaf Demo Store",
    buyerEmail: "buyer@saypay.app",
    amount: "18.00",
    currency: "USD",
    description: "Fair-trade artisan dark roast beans",
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: "PAID",
    transactionId: "TX-GL-PAID-01",
  },
  {
    invoiceId: "TN-2190",
    merchantKey: "technova-supplies",
    merchantName: "TechNova Supplies",
    buyerEmail: "buyer@saypay.app",
    amount: "95.00",
    currency: "USD",
    description: "Mechanical hot-swap numpad",
    dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    status: "PAID",
    transactionId: "TX-TN-PAID-02",
  },
];

export async function seedDemoData() {
  console.log("==================================================");
  console.log("🌱 [SayPay] Seeding Demo Merchants, Users & Invoices");
  console.log("==================================================");

  await connectDB();

  // 1. Sync indexes
  console.log("\n📦 Synchronizing MongoDB indexes...");
  await Promise.all([
    Merchant.syncIndexes(),
    DemoSettings.syncIndexes(),
    Transaction.syncIndexes(),
    User.syncIndexes(),
    Invoice.syncIndexes(),
  ]);
  console.log("✅ Indexes synchronized successfully.");

  // 2. Seed Merchants
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
      `   ✓ [${updated.status}] ${updated.displayName} (${updated.merchantKey})`
    );
  }

  // 3. Seed DemoSettings
  console.log("\n⚙️  Upserting default demo settings...");
  const settings = await DemoSettings.findOneAndUpdate(
    { workspaceId: DEFAULT_DEMO_SETTINGS.workspaceId },
    { $set: DEFAULT_DEMO_SETTINGS },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  console.log(`   ✓ Workspace: ${settings.workspaceId} | Currency: ${settings.currency}`);

  // 4. Seed Users
  console.log("\n👤 Upserting demo users...");
  for (const u of DEMO_USERS) {
    const salt = generateSalt();
    const hash = hashPassword(u.password, salt);
    await User.findOneAndUpdate(
      { email: u.email },
      {
        $set: {
          userId: u.userId,
          email: u.email,
          name: u.name,
          role: u.role,
          merchantKey: u.merchantKey,
          passwordHash: hash,
          passwordSalt: salt,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    console.log(`   ✓ User: ${u.name} <${u.email}> (${u.role}) password: ${u.password}`);
  }

  // 5. Seed Invoices
  console.log("\n📄 Upserting demo invoices...");
  for (const inv of DEMO_INVOICES) {
    await Invoice.findOneAndUpdate(
      { invoiceId: inv.invoiceId },
      { $set: inv },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    console.log(
      `   ✓ Invoice [${inv.status}] ${inv.invoiceId}: $${inv.amount} to ${inv.merchantName} (${inv.description})`
    );
  }

  console.log("\n==================================================");
  console.log(`🎉 Seeding complete!`);
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
