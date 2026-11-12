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
    const connectPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
      bufferCommands: false,
    });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Connection timed out (1.5s limit)")), 1500)
    );
    const conn = await Promise.race([connectPromise, timeoutPromise]);
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
    partialPrefetching: false,
  };
};

export default nextConfig;
