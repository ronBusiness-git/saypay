"use client";

import React from "react";
import ErrorState from "../components/system/ErrorState.js";

export default function AppError({ error, reset }) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Something interrupted this screen"
      description="An unexpected error stopped the page from rendering. Your sandbox data is safe, nothing was charged, and you can retry right away."
    />
  );
}
