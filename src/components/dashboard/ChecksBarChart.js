"use client";

import React from "react";

const BAR_DATA = [
  { day: "Mon", clear: 3, review: 1, blocked: 0 },
  { day: "Tue", clear: 3, review: 1, blocked: 1 },
  { day: "Wed", clear: 4, review: 1, blocked: 1 },
  { day: "Thu", clear: 2, review: 1, blocked: 1 },
  { day: "Fri", clear: 3, review: 1, blocked: 1 },
  { day: "Sat", clear: 2, review: 3, blocked: 0 },
  { day: "Sun", clear: 2, review: 1, blocked: 2 },
];

const LEGEND = [
  { key: "clear", label: "Clear", color: "#107E3E" },
  { key: "review", label: "Review", color: "#B45309" },
  { key: "blocked", label: "Blocked", color: "#DC2626" },
];

const MAX_TOTAL = Math.max(
  ...BAR_DATA.map((item) => item.clear + item.review + item.blocked),
);

export default function ChecksBarChart({ data }) {
  const chartData = Array.isArray(data) && data.length > 0 ? data.map(d => ({
    day: d.date ? new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }) : (d.day || "Day"),
    clear: d.clear || 0,
    review: d.review || 0,
    blocked: d.blocked || 0,
  })) : BAR_DATA;

  const maxTotal = Math.max(1, ...chartData.map((item) => item.clear + item.review + item.blocked));

  const weekTotal = chartData.reduce(
    (sum, item) => sum + item.clear + item.review + item.blocked,
    0,
  );

  return (
    <section className="flex flex-col rounded-2xl border border-[#DFE5E8] bg-white p-5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-primary">bar_chart</span>
            <h2 className="font-headline-sm text-headline-sm font-semibold text-[#15232D]">
              Checks by day
            </h2>
          </div>
          <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
            Screening outcomes for the last 7 days
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#DFE5E8] bg-[#F7F8FA] px-2.5 py-1 font-label-sm text-label-sm text-secondary">
          <span className="material-symbols-outlined text-[13px]">calendar_today</span>
          {weekTotal} checks
        </span>
      </div>

      <div className="relative mt-5 flex h-[176px] items-end gap-2 border-b border-[#E5E7EB] sm:gap-3">
        {[0.25, 0.5, 0.75, 1].map((tick) => (
          <span
            key={tick}
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[#F0F3F5]"
            style={{ bottom: `${tick * 100}%` }}
          />
        ))}

        {chartData.map((item, index) => {
          const total = item.clear + item.review + item.blocked;
          return (
            <div
              key={item.day + index}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#DFE5E8] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#15232D] shadow-lg group-hover:block">
                {item.day} · {total} checks
                <span className="mt-0.5 block font-normal text-secondary">
                  {item.clear} clear · {item.review} review · {item.blocked} blocked
                </span>
              </div>

              <div
                className="flex w-full max-w-[34px] flex-col justify-end overflow-hidden rounded-t-md"
                style={{ height: `${(total / maxTotal) * 100}%` }}
              >
                {item.blocked > 0 && (
                  <span
                    className="chart-bar w-full bg-[#DC2626]"
                    style={{
                      height: `${(item.blocked / total) * 100}%`,
                      animationDelay: `${index * 60}ms`,
                    }}
                  />
                )}
                {item.review > 0 && (
                  <span
                    className="chart-bar w-full bg-[#F59E0B]"
                    style={{
                      height: `${(item.review / total) * 100}%`,
                      animationDelay: `${index * 60 + 40}ms`,
                    }}
                  />
                )}
                <span
                  className="chart-bar w-full rounded-t-md bg-[#087F68]"
                  style={{
                    height: `${(item.clear / total) * 100}%`,
                    animationDelay: `${index * 60 + 80}ms`,
                  }}
                />
              </div>

              <span className="mt-2 font-label-sm text-[10px] font-medium text-secondary">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {LEGEND.map((entry) => (
          <span key={entry.key} className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-body-sm text-[11px] text-secondary">{entry.label}</span>
          </span>
        ))}
        <span className="ml-auto font-code-sm text-[10px] text-secondary">
          Peak · {MAX_TOTAL} checks
        </span>
      </div>
    </section>
  );
}
