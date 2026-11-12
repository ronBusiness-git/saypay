"use client";

import React from "react";
import ErrorState from "../../components/system/ErrorState.js";

export default function LoginError({ error, reset }) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      eyebrow="Sign in error"
      title="Sign in couldn't finish loading"
      description="The sign-in screen hit an unexpected error. No session was created and nothing was charged. Try again, or return to the dashboard."
      secondaryHref="/"
      secondaryLabel="Back to dashboard"
    />
  );
}
