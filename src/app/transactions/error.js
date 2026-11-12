"use client";

import React from "react";
import ErrorState from "../../components/system/ErrorState.js";

export default function TransactionError({ error, reset }) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      eyebrow="Transaction details"
      title="Transaction details couldn't load"
      description="The receipt and audit trail stopped rendering. The stored transaction record is unchanged and no further charge was made. Retry to reopen it."
      secondaryHref="/history"
      secondaryLabel="Back to history"
    />
  );
}
