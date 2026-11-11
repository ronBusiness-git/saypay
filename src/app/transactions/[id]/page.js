"use client";

import React, { Suspense } from "react";
import CheckDetailPage from "../../checks/[checkId]/page.js";

export default function TransactionPage({ params }) {
  return (
    <Suspense fallback={null}>
      <CheckDetailPage params={params} />
    </Suspense>
  );
}
