"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SayPayLogo from "../../components/SayPayLogo.js";
import { login, signInDemo, signOutDemo, useDemoSession } from "../../lib/demoAuth.js";

const DEMO_BUYER = {
  email: "buyer@saypay.app",
  password: "saypay123",
  name: "John Doe",
  role: "buyer",
  badge: "Buyer Account",
  desc: "Review invoices & authorize payments with voice AI",
};

const DEMO_SELLER = {
  email: "seller@saypay.app",
  password: "saypay123",
  name: "GreenLeaf Demo Store",
  role: "seller",
  badge: "Merchant Account",
  desc: "Create invoices via voice & track incoming revenue",
};

const ASSIST_STEPS = [
  "Voice & text intent understanding",
  "Deterministic MatchCheck safety rules",
  "Automated invoice linking & generation",
  "Human 1-click PayPal authorization",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 font-body-sm text-[11px] text-[#DC2626]">
      <span className="material-symbols-outlined text-[13px]">error</span>
      {children}
    </p>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const session = useDemoSession();

  const [email, setEmail] = useState("buyer@saypay.app");
  const [password, setPassword] = useState("saypay123");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("buyer");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const res = await login(email.trim(), password);
    setSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrors({ auth: res.error || "Authentication failed. Check credentials." });
    }
  };

  const handleRoleSelect = async (account) => {
    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
    setSubmitting(true);

    const res = await signInDemo(account.email, account.password);
    setSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrors({ auth: res.error || "Login failed" });
    }
  };

  const handleLogout = async () => {
    await signOutDemo();
    router.refresh();
  };

  return (
    <main className="mx-auto w-full max-w-[1040px] px-4 py-8 md:px-margin-desktop md:py-14">
      <div className="overflow-hidden rounded-2xl border border-[#DFE5E8] bg-white shadow-[0_18px_50px_-24px_rgba(15,29,39,0.35)]">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          {/* Brand / live assist panel (Rabin's Teal Palette) */}
          <aside className="relative overflow-hidden bg-[#0B3A33] px-6 py-8 md:px-9 md:py-10 text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#00A884]/25 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#78D8BD]/15 blur-2xl"
            />

            <div className="relative">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <SayPayLogo className="h-6 w-auto" showWordmark={false} />
                </span>
                <span className="font-headline-sm text-headline-sm text-white">SayPay</span>
              </div>

              <h1 className="mt-7 max-w-[19rem] font-headline-lg text-[28px] leading-[34px] font-semibold tracking-tight">
                Say it. Check it.
                <br />
                Pay with confidence.
              </h1>
              <p className="mt-3 hidden max-w-[22rem] font-body-md text-[13px] leading-relaxed text-[#CDEBE3] sm:block">
                Sign in to review voice-captured payment requests, compare them against the merchant
                record, and clear only what passes every safety rule.
              </p>

              {/* Live assistant orb */}
              <div className="mt-6 flex items-center gap-4 sm:mt-8">
                <span className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                  <span className="voice-ring-1 absolute inset-0 rounded-full border border-[#78D8BD]/60" />
                  <span className="voice-ring-2 absolute inset-0 rounded-full border border-[#78D8BD]/40" />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#087F68] shadow-lg ring-4 ring-[#087F68]/30">
                    <span className="material-symbols-outlined text-[22px] text-white">graphic_eq</span>
                  </span>
                </span>
                <div className="flex h-9 items-end gap-1" aria-hidden="true">
                  {["h-3", "h-6", "h-8", "h-5", "h-7", "h-4"].map((height, i) => (
                    <span
                      key={height + i}
                      className={`wave-bar-${i + 1} w-1.5 rounded-full bg-[#78D8BD] ${height}`}
                    />
                  ))}
                </div>
              </div>

              <ul className="mt-6 hidden space-y-2 border-t border-white/15 pt-6 sm:block">
                {ASSIST_STEPS.map((step, idx) => (
                  <li key={step} className="flex items-center gap-2 font-body-sm text-[12px] text-[#CDEBE3]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00A884]/20 font-code-sm text-[10px] text-[#78D8BD]">
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Login Form Panel */}
          <section className="flex flex-col justify-between p-6 sm:p-9">
            {session ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#A7F3D0] bg-[#EAF7F1] p-4 text-[#107E3E]">
                  <p className="font-label-md text-label-md font-semibold">Currently signed in as:</p>
                  <p className="font-body-md text-body-md font-bold mt-1">{session.name} ({session.email})</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#107E3E] text-white text-[11px] font-semibold">
                    {session.role === "seller" ? "Merchant / Seller Mode" : "Buyer Mode"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push("/")}
                    className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-primary-container px-5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-[#066653]"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-secondary hover:text-[#DC2626] hover:bg-[#FFF5F5]"
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                    Log in to SayPay
                  </h2>
                  <p className="mt-1 font-body-sm text-body-sm text-secondary">
                    Select your demo role or enter your credentials below.
                  </p>

                  {/* Two Role Quick-Login Cards: Buyer vs Seller */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect(DEMO_BUYER)}
                      disabled={submitting}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedRole === "buyer"
                          ? "border-[#087F68] bg-[#EAF7F1] ring-2 ring-[#087F68]/20"
                          : "border-[#DFE5E8] bg-white hover:bg-[#F7F8FA]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[18px] text-[#087F68]">
                          shopping_bag
                        </span>
                        <span className="text-[10px] font-bold text-[#107E3E] uppercase">
                          Buyer
                        </span>
                      </div>
                      <p className="font-label-md text-label-md font-bold text-on-surface mt-1">
                        John Doe
                      </p>
                      <p className="text-[10px] text-secondary truncate">buyer@saypay.app</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleSelect(DEMO_SELLER)}
                      disabled={submitting}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedRole === "seller"
                          ? "border-[#087F68] bg-[#EAF7F1] ring-2 ring-[#087F68]/20"
                          : "border-[#DFE5E8] bg-white hover:bg-[#F7F8FA]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[18px] text-[#087F68]">
                          storefront
                        </span>
                        <span className="text-[10px] font-bold text-[#087F68] uppercase">
                          Seller
                        </span>
                      </div>
                      <p className="font-label-md text-label-md font-bold text-on-surface mt-1">
                        GreenLeaf
                      </p>
                      <p className="text-[10px] text-secondary truncate">seller@saypay.app</p>
                    </button>
                  </div>
                </div>

                {errors.auth && (
                  <div className="mt-3 rounded-lg border border-[#FECACA] bg-[#FFF5F5] p-2.5 text-xs text-[#DC2626]">
                    {errors.auth}
                  </div>
                )}

                <form className="mt-5 space-y-3.5" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block font-label-md text-label-md text-on-surface"
                    >
                      Email address
                    </label>
                    <div
                      className={`mt-1.5 flex items-center rounded-lg border bg-white pl-3 transition-colors focus-within:ring-2 focus-within:ring-offset-1 ${
                        errors.email
                          ? "border-[#FECACA] focus-within:ring-[#FECACA]"
                          : "border-[#DFE5E8] focus-within:border-primary-container focus-within:ring-[#A7F3D0]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">mail</span>
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        aria-invalid={Boolean(errors.email)}
                        placeholder="you@saypay.app"
                        className="min-h-[44px] w-full rounded-lg bg-transparent px-2.5 font-body-md text-body-md text-on-surface placeholder:text-[#9AA6AF] focus:outline-none"
                      />
                    </div>
                    <FieldError>{errors.email}</FieldError>
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block font-label-md text-label-md text-on-surface"
                    >
                      Password
                    </label>
                    <div
                      className={`mt-1.5 flex items-center rounded-lg border bg-white pl-3 transition-colors focus-within:ring-2 focus-within:ring-offset-1 ${
                        errors.password
                          ? "border-[#FECACA] focus-within:ring-[#FECACA]"
                          : "border-[#DFE5E8] focus-within:border-primary-container focus-within:ring-[#A7F3D0]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">key</span>
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        aria-invalid={Boolean(errors.password)}
                        placeholder="Enter password (saypay123)"
                        className="min-h-[44px] w-full rounded-lg bg-transparent px-2.5 font-body-md text-body-md text-on-surface placeholder:text-[#9AA6AF] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-[#F7F8FA]"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    <FieldError>{errors.password}</FieldError>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-primary-container px-5 font-label-md text-label-md font-semibold text-white shadow-sm transition-all hover:bg-[#066653] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 mt-2"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign in as {selectedRole === "seller" ? "Merchant" : "Buyer"}
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-5 text-center font-body-sm text-[11px] text-secondary">
                  Password for demo accounts: <code className="font-mono text-[#087F68] font-bold">saypay123</code>
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
