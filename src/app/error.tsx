"use client";

import { useEffect } from "react";

import { DashboardConfigState } from "@/features/dashboard/components/dashboard-config-state";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <DashboardConfigState
      title="The dashboard hit an unexpected error"
      message={error.message}
    />
  );
}
