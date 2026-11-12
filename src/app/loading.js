import React from "react";
import {
  PageHeaderSkeleton,
  SummaryCardsSkeleton,
  ChartCardSkeleton,
  GridTableSkeleton,
} from "../components/ui/LoadingSkeletons.js";

export default function RootLoading() {
  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-margin-desktop py-8 md:py-space-xl space-y-6">
      <PageHeaderSkeleton withActions withEyebrow />
      <SummaryCardsSkeleton count={5} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCardSkeleton variant="bar" />
        <ChartCardSkeleton variant="line" />
      </div>
      <GridTableSkeleton rows={6} label="Loading records..." />
    </main>
  );
}
