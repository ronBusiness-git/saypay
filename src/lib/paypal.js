import crypto from "crypto";

function getPayPalCredentials() {
  return {
    baseUrl: process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com",
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  };
}

// In-memory token cache to prevent redundant token requests
let tokenCache = {
  accessToken: null,
  expiresAt: 0,
};

/**
 * Returns whether real PayPal credentials have been configured.
 * @returns {boolean}
 */
export function isPayPalConfigured() {
  const { clientId, clientSecret } = getPayPalCredentials();
  return (
    !!clientId &&
    !!clientSecret &&
    !clientId.includes("your_paypal") &&
    !clientSecret.includes("your_paypal")
  );
}

/**
 * Retrieves a valid OAuth 2.0 access token from PayPal.
 * Caches token in memory until 60 seconds before expiration.
 *
 * @returns {Promise<string>}
 */
export async function getPayPalAccessToken() {
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 60000) {
    return tokenCache.accessToken;
  }

  const { baseUrl, clientId, clientSecret } = getPayPalCredentials();

  if (!isPayPalConfigured()) {
    throw new Error(
      "PayPal Sandbox credentials are not configured in .env.local. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET."
    );
  }

  const basicAuth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[PayPal OAuth] Failed to acquire access token:", errorText);
    throw new Error(`PayPal OAuth failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  tokenCache.accessToken = data.access_token;
  tokenCache.expiresAt = now + data.expires_in * 1000;

  return tokenCache.accessToken;
}

/**
 * Creates an authoritative PayPal Orders v2 Order.
 *
 * Requirements from Technical Specification Section 8:
 * - intent = CAPTURE
 * - exact server-approved amount & currency
 * - unique PayPal-Request-Id header for idempotency
 *
 * @param {object} params
 * @param {string} params.checkId - The verified PaymentCheck ID
 * @param {string} params.amount - Decimal string (e.g. "12.50")
 * @param {string} params.currency - 3-letter currency code (e.g. "USD")
 * @param {string} [params.reference] - Normalized merchant invoice reference
 * @param {string} [params.description] - Description string
 * @param {string} [params.idempotencyKey] - Unique key for PayPal-Request-Id
 * @returns {Promise<{ orderId: string, status: string, raw: object }>}
 */
export async function createPayPalOrder({
  checkId,
  amount,
  currency = "USD",
  reference = null,
  description = "SayPay verified payment",
  idempotencyKey = null,
}) {
  const { baseUrl } = getPayPalCredentials();
  const token = await getPayPalAccessToken();
  const requestId = idempotencyKey || crypto.randomUUID();

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: `SAYPAY-CHECK-${checkId}`,
        invoice_id: reference || undefined,
        description: description.slice(0, 127),
        amount: {
          currency_code: currency.toUpperCase(),
          value: Number(amount).toFixed(2),
        },
      },
    ],
  };

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": requestId,
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error("[PayPal Create Order] Failed:", responseData);
    throw new Error(
      responseData.message || `PayPal Create Order failed with status ${response.status}`
    );
  }

  return {
    orderId: responseData.id,
    status: responseData.status,
    raw: responseData,
  };
}

/**
 * Captures an approved PayPal Order.
 *
 * Requirements from Technical Specification Section 9:
 * - Only after buyer approval
 * - Sends PayPal-Request-Id for idempotency
 * - Validates capture details
 *
 * @param {object} params
 * @param {string} params.orderId - The PayPal Order ID
 * @param {string} [params.idempotencyKey] - Idempotency key
 * @returns {Promise<{ captureId: string, status: string, raw: object }>}
 */
export async function capturePayPalOrder({ orderId, idempotencyKey = null }) {
  const { baseUrl } = getPayPalCredentials();
  const token = await getPayPalAccessToken();
  const requestId = idempotencyKey || crypto.randomUUID();

  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": requestId,
        Prefer: "return=representation",
      },
      body: JSON.stringify({}),
    }
  );

  const responseData = await response.json();

  if (!response.ok) {
    console.error("[PayPal Capture Order] Failed:", responseData);
    throw new Error(
      responseData.message || `PayPal Capture failed with status ${response.status}`
    );
  }

  // Extract captureId from purchase_units
  let captureId = null;
  const payments = responseData.purchase_units?.[0]?.payments?.captures;
  if (payments && payments.length > 0) {
    captureId = payments[0].id;
  }

  return {
    captureId,
    status: responseData.status,
    raw: responseData,
  };
}

/**
 * Retrieves details of an existing PayPal Order for reconciliation.
 *
 * @param {string} orderId
 * @returns {Promise<object>}
 */
export async function getPayPalOrderDetails(orderId) {
  const { baseUrl } = getPayPalCredentials();
  const token = await getPayPalAccessToken();

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to retrieve PayPal order: ${response.status}`);
  }

  return await response.json();
}

export default {
  isPayPalConfigured,
  getPayPalAccessToken,
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrderDetails,
};
