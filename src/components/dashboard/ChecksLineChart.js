"use client";

import React from "react";

const POINTS = [
  { label: "May 11", checks: 3, completed: 1 },
  { label: "May 12", checks: 5, completed: 3 },
  { label: "May 13", checks: 4, completed: 2 },
  { label: "May 14", checks: 6, completed: 4 },
  { label: "May 15", checks: 2, completed: 1 },
  { label: "May 16", checks: 5, completed: 3 },
  { label: "May 17", checks: 4, completed: 2 },
  { label: "May 18", checks: 6, completed: 3 },
  { label: "May 19", checks: 5, completed: 3 },
  { label: "May 20", checks: 3, completed: 2 },
  { label: "May 21", checks: 6, completed: 4 },
  { label: "May 22", checks: 4, completed: 2 },
  { label: "May 23", checks: 5, completed: 3 },
  { label: "May 24", checks: 5, completed: 3 },
];

const WIDTH = 640;
const HEIGHT = 230;
const PAD = { top: 14, right: 14, bottom: 28, left: 30 };
const MAX = 7;

function buildPoints(key) {
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  return POINTS.map((point, index) => {
    const x = PAD.left + (index / (POINTS.length - 1)) * innerWidth;
    const y = HEIGHT - PAD.bottom - (point[key] / MAX) * innerHeight;
    return { x, y, ...point };
  });
}

const CHECK_POINTS = buildPoints("checks");
const COMPLETED_POINTS = buildPoints("completed");

const toLine = (points) =>
  points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");

const CHECK_LINE = toLine(CHECK_POINTS);
const COMPLETED_LINE = toLine(COMPLETED_POINTS);

const CHECK_AREA = `M ${CHECK_POINTS[0].x} ${HEIGHT - PAD.bottom} L ${toLine(
  CHECK_POINTS,
).replaceAll(" ", " L ")} L ${CHECK_POINTS[CHECK_POINTS.length - 1].x} ${
  HEIGHT - PAD.bottom
} Z`;

export default function ChecksLineChart({ data }) {
  const pointsData = Array.isArray(data) && data.length > 1 ? data.map(d => ({
    label: d.date ? new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : (d.label || "Day"),
    checks: d.checks || 0,
    completed: Math.round((d.volumeMinor || 0) > 0 ? 1 : (d.clear || 0)),
  })) : POINTS;

  const maxVal = Math.max(5, ...pointsData.map(p => Math.max(p.checks, p.completed)));
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;

  const checkPoints = pointsData.map((point, index) => {
    const x = PAD.left + (index / (pointsData.length - 1)) * innerWidth;
    const y = HEIGHT - PAD.bottom - (point.checks / maxVal) * innerHeight;
    return { x, y, ...point };
  });

  const completedPoints = pointsData.map((point, index) => {
    const x = PAD.left + (index / (pointsData.length - 1)) * innerWidth;
    const y = HEIGHT - PAD.bottom - (point.completed / maxVal) * innerHeight;
    return { x, y, ...point };
  });

  const checkLine = toLine(checkPoints);
  const completedLine = toLine(completedPoints);
  const checkArea = `M ${checkPoints[0].x} ${HEIGHT - PAD.bottom} L ${toLine(
    checkPoints,
  ).replaceAll(" ", " L ")} L ${checkPoints[checkPoints.length - 1].x} ${
    HEIGHT - PAD.bottom
  } Z`;
  const totalCompleted = POINTS.reduce((sum, point) => sum + point.completed, 0);

  return (
    <section className="flex flex-col rounded-2xl border border-[#DFE5E8] bg-white p-5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-primary">show_chart</span>
            <h2 className="font-headline-sm text-headline-sm font-semibold text-[#15232D]">
              Checks vs completed
            </h2>
          </div>
          <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
            Daily attempts and settled sandbox payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-body-sm text-[11px] text-secondary">
            <span className="h-2 w-2 rounded-full bg-[#087F68]" />
            Checks
          </span>
          <span className="inline-flex items-center gap-1.5 font-body-sm text-[11px] text-secondary">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            Completed
          </span>
        </div>
      </div>

      <div className="mt-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Line chart of daily checks versus completed payments over the last 14 days"
        >
          <defs>
            <linearGradient id="checksArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#087F68" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#087F68" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 2, 4, 6].map((tick) => {
            const y =
              HEIGHT - PAD.bottom - (tick / MAX) * (HEIGHT - PAD.top - PAD.bottom);
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={WIDTH - PAD.right}
                  y2={y}
                  stroke="#F0F3F5"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={PAD.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[#8A97A0] font-mono text-[9px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <path d={checkArea} fill="url(#checksArea)" className="chart-area" />

          <polyline
            points={completedLine}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            className="chart-line"
            style={{ animationDelay: "160ms" }}
          />

          <polyline
            points={checkLine}
            fill="none"
            stroke="#087F68"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            className="chart-line"
          />

          {checkPoints.map((point, index) => (
            <circle
              key={point.label + index}
              cx={point.x}
              cy={point.y}
              r={index === checkPoints.length - 1 ? 4.5 : 2.75}
              fill="#FFFFFF"
              stroke="#087F68"
              strokeWidth="2"
            >
              <title>
                {`${point.label}: ${point.checks} checks, ${point.completed} completed`}
              </title>
            </circle>
          ))}

          {completedPoints.filter((_, index) => index % 2 === 0).map((point, i) => (
            <text
              key={point.label + i}
              x={point.x}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-[#8A97A0] font-sans text-[9px]"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-[#F0F3F5] pt-3">
        <span className="font-body-sm text-body-sm text-secondary">
          {totalCompleted} completed of 63 checks in this window
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2 py-0.5 font-label-sm text-[10px] font-semibold text-[#107E3E]">
          <span className="material-symbols-outlined text-[12px]">trending_up</span>
          On track
        </span>
      </div>
    </section>
  );
}
