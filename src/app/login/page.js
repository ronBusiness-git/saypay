"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, signInDemo, signOutDemo, useDemoSession } from "@/lib/demoAuth.js";

const DEMO_ACCOUNTS = [
  {
    role: "buyer",
    label: "Continue as Buyer",
    name: "John Doe",
    email: "buyer@saypay.app",
    password: "saypay123",
    badge: "Buyer Demo",
    description: "Review & pay invoices with SayPay conversational AI assistant.",
    icon: "🛍️",
  },
  {
    role: "seller",
    label: "Continue as Seller",
    name: "GreenLeaf Demo Store",
    email: "seller@saypay.app",
    password: "saypay123",
    badge: "Merchant Demo",
    description: "Manage issued invoices and review incoming payments.",
    icon: "🌿",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const session = useDemoSession();

  const [email, setEmail] = useState("buyer@saypay.app");
  const [password, setPassword] = useState("saypay123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const res = await login(email.trim(), password);
    setSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMessage(res.error || "Invalid credentials.");
    }
  }

  async function handleQuickLogin(account) {
    setSubmitting(true);
    setErrorMessage("");
    setEmail(account.email);
    setPassword(account.password);

    const res = await signInDemo(account.email, account.password);
    setSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMessage(res.error || "Quick login failed.");
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-[960px] overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-xl shadow-slate-200/50">
        <div className="grid lg:grid-cols-[1fr_1.1fr]">
          {/* Brand & Value Proposition Column */}
          <aside className="relative overflow-hidden bg-gradient-to-br from-[#003087] via-[#004B8D] to-[#0070BA] p-8 md:p-10 text-white flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-xl text-white">
                  P
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight">SayPay</span>
                  <span className="block text-xs text-blue-200 font-medium">PayPal AI Safety Gateway</span>
                </div>
              </div>

              <div className="mt-10">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                  Say it. Check it. <br />
                  Pay with confidence.
                </h1>
                <p className="mt-3 text-sm text-blue-100 leading-relaxed">
                  SayPay powers voice-driven, conversational payments backed by deterministic
                  MatchCheck verification and human 1-click PayPal authorization.
                </p>
              </div>

              {/* 3 Step Indicator */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                  <span className="w-6 h-6 rounded-full bg-white text-[#003087] flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <span className="text-xs font-medium text-white">Speak or type your payment intent</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                  <span className="w-6 h-6 rounded-full bg-white text-[#003087] flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <span className="text-xs font-medium text-white">MatchCheck verifies amounts & recipient</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                  <span className="w-6 h-6 rounded-full bg-white text-[#003087] flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <span className="text-xs font-medium text-white">Authorize with 1-click PayPal Sandbox</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-8 border-t border-white/10 text-xs text-blue-200">
              Built for the PayPal AI Developer Hackathon 2026.
            </div>
          </aside>

          {/* Form & 1-Click Login Column */}
          <section className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A]">Welcome to SayPay</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Sign in to your account or use quick demo access</p>
                </div>
                <Link
                  href="/signup"
                  className="text-xs font-semibold text-[#0070BA] hover:underline"
                >
                  Create account
                </Link>
              </div>

              {/* Quick 1-Click Demo Logins */}
              <div className="mt-6">
                <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-2.5">
                  1-Click Demo Profiles:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      disabled={submitting}
                      className="p-3.5 rounded-2xl border border-[#CBD5E1] hover:border-[#0070BA] hover:bg-[#F0F9FF] text-left transition-all group shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{acc.icon}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#E2E8F0] text-[#334155] group-hover:bg-[#0070BA] group-hover:text-white transition-colors">
                          {acc.badge}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-[#0F172A]">{acc.name}</p>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">{acc.email}</p>
                      <span className="block mt-2 text-[11px] text-[#0070BA] font-semibold group-hover:underline">
                        Sign in ➔
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2E8F0]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-[#94A3B8]">or sign in with password</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@saypay.app"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0070BA] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0070BA] focus:border-transparent transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-xs text-[#64748B] hover:text-[#0F172A]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-sm shadow-md shadow-[#0070BA]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in with SayPay"
                  )}
                </button>
              </form>
            </div>

            <p className="mt-8 text-center text-xs text-[#94A3B8]">
              Protected by PayPal Sandbox Integration · SayPay v1.0
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
