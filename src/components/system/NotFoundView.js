import React from "react";
import Link from "next/link";
import SayPayLogo from "../SayPayLogo.js";

const QUICK_LINKS = [
  {
    href: "/",
    icon: "space_dashboard",
    title: "Dashboard",
    description: "Overview of recent checks and safety signals.",
  },
  {
    href: "/history",
    icon: "history",
    title: "Transaction history",
    description: "Browse every simulated check and settlement.",
  },
  {
    href: "/new-check",
    icon: "add_circle",
    title: "New payment check",
    description: "Capture a fresh intent and compare it safely.",
  },
];

export default function NotFoundView({
  title = "We couldn't find that page",
  description = "The link may be outdated, or this check or transaction does not exist in the sandbox workspace. Nothing was charged.",
}) {
  return (
    <main className="mx-auto flex w-full max-w-[880px] flex-1 items-center px-4 py-12 md:px-margin-desktop">
      <div className="w-full rounded-2xl border border-[#DFE5E8] bg-white p-5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_18px_50px_-28px_rgba(21,35,45,0.35)] sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <SayPayLogo />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DFE5E8] bg-[#F7F8FA] px-2.5 py-1 font-code-sm text-code-sm text-secondary">
            <span className="material-symbols-outlined text-[14px]">
              link_off
            </span>
            404
          </span>
        </div>

        <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#EAF7F1] text-primary ring-1 ring-[#A7F3D0]">
            <span className="material-symbols-outlined text-[38px]">
              travel_explore
            </span>
          </span>
          <div className="min-w-0">
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary">
              Route not found
            </span>
            <h1 className="mt-1 font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
              {title}
            </h1>
            <p className="mt-2 max-w-prose font-body-md text-body-md text-secondary">
              {description}
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 font-label-md text-label-md font-semibold text-white shadow-sm transition-all hover:bg-[#066653] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-container"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Back to dashboard
              </Link>
              <Link
                href="/history"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-5 font-label-md text-label-md font-semibold text-on-surface transition-colors hover:bg-[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-container"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  history
                </span>
                View history
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-2 border-t border-[#F0F3F5] pt-5 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border border-[#DFE5E8] bg-white p-3 transition-colors hover:border-[#A7F3D0] hover:bg-[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              <span className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
                <span className="material-symbols-outlined text-[17px] text-primary">
                  {link.icon}
                </span>
                {link.title}
                <span className="material-symbols-outlined ml-auto text-[15px] text-secondary transition-transform group-hover:translate-x-0.5">
                  chevron_right
                </span>
              </span>
              <span className="mt-1 block font-body-sm text-[11px] leading-relaxed text-secondary">
                {link.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
