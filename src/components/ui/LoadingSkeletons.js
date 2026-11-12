import React from "react";

const CARD =
  "rounded-2xl border border-[#DFE5E8] bg-white shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]";
const SOFT_CARD = "rounded-xl border border-[#DFE5E8] bg-white shadow-sm";

export function Skeleton({ className = "", style }) {
  return (
    <div aria-hidden="true" className={`skeleton ${className}`} style={style} />
  );
}

export function PageHeaderSkeleton({ withActions = true, withEyebrow = true }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-4 border-b border-[#DFE5E8] pb-space-lg md:flex-row md:items-end md:justify-between"
    >
      <div className="space-y-2.5">
        {withEyebrow && <Skeleton className="h-3.5 w-36" />}
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-[22rem] max-w-full" />
      </div>
      {withActions && (
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-11 w-32 rounded-[10px]" />
          <Skeleton className="h-11 w-44 rounded-[10px]" />
        </div>
      )}
    </div>
  );
}

export function SummaryCardsSkeleton({ count = 5 }) {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-2 gap-3 sm:gap-space-md lg:grid-cols-5"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${CARD} p-space-md`}>
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2 w-2 rounded-full" />
          </div>
          <Skeleton className="mt-2.5 h-7 w-16" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ variant = "bar" }) {
  return (
    <section aria-hidden="true" className={`${CARD} flex flex-col p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-[19px] w-[19px] rounded-md" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="mt-2 h-3 w-48" />
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      <div className="mt-4 h-[230px]">
        {variant === "line" ? (
          <svg
            viewBox="0 0 320 140"
            className="h-full w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {[30, 62, 94, 126].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="320"
                y2={y}
                stroke="#F0F3F5"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
            <path
              d="M0 120 L32 110 L64 116 L96 96 L128 104 L160 80 L192 92 L224 64 L256 76 L288 48 L320 62"
              fill="none"
              stroke="#E6ECEA"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 128 L32 122 L64 124 L96 112 L128 118 L160 104 L192 110 L224 96 L256 100 L288 88 L320 94"
              fill="none"
              stroke="#F0F3F5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <div className="flex h-full items-end gap-2">
            {[52, 74, 46, 88, 64, 80, 58, 92, 70, 84, 50, 76].map(
              (height, index) => (
                <Skeleton
                  key={index}
                  className="flex-1 rounded-t-md"
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#F0F3F5] pt-3">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </section>
  );
}

export function GridTableSkeleton({ rows = 6, label }) {
  const body = (
    <div className="p-1.5 sm:p-2.5">
      <div className="flex h-10 items-center gap-3 rounded-md bg-[#F7F8FA] px-3">
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="hidden h-2.5 w-20 sm:block" />
        <Skeleton className="h-2.5 flex-1" />
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="hidden h-2.5 w-16 md:block" />
        <Skeleton className="hidden h-2.5 w-16 lg:block" />
        <Skeleton className="h-2.5 w-10" />
      </div>

      <div className="divide-y divide-[#F0F3F5]">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex h-[52px] items-center gap-3 px-3">
            <Skeleton className="h-2.5 w-14" />
            <div className="hidden w-20 space-y-1.5 sm:block">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-2 w-10" />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-2.5 w-32 max-w-full" />
                <Skeleton className="h-2 w-20 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="hidden h-5 w-16 rounded-full md:block" />
            <Skeleton className="hidden h-5 w-16 rounded-full lg:block" />
            <Skeleton className="h-7 w-12 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );

  if (!label) {
    return <div aria-hidden="true">{body}</div>;
  }

  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{body}</div>
    </div>
  );
}

export function AiAssistCardSkeleton() {
  return (
    <section aria-hidden="true" className={`${CARD} flex flex-col p-5`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      <div className="relative mt-4 overflow-hidden rounded-2xl bg-[#0B3A33] px-5 pb-5 pt-6">
        <div className="flex flex-col items-center">
          <div className="skeleton skeleton-dark h-28 w-28 rounded-full" />
          <div className="mt-4 flex h-7 items-end gap-1">
            {[10, 18, 26, 14, 22, 12].map((height, index) => (
              <div
                key={index}
                className="skeleton skeleton-dark w-[3px] rounded-full"
                style={{ height }}
              />
            ))}
          </div>
          <div className="skeleton skeleton-dark mt-4 h-3.5 w-48" />
          <div className="skeleton skeleton-dark mt-2 h-2.5 w-56" />
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
          <div className="skeleton skeleton-dark h-2.5 w-full" />
          <div className="skeleton skeleton-dark mt-2 h-2.5 w-4/5" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2"
            >
              <div className="skeleton skeleton-dark h-2.5 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-1.5 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] px-3 py-2">
        <Skeleton className="mt-0.5 h-3.5 w-3.5 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-2.5 w-full" />
          <div className="skeleton h-2.5 w-2/3" />
        </div>
      </div>
    </section>
  );
}

function DemoScenariosSkeleton() {
  return (
    <section aria-hidden="true" className={`${CARD} p-5`}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-[19px] w-[19px] rounded-md" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="mt-2 h-3 w-56 max-w-full" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-[#DFE5E8] bg-white p-2.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-2.5 w-20" />
            <Skeleton className="mt-1.5 h-2 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-3 h-9 w-full rounded-lg" />
    </section>
  );
}

export function DashboardSkeleton() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 md:px-margin-desktop md:py-space-xl"
    >
      <span className="sr-only">Loading dashboard…</span>

      <PageHeaderSkeleton />

      <div className="mt-space-lg">
        <SummaryCardsSkeleton />
      </div>

      <div className="mt-space-lg grid grid-cols-1 gap-space-lg xl:grid-cols-12">
        <div aria-hidden="true" className="space-y-space-lg xl:col-span-8">
          <div className="grid gap-space-lg lg:grid-cols-2">
            <ChartCardSkeleton variant="bar" />
            <ChartCardSkeleton variant="line" />
          </div>

          <section className={`${CARD} overflow-hidden`}>
            <div className="flex flex-col gap-2 border-b border-[#DFE5E8] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
              <Skeleton className="h-5 w-28 self-start rounded-full sm:self-auto" />
            </div>
            <GridTableSkeleton rows={5} />
            <div className="flex items-center justify-between border-t border-[#DFE5E8] bg-[#F7F8FA]/40 px-5 py-3">
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
          </section>
        </div>

        <div aria-hidden="true" className="space-y-space-lg xl:col-span-4">
          <AiAssistCardSkeleton />
          <DemoScenariosSkeleton />
        </div>
      </div>
    </main>
  );
}

export function HistorySkeleton() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-space-xl md:px-margin-desktop"
    >
      <span className="sr-only">Loading transaction history…</span>

      <PageHeaderSkeleton />

      <div
        aria-hidden="true"
        className={`${SOFT_CARD} mb-6 mt-space-lg rounded-[16px] p-4 md:p-5`}
      >
        <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
          <Skeleton className="h-11 min-w-[280px] flex-1 rounded-[10px]" />
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-11 w-36 rounded-[10px]" />
            <Skeleton className="h-11 w-28 rounded-[10px]" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 overflow-hidden border-t border-[#F7F8FA] pt-4">
          <Skeleton className="h-3 w-24 shrink-0" />
          {[64, 60, 68, 72, 80, 68, 60, 64].map((width, index) => (
            <Skeleton
              key={index}
              className="h-7 shrink-0 rounded-full"
              style={{ width }}
            />
          ))}
        </div>
      </div>

      <section aria-hidden="true" className={`${SOFT_CARD} overflow-hidden`}>
        <GridTableSkeleton rows={8} />
      </section>
    </main>
  );
}

export function FlowAssistantSkeleton() {
  return (
    <section aria-hidden="true" className={`${CARD} p-5`}>
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] p-3">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-3/4" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Skeleton className="h-8 w-36 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      <div className="mt-4 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] p-3">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="mt-2 h-2.5 w-full" />
        <Skeleton className="mt-1.5 h-2.5 w-2/3" />
      </div>
    </section>
  );
}

export function FlowPageSkeleton() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-5 px-4 py-6 pb-24 md:px-margin-desktop md:pb-10 sm:py-8"
    >
      <span className="sr-only">Loading payment check…</span>

      <header
        aria-hidden="true"
        className="flex flex-col gap-4 border-b border-[#DFE5E8] pb-5"
      >
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-2" />
          <Skeleton className="h-3.5 w-28" />
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-[24rem] max-w-full" />
            <Skeleton className="h-4 w-[30rem] max-w-full" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </header>

      <section aria-hidden="true" className={`${CARD} p-4 sm:p-5`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="hidden h-8 w-28 rounded-lg sm:block" />
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-2.5 w-16 max-w-full" />
              <Skeleton className="hidden h-2 w-12 sm:block" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <aside aria-hidden="true" className="lg:col-span-5 xl:col-span-4">
          <FlowAssistantSkeleton />
        </aside>

        <section aria-hidden="true" className="space-y-5 lg:col-span-7 xl:col-span-8">
          <div className={`${CARD} p-5`}>
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-52 max-w-full" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] px-3 py-3"
                >
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-2.5 w-24" />
                    <Skeleton className="h-3.5 w-40 max-w-full" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className={`${CARD} p-5`}>
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="mt-4 space-y-2.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-[#F0F3F5] pt-4">
              <Skeleton className="h-10 w-28 rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function CheckoutSkeleton() {
  return <FlowPageSkeleton />;
}

export function ResultSkeleton() {
  return <FlowPageSkeleton />;
}

export function TransactionDetailSkeleton() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-[1040px] flex-1 space-y-space-lg px-4 py-space-xl sm:px-6 md:px-margin-desktop"
    >
      <span className="sr-only">Loading transaction details…</span>

      <section aria-hidden="true" className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-col justify-between gap-4 border-b border-[#DFE5E8] pb-5 md:flex-row md:items-center">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-8 w-60 max-w-full" />
              <Skeleton className="h-7 w-32 rounded-lg" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-6 w-40 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
      </section>

      <section aria-hidden="true" className={`${SOFT_CARD} p-6`}>
        <div className="flex flex-col justify-between gap-3 border-b border-[#F7F8FA] pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
          </div>
          <div className="space-y-2 sm:text-right">
            <Skeleton className="h-7 w-28 sm:ml-auto" />
            <Skeleton className="h-3 w-32 sm:ml-auto" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 pt-5 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-4 w-36 max-w-full" />
              <Skeleton className="h-2.5 w-28" />
            </div>
          ))}
        </div>
      </section>

      <section aria-hidden="true" className={`${SOFT_CARD} space-y-5 p-6`}>
        <Skeleton className="h-4 w-44" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="space-y-2.5 rounded-lg border border-[#DFE5E8] bg-[#F7F8FA] p-4"
            >
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          ))}
        </div>
      </section>

      <section aria-hidden="true" className={`${SOFT_CARD} space-y-4 p-6`}>
        <Skeleton className="h-4 w-36" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-40 max-w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </section>
    </main>
  );
}

export function LoginSkeleton() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-[1040px] flex-1 px-4 py-8 md:px-margin-desktop md:py-14"
    >
      <span className="sr-only">Loading sign in…</span>

      <div
        aria-hidden="true"
        className="overflow-hidden rounded-2xl border border-[#DFE5E8] bg-white shadow-[0_18px_50px_-24px_rgba(15,29,39,0.35)]"
      >
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <aside className="relative overflow-hidden bg-[#0B3A33] px-6 py-8 text-white md:px-9 md:py-10">
            <div className="flex items-center gap-2.5">
              <Skeleton className="skeleton-dark h-10 w-10 rounded-xl" />
              <div className="skeleton skeleton-dark h-4 w-16" />
            </div>
            <div className="mt-7 space-y-2.5">
              <div className="skeleton skeleton-dark h-7 w-60 max-w-full" />
              <div className="skeleton skeleton-dark h-7 w-44 max-w-full" />
            </div>
            <div className="mt-4 hidden space-y-2 sm:block">
              <div className="skeleton skeleton-dark h-3 w-full max-w-[22rem]" />
              <div className="skeleton skeleton-dark h-3 w-4/5 max-w-[18rem]" />
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="skeleton skeleton-dark h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <div className="skeleton skeleton-dark h-3 w-40" />
                <div className="skeleton skeleton-dark h-3 w-28" />
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <div className="skeleton skeleton-dark h-5 w-5 rounded-full" />
                  <div className="skeleton skeleton-dark h-2.5 w-44 max-w-full" />
                </div>
              ))}
            </div>
          </aside>

          <div className="px-6 py-8 md:px-9 md:py-10">
            <div className="skeleton h-3 w-28" />
            <div className="skeleton mt-3 h-7 w-52 max-w-full" />
            <div className="skeleton mt-2 h-3.5 w-64 max-w-full" />

            <div className="mt-6 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] p-3">
              <div className="skeleton h-3 w-32" />
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="skeleton h-3 w-40 max-w-full" />
                <div className="skeleton h-7 w-16 rounded-md" />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-11 w-full rounded-[10px]" />
              </div>
              <div className="space-y-1.5">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-11 w-full rounded-[10px]" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="skeleton h-3 w-28" />
              <div className="skeleton h-3 w-24" />
            </div>

            <div className="skeleton mt-6 h-11 w-full rounded-[10px]" />
            <div className="skeleton mt-3 h-3 w-56 max-w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function NavbarSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="sticky top-0 z-40 border-b border-[#DFE5E8] bg-white shadow-sm"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 md:px-margin-desktop">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-12" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function MobileTabBarSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DFE5E8] bg-white md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-[480px] items-center justify-around px-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-2 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
