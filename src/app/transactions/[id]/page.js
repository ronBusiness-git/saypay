"use client";

import React, { Suspense } from "react";
import TransactionDetailView from "../../../components/transactions/TransactionDetailView.js";
import { TransactionDetailSkeleton } from "../../../components/ui/LoadingSkeletons.js";

export default function TransactionPage({ params }) {
  return (
    <Suspense fallback={<TransactionDetailSkeleton />}>
      <TransactionDetailView params={params} />
    </Suspense>
  );
}
