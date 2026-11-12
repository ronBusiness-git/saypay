"use client";

import React from "react";
import ErrorState from "../../components/system/ErrorState.js";

export default function CheckoutError({ error, reset }) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      eyebrow="Checkout"
      title="Checkout couldn't load"
      description="The review or confirmation step stopped rendering. Nothing was charged in PayPal Sandbox — retry to resume the checkout."
      secondaryHref="/history"
      secondaryLabel="Back to history"
    />
  );
}
