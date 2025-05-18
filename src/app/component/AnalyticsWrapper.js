"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// ssr: false 적용은 여기서만
const Analytics = dynamic(() => import("./Analytics"), {
  ssr: false,
});

export default function AnalyticsWrapper() {
  return (
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  );
}
