"use client";

import React from "react";
import ErrorState from "../../components/system/ErrorState.js";

export default function HistoryError({ error, reset }) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="We couldn't load your transaction history"
      description="The audit log view stopped rendering. Your recorded demo checks are still stored and nothing was charged — retry to load the list again."
      secondaryHref="/"
      secondaryLabel="Back to dashboard"
    />
  );
}
