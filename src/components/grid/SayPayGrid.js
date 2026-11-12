"use client";

import React from "react";
import Link from "next/link";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const sayPayGridTheme = themeQuartz.withParams({
  accentColor: "#087F68",
  backgroundColor: "#FFFFFF",
  chromeBackgroundColor: "#F7F8FA",
  headerBackgroundColor: "#F7F8FA",
  headerTextColor: "#52606C",
  foregroundColor: "#15232D",
  borderColor: "#DFE5E8",
  oddRowBackgroundColor: "#FFFFFF",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 13,
  headerFontSize: 11,
  headerFontWeight: 600,
  rowHeight: 52,
  headerHeight: 40,
  cellHorizontalPadding: 16,
  wrapperBorderRadius: 0,
  browserColorScheme: "light",
});

const DEFAULT_COL_DEF = {
  sortable: true,
  resizable: true,
  suppressHeaderMenuButton: true,
  cellStyle: { display: "flex", alignItems: "center" },
};

function StatusChip({ label, className = "", icon = "dot" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${className}`}
    >
      {icon === "dot" ? (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      ) : (
        <span className="material-symbols-outlined text-[13px]">{icon}</span>
      )}
      {label}
    </span>
  );
}

export function StatusChipCell(params) {
  const chip = params.data?.[params.colDef.field];
  if (!chip) return null;
  return (
    <div className="flex flex-col items-center justify-center leading-tight">
      <StatusChip {...chip} />
      {chip.subtext && (
        <span className="mt-0.5 text-[9px] text-secondary">{chip.subtext}</span>
      )}
    </div>
  );
}

export function CheckIdCell(params) {
  const href = params.data?.action?.href;
  if (!href) {
    return <span className="font-mono text-[12px] text-[#15232D]">{params.value}</span>;
  }
  return (
    <Link
      href={href}
      className="font-mono text-[12px] font-medium text-primary hover:text-primary-container hover:underline"
    >
      {params.value}
    </Link>
  );
}

export function DateCell(params) {
  const row = params.data;
  return (
    <div className="flex flex-col justify-center leading-tight">
      <span className="text-[13px] font-medium text-[#15232D]">{row.date}</span>
      <span className="font-mono text-[11px] text-secondary">{row.time}</span>
    </div>
  );
}

export function MerchantCell(params) {
  const row = params.data;
  return (
    <div className="flex min-w-0 items-center gap-2.5 leading-tight">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${row.initialsStyle}`}
      >
        {row.initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-[#15232D]">{row.merchant}</p>
        <p className="truncate text-[11px] text-secondary">{row.merchantId}</p>
      </div>
    </div>
  );
}

export function ActionCell(params) {
  const action = params.data?.action;
  if (!action) return null;
  return (
    <Link
      href={action.href}
      className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-primary hover:text-primary-container hover:underline"
    >
      {action.label}
      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
    </Link>
  );
}

const CENTER_STYLE = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const RIGHT_STYLE = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};
const MUTED_STYLE = {
  display: "flex",
  alignItems: "center",
  color: "#52606C",
  fontSize: "12px",
};
const MONO_STYLE = {
  ...RIGHT_STYLE,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "12px",
  fontWeight: 600,
  color: "#15232D",
};

const DASHBOARD_COLUMNS = [
  {
    field: "id",
    headerName: "CHECK ID",
    width: 122,
    minWidth: 102,
    cellRenderer: CheckIdCell,
  },
  {
    field: "timestamp",
    headerName: "TIMESTAMP",
    width: 158,
    minWidth: 142,
    cellStyle: MUTED_STYLE,
  },
  {
    field: "counterparty",
    headerName: "COUNTERPARTY",
    flex: 1,
    minWidth: 150,
    cellStyle: { display: "flex", alignItems: "center", fontWeight: 500 },
  },
  {
    field: "amount",
    headerName: "AMOUNT",
    width: 104,
    minWidth: 90,
    cellStyle: MONO_STYLE,
  },
  {
    field: "matchCheck",
    headerName: "MATCHCHECK",
    width: 132,
    minWidth: 112,
    valueGetter: (params) => params.data?.matchCheck?.label,
    cellRenderer: StatusChipCell,
    cellStyle: CENTER_STYLE,
  },
  {
    field: "payment",
    headerName: "PAYMENT",
    width: 132,
    minWidth: 112,
    valueGetter: (params) => params.data?.payment?.label,
    cellRenderer: StatusChipCell,
    cellStyle: CENTER_STYLE,
  },
  {
    field: "action",
    headerName: "",
    width: 84,
    minWidth: 76,
    sortable: false,
    valueGetter: (params) => params.data?.action?.label,
    cellRenderer: ActionCell,
    cellStyle: RIGHT_STYLE,
  },
];

const HISTORY_COLUMNS = [
  {
    field: "sortDate",
    headerName: "DATE & TIME",
    width: 148,
    cellRenderer: DateCell,
  },
  {
    field: "merchant",
    headerName: "MERCHANT",
    flex: 1,
    minWidth: 220,
    cellRenderer: MerchantCell,
  },
  {
    field: "reference",
    headerName: "REFERENCE",
    width: 112,
    cellStyle: {
      display: "flex",
      alignItems: "center",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "11px",
      color: "#52606C",
    },
  },
  {
    field: "amount",
    headerName: "AMOUNT",
    width: 112,
    cellStyle: MONO_STYLE,
  },
  {
    field: "matchCheck",
    headerName: "MATCHCHECK STATUS",
    width: 182,
    valueGetter: (params) => params.data?.matchCheck?.label,
    cellRenderer: StatusChipCell,
    cellStyle: CENTER_STYLE,
  },
  {
    field: "payment",
    headerName: "PAYMENT STATUS",
    width: 196,
    valueGetter: (params) => params.data?.payment?.label,
    cellRenderer: StatusChipCell,
    cellStyle: CENTER_STYLE,
  },
  {
    field: "action",
    headerName: "ACTION",
    width: 168,
    sortable: false,
    valueGetter: (params) => params.data?.action?.label,
    cellRenderer: ActionCell,
    cellStyle: RIGHT_STYLE,
  },
];

export default function SayPayGrid({
  variant = "dashboard",
  rowData = [],
  pagination = false,
  paginationPageSize = 8,
  onGridReady,
  height,
  ariaLabel = "Data grid",
}) {
  const columnDefs =
    variant === "history" ? HISTORY_COLUMNS : DASHBOARD_COLUMNS;

  const fitColumns = (params) => {
    if (params.clientWidth >= 760) params.api.sizeColumnsToFit();
  };

  const handleGridReady = (params) => {
    fitColumns(params);
    onGridReady?.(params);
  };

  return (
    <div
      className="w-full"
      style={height ? { height } : undefined}
      role="region"
      aria-label={ariaLabel}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={DEFAULT_COL_DEF}
        theme={sayPayGridTheme}
        domLayout="autoHeight"
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={false}
        animateRows
        suppressMovableColumns
        suppressCellFocus={false}
        getRowId={(params) => params.data.id}
        onGridReady={handleGridReady}
        onGridSizeChanged={fitColumns}
        localeText={{ noRowsToShow: "No checks match the current filter." }}
      />
    </div>
  );
}
