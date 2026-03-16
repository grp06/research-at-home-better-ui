import { DashboardConfigState } from "@/features/dashboard/components/dashboard-config-state";
import { DashboardClient } from "@/features/dashboard/components/dashboard-client";
import { getDashboardSnapshot } from "@/features/dashboard/lib/dashboard";
import {
  DashboardConfigError,
  DashboardDataError,
} from "@/features/dashboard/lib/errors";
import { parseDashboardFilters } from "@/features/dashboard/lib/filters";
import type { DashboardSnapshot } from "@/features/dashboard/lib/types";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialFilters = parseDashboardFilters(resolvedSearchParams);
  let snapshot: DashboardSnapshot;

  try {
    snapshot = await getDashboardSnapshot();
  } catch (error) {
    if (
      error instanceof DashboardConfigError ||
      error instanceof DashboardDataError
    ) {
      return (
        <DashboardConfigState
          title="The dashboard needs live swarm access"
          message={error.message}
        />
      );
    }

    throw error;
  }

  return <DashboardClient snapshot={snapshot} initialFilters={initialFilters} />;
}
