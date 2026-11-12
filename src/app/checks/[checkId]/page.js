"use client";

import React, { Suspense } from "react";
import MatchCheckView from "../../../components/flow/MatchCheckView.js";
import { checkStateForId } from "../../../lib/demoFlowData.js";

function CheckFlow({ params, onOpenAuditLog }) {
  const resolvedParams =
    params && typeof params.then === "function" ? React.use(params) : params;
  const checkId = resolvedParams?.checkId || "chk_demo_204";
  const state = checkStateForId(checkId);

  return <MatchCheckView state={state} onOpenAuditLog={onOpenAuditLog} />;
}

export default function CheckDetailPage(props) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 items-center justify-center px-4 py-16">
          <div className="flex items-center gap-3 rounded-2xl border border-[#DFE5E8] bg-white px-5 py-4 shadow-sm">
            <span className="material-symbols-outlined animate-spin text-[22px] text-primary">
              progress_activity
            </span>
            <span className="font-body-md text-body-md text-secondary">
              Loading safety check…
            </span>
          </div>
        </main>
      }
    >
      <CheckFlow {...props} />
    </Suspense>
  );
}
