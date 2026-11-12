"use client";

import React, { Suspense } from "react";
import MatchCheckView from "../../../components/flow/MatchCheckView.js";
import { FlowPageSkeleton } from "../../../components/ui/LoadingSkeletons.js";
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
    <Suspense fallback={<FlowPageSkeleton />}>
      <CheckFlow {...props} />
    </Suspense>
  );
}
