"use client";

import React from "react";
import MatchCheckView from "../../../components/flow/MatchCheckView.js";
import { CHECK_STATES } from "../../../lib/demoFlowData.js";

export default function SafetyCheckBlockedPage({ onOpenAuditLog }) {
  return (
    <MatchCheckView state={CHECK_STATES.BLOCKED} onOpenAuditLog={onOpenAuditLog} />
  );
}
