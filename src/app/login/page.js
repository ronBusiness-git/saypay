"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SayPayLogo from "../../components/SayPayLogo.js";
import { signInDemo, signOutDemo, useDemoSession } from "../../lib/demoAuth.js";

const DEMO_EMAIL = "demo@saypay.app";
const DEMO_PASSWORD = "saypay-demo";

const ASSIST_STEPS = ["Listening to intent", "Reading payment request", "Comparing both sources", "Applying safety rules"];

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
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event) => {
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
    window.setTimeout(() => {
      signInDemo(email.trim());
      router.push("/");
    }, 650);
  };

  const useDemoCredentials = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setErrors({});
  };

  return (
    <main className="mx-auto w-full max-w-[1040px] px-4 py-8 md:px-margin-desktop md:py-14">
      <div className="overflow-hidden rounded-2xl border border-[#DFE5E8] bg-white shadow-[0_18px_50px_-24px_rgba(15,29,39,0.35)]">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          {/* Brand / live assist panel */}
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

              <ul className="mt-6 hidden space-y-2.5 sm:block">
                {ASSIST_STEPS.map((step, i) => (
                  <li key={step} className="flex items-center gap-2.5 font-body-sm text-[12px] text-[#CDEBE3]">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        i === 0
                          ? "bg-[#78D8BD] text-[#0B3A33]"
                          : "border border-white/25 bg-white/5 text-[#9FD9C9]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {i === 0 ? "graphic_eq" : "check"}
                      </span>
                    </span>
                    {step}
                  </li>
                ))}
              </ul>

              <p className="mt-6 hidden items-start gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 font-body-sm text-[11px] leading-relaxed text-[#BFE6DA] sm:mt-8 sm:flex">
                <span className="material-symbols-outlined text-[14px] text-[#78D8BD]">verified_user</span>
                Server rules decide every result. The assistant only narrates the checks.
              </p>
            </div>
          </aside>

          {/* Sign-in form */}
          <section className="px-6 py-8 md:px-9 md:py-10">
            {session ? (
              <div className="flex h-full flex-col justify-center">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2.5 py-1 font-label-sm text-[10px] font-semibold text-[#107E3E]">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  Session active
                </span>
                <h2 className="mt-4 font-headline-md text-headline-md text-on-surface">
                  You&apos;re already signed in
                </h2>
                <p className="mt-2 font-body-md text-body-md text-secondary">
                  Signed in as <span className="font-semibold text-on-surface">{session.email}</span>.
                </p>
                <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                  <Link
                    href="/"
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 font-label-md text-label-md font-semibold text-white shadow-sm transition-all hover:bg-[#066653] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-container"
                  >
                    Continue to dashboard
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOutDemo()}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-secondary transition-colors hover:border-[#FECACA] hover:bg-[#FFF5F5] hover:text-[#DC2626]"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Log out
                  </button>
                </div>
                <p className="mt-5 font-body-sm text-[11px] text-secondary">
                  Use the log out button in the navbar to switch accounts.
                </p>
              </div>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DFE5E8] bg-[#F7F8FA] px-2.5 py-1 font-label-sm text-[10px] font-semibold uppercase tracking-wide text-secondary">
                  <span className="material-symbols-outlined text-[13px] text-primary">lock</span>
                  Demo sign in
                </span>

                <h2 className="mt-4 font-headline-md text-headline-md text-on-surface">Welcome back</h2>
                <p className="mt-1.5 font-body-md text-body-md text-secondary">
                  Use the demo merchant credentials to open the workspace.
                </p>

                <div className="mt-5 flex flex-col gap-2 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-label-sm text-[10px] font-semibold uppercase tracking-wide text-secondary">
                      Demo credentials
                    </p>
                    <p className="mt-0.5 truncate font-code-md text-[12px] text-on-surface">
                      {DEMO_EMAIL} · {DEMO_PASSWORD}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={useDemoCredentials}
                    className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-[#A7F3D0] bg-[#EAF7F1] px-2.5 py-1.5 font-label-sm text-[11px] font-semibold text-[#107E3E] transition-colors hover:bg-[#DCF3E8] sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_paste</span>
                    Autofill
                  </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
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
                        aria-describedby={errors.email ? "login-email-error" : undefined}
                        placeholder="you@merchant.com"
                        className="min-h-[44px] w-full rounded-lg bg-transparent px-2.5 font-body-md text-body-md text-on-surface placeholder:text-[#9AA6AF] focus:outline-none"
                      />
                    </div>
                    <div id="login-email-error">
                      <FieldError>{errors.email}</FieldError>
                    </div>
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
                        aria-describedby={errors.password ? "login-password-error" : undefined}
                        placeholder="Enter your password"
                        className="min-h-[44px] w-full rounded-lg bg-transparent px-2.5 font-body-md text-body-md text-on-surface placeholder:text-[#9AA6AF] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-[#F7F8FA] hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    <div id="login-password-error">
                      <FieldError>{errors.password}</FieldError>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 font-body-sm text-[12px] text-secondary">
                      <input
                        id="keep-signed-in"
                        name="keepSignedIn"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-[#DFE5E8] accent-[#087F68]"
                      />
                      Keep me signed in on this demo
                    </label>
                    <span className="font-body-sm text-[12px] text-secondary underline decoration-dotted underline-offset-2">
                      Forgot password?
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-primary-container px-5 font-label-md text-label-md font-semibold text-white shadow-sm transition-all hover:bg-[#066653] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-container disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Log in
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-5 flex items-start gap-1.5 font-body-sm text-[11px] leading-relaxed text-secondary">
                  <span className="material-symbols-outlined text-[14px] text-[#B45309]">warning</span>
                  Frontend demo only. No real accounts, credentials, or money are involved.
                </p>

                <div className="mt-5 border-t border-[#DFE5E8] pt-4">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary transition-colors hover:text-primary-container"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to dashboard
                  </Link>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 font-body-sm text-[11px] text-secondary">
        <span className="material-symbols-outlined text-[14px]">shield</span>
        PayPal Sandbox · Simulated gateway · Mock ledger
      </p>
    </main>
  );
}
