"use client";

import React, { Suspense } from "react";
import TransactionDetailView from "../../../components/transactions/TransactionDetailView.js";

export default function TransactionPage({ params }) {
  return (
    <Suspense fallback={null}>
      <TransactionDetailView params={params} />
    </Suspense>
  );
}
