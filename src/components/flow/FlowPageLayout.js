"use client";

import React from "react";
import Link from "next/link";
import FlowStepper from "../layout/FlowStepper.js";

export default function FlowPageLayout({
  stage,
  status,
  tone = "clear",
  auditCount = 0,
  onOpenAuditLog,
  eyebrow = "New payment check",
  title,
  subtitle,
  badge,
  actions,
  assistant,
  children,
  role = "buyer",
  stages = null,
}) {
  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-6 sm:py-8 flex-1 flex flex-col gap-5 pb-24 md:pb-10">
      <header className="flex flex-col gap-4 border-b border-[#DFE5E8] pb-5">
        <div className="flex flex-wrap items-center gap-1.5 font-label-md text-label-md">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-secondary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">
              arrow_back
            </span>
            Dashboard
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-secondary">{eyebrow}</span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            {badge && (
              <div className="mb-2 flex flex-wrap items-center gap-2">{badge}</div>
            )}
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold tracking-tight text-on-surface">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 max-w-2xl font-body-md text-body-md text-secondary">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        </div>
      </header>

      <FlowStepper
        stage={stage}
        status={status}
        tone={tone}
        auditCount={auditCount}
        onOpenAuditLog={onOpenAuditLog}
        role={role}
        stages={stages}
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <aside className="min-w-0 lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
          {assistant}
        </aside>

        <section className="min-w-0 lg:col-span-7 xl:col-span-8">
          {children}
        </section>
      </div>
    </main>
  );
}
