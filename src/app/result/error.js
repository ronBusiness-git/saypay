"use client";

import React from "react";
import ErrorState from "../../components/system/ErrorState.js";

export default function ResultError({ error, reset }) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      eyebrow="Payment result"
      title="The payment result couldn't load"
      description="The settlement view stopped rendering. Your sandbox history still holds the outcome and nothing was charged twice. Retry to reload the result."
      secondaryHref="/history"
      secondaryLabel="Back to history"
    />
  );
}
