"use client";

import { useSyncExternalStore } from "react";

const SESSION_KEY = "saypay_demo_session";
const AUTH_EVENT = "saypay-auth-change";

function subscribe(callback) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
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

export function signInDemo(email) {
  const handle = (email || "demo@saypay.app").split("@")[0];
  const name = handle
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const session = {
    email,
    name: name || "Demo User",
    initials: (name || "Demo User")
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    signedInAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    return session;
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
  return session;
}

export function signOutDemo() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
}
