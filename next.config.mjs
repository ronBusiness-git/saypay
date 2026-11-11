import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables for build/dev startup
dotenv.config({ path: path.join(__dirname, ".env.local") });
dotenv.config({ path: path.join(__dirname, ".env") });

let dbChecked = false;

async function logDbStatus() {
  if (dbChecked) return;
  dbChecked = true;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("[MongoDB] ⚠️  MONGODB_URI is not set in .env.local");
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
      bufferCommands: false,
    });
    const dbName = conn.connection.name || "saypay";
    console.log(`[MongoDB] ✅ Database connection verified for build! Connected to: "${dbName}"`);
    await mongoose.disconnect();
  } catch (err) {
    console.warn(`[MongoDB] ⚠️  Build-time connection check: ${err.message}`);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = async () => {
  await logDbStatus();

  return {
    turbopack: {
      root: __dirname,
    },
    // Performance & prefetching flags
    cacheComponents: true,
    partialPrefetching: true,
  };
};

export default nextConfig;
