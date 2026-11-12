"use client";

import React from "react";
import ErrorState from "../../components/system/ErrorState.js";

export default function CheckError({ error, reset }) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      eyebrow="Safety check"
      title="This safety check couldn't load"
      description="The MatchCheck report stopped rendering. No payment action was taken and the check result is unchanged. Retry to reopen the report."
      secondaryHref="/history"
      secondaryLabel="Back to history"
    />
  );
}
