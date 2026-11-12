"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [merchantKey, setMerchantKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          merchantKey: role === "seller" ? merchantKey.trim() : null,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(
              "saypay_demo_session",
              JSON.stringify({
                ...data.user,
                initials: data.user.name.slice(0, 2).toUpperCase(),
              })
            );
            window.dispatchEvent(new Event("saypay-auth-change"));
          } catch {}
        }
        router.push("/");
      } else {
        setErrorMessage(data.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      setSubmitting(false);
      setErrorMessage(err.message || "Network error. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-[540px] rounded-3xl border border-[#E2E8F0] bg-white p-8 md:p-10 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#003087] to-[#0070BA] flex items-center justify-center font-black text-lg text-white">
            P
          </div>
          <div>
            <span className="font-extrabold text-lg text-[#0F172A]">SayPay</span>
            <span className="block text-[11px] text-[#64748B]">Create your account</span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#0F172A] mb-1">Get started with SayPay</h1>
        <p className="text-xs text-[#64748B] mb-6">
          Fast, conversational payments verified with MatchCheck safety.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0070BA] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. john@saypay.app"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0070BA] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  role === "buyer"
                    ? "border-[#0070BA] bg-[#F0F9FF] text-[#0070BA]"
                    : "border-[#CBD5E1] bg-white text-[#64748B]"
                }`}
              >
                🛍️ Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  role === "seller"
                    ? "border-[#0070BA] bg-[#F0F9FF] text-[#0070BA]"
                    : "border-[#CBD5E1] bg-white text-[#64748B]"
                }`}
              >
                🏪 Merchant / Seller
              </button>
            </div>
          </div>

          {role === "seller" && (
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Merchant Key / Identifier
              </label>
              <input
                type="text"
                value={merchantKey}
                onChange={(e) => setMerchantKey(e.target.value)}
                placeholder="e.g. greenleaf-demo-store"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0070BA] transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0070BA] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-sm shadow-md shadow-[#0070BA]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#64748B]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#0070BA] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
