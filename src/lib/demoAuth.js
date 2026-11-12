"use client";

import { useSyncExternalStore } from "react";

const SESSION_KEY = "saypay_demo_session";
const AUTH_EVENT = "saypay-auth-change";

const DEMO_PASSWORD = "saypay123";
const DEMO_ACCOUNTS = {
  "buyer@saypay.app": {
    userId: "usr_buyer_john_doe",
    name: "John Doe",
    role: "buyer",
    merchantKey: null,
  },
  "seller@saypay.app": {
    userId: "usr_seller_greenleaf",
    name: "GreenLeaf Demo Store",
    role: "seller",
    merchantKey: "greenleaf-demo-store",
  },
};

function subscribe(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot() {
  return null;
}

export function useDemoSession() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildSession(user) {
  const name = user.name || "User";
  return {
    userId: user.userId,
    email: user.email,
    name,
    role: user.role,
    merchantKey: user.merchantKey ?? null,
    initials: name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    signedInAt: new Date().toISOString(),
  };
}

function storeSession(session) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

/**
 * Local sandbox sessions for the seeded demo accounts, used when the
 * MongoDB-backed auth API is unreachable (e.g. no MONGODB_URI configured).
 */
function localDemoSession(email, password) {
  const account = DEMO_ACCOUNTS[email];
  if (!account || password !== DEMO_PASSWORD) return null;
  return buildSession({ ...account, email });
}

/**
 * Sign in with email and password via the backend API, falling back to the
 * seeded demo accounts when the database is unavailable.
 */
export async function login(email, password = DEMO_PASSWORD) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      return { success: false, error: data.error || "Invalid email or password" };
    }

    if (!res.ok || !data.user) {
      throw new Error(data.error || `Sign-in failed (${res.status})`);
    }

    const session = buildSession(data.user);
    storeSession(session);
    return { success: true, user: session };
  } catch {
    const fallback = localDemoSession(normalizedEmail, password);
    if (!fallback) {
      return {
        success: false,
        error:
          "Sign-in service is unavailable. Use a demo account: buyer@saypay.app or seller@saypay.app with password saypay123.",
      };
    }
    storeSession(fallback);
    return { success: true, user: fallback };
  }
}

/**
 * Convenience helper for 1-click demo login buttons.
 */
export async function signInDemo(email = "buyer@saypay.app", password = DEMO_PASSWORD) {
  return await login(email, password);
}

/**
 * Sign out via backend and clear local state.
 */
export async function signOutDemo() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore network error on logout
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new Event(AUTH_EVENT));
    } catch {
      // Ignore storage errors
    }
  }
}
