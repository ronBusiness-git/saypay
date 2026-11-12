"use client";

import React from "react";
import MatchCheckView from "../../../components/flow/MatchCheckView.js";
import { CHECK_STATES } from "../../../lib/demoFlowData.js";

export default function SafetyCheckHistoricalPage({ onOpenAuditLog }) {
  return (
    <MatchCheckView state={CHECK_STATES.HISTORICAL} onOpenAuditLog={onOpenAuditLog} />
  );
}
