import mongoose from "mongoose";
import { DatabaseError, sanitizeErrorMessage } from "./errors.js";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, listenersAttached: false };
}

/**
 * Ensures environment variables from .env.local are loaded if running in standalone scripts
 */
function getMongoUri() {
  let uri = process.env.MONGODB_URI;
  if (!uri && typeof window === "undefined") {
    try {
      // Lazy-load dotenv if running outside Next.js runtime (e.g. scripts or test runners)
      const dotenv = require("dotenv");
      dotenv.config({ path: ".env.local" });
      dotenv.config({ path: ".env" });
      uri = process.env.MONGODB_URI;
    } catch {
      // Ignore if dotenv is not available or if running in ESM where require is not defined
    }
  }
  return uri;
}

/**
 * Checks whether MongoDB is actively connected.
 * readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 *
 * @returns {boolean}
 */
export function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * Establishes a cached connection to MongoDB Atlas with timeout and retry handling.
 *
 * @param {object} [options={}]
 * @param {number} [options.maxRetries=2] - Number of retry attempts on initial failure
 * @param {number} [options.retryDelayMs=1000] - Backoff delay in milliseconds
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDB(options = {}) {
  const { maxRetries = 2, retryDelayMs = 1000 } = options;
  const uri = process.env.MONGODB_URI || getMongoUri();

  if (!uri) {
    throw new DatabaseError(
      "MONGODB_URI is not defined in environment variables. Please check .env.local"
    );
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.listenersAttached && mongoose.connection) {
    mongoose.connection.on("error", (err) => {
      console.error(`[MongoDB] Connection runtime error: ${sanitizeErrorMessage(err?.message)}`);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Disconnected from database.");
    });
    cached.listenersAttached = true;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    const attemptConnect = async (attempt = 1) => {
      try {
        const mongooseInstance = await mongoose.connect(uri, opts);
        const dbName = mongooseInstance.connection.name || "saypay";
        console.log(`[MongoDB] ✅ Connected successfully to database: "${dbName}"`);
        return mongooseInstance;
      } catch (err) {
        const sanitized = sanitizeErrorMessage(err?.message || "Unknown error");
        console.error(`[MongoDB] ❌ Connection attempt ${attempt} failed: ${sanitized}`);

        if (attempt <= maxRetries) {
          console.log(`[MongoDB] 🔄 Retrying connection in ${retryDelayMs * attempt}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs * attempt));
          return attemptConnect(attempt + 1);
        }

        throw new DatabaseError(`Failed to connect to MongoDB: ${sanitized}`);
      }
    };

    cached.promise = attemptConnect();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Disconnects from MongoDB and clears the connection cache.
 * Useful for test suites, scripts, and graceful shutdowns.
 */
export async function disconnectDB() {
  if (cached.conn || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("[MongoDB] Disconnected cleanly.");
  }
}

export default connectDB;
