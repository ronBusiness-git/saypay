import crypto from "crypto";

const SESSION_COOKIE_NAME = "saypay_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "saypay-hackathon-secret-key-2026";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export { SESSION_COOKIE_NAME };

/**
 * Generate a cryptographically secure random salt.
 */
export function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Hash a password using scrypt.
 */
export function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

/**
 * Verify a plain password against stored hash and salt.
 */
export function verifyPassword(password, hash, salt) {
  try {
    const computedHash = hashPassword(password, salt);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(hash, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Sign a payload using HMAC-SHA256.
 */
function signPayload(payloadStr) {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadStr)
    .digest("base64url");
}

/**
 * Create a signed session token.
 */
export function createSessionToken(user) {
  const payload = {
    userId: user.userId,
    email: user.email.toLowerCase(),
    name: user.name,
    role: user.role || "buyer",
    merchantKey: user.merchantKey || null,
    exp: Date.now() + SESSION_DURATION_MS,
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(payloadStr);
  return `${payloadStr}.${signature}`;
}

/**
 * Verify and decode a session token.
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expectedSig = signPayload(payloadStr);

  try {
    const isSigValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSig)
    );
    if (!isSigValid) return null;

    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract session user from an incoming request or cookie string.
 */
export function getSessionUser(request) {
  let token = null;

  if (request) {
    if (typeof request.cookies?.get === "function") {
      token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    } else if (typeof request.headers?.get === "function") {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
      if (match) token = match[1];
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Helper to build Set-Cookie header for a valid session.
 */
export function createSessionCookie(token) {
  const isProd = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
    SESSION_DURATION_MS / 1000
  }${isProd ? "; Secure" : ""}`;
}

/**
 * Helper to build Set-Cookie header to clear session.
 */
export function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
