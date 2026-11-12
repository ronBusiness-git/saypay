"use client";

import { useSyncExternalStore } from "react";

const SESSION_KEY = "saypay_demo_session";
const AUTH_EVENT = "saypay-auth-change";

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

/**
 * Sign in with email and password via real backend API and update client state.
 */
export async function login(email, password = "saypay123") {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    const user = data.user;
    const session = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      merchantKey: user.merchantKey,
      initials: (user.name || "User")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      signedInAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        window.dispatchEvent(new Event(AUTH_EVENT));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
    }
    return { success: true, user: session };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Convenience helper for 1-click demo login buttons.
 */
export async function signInDemo(email = "buyer@saypay.app", password = "saypay123") {
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
