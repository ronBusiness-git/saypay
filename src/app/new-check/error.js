"use client";

import React from "react";
import ErrorState from "../../components/system/ErrorState.js";

export default function NewCheckError({ error, reset }) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      eyebrow="New payment check"
      title="This payment check couldn't load"
      description="The capture step stopped rendering before anything was compared or paid. Your draft stays on this device — retry to continue."
      secondaryHref="/"
      secondaryLabel="Back to dashboard"
    />
  );
}
