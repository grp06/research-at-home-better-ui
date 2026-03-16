import { z } from "zod";

import type { DashboardFilters } from "@/features/dashboard/lib/types";

const filterSchema = z.object({
  agent: z.string().optional(),
  step: z.string().optional(),
  view: z.enum(["frontier", "pressure"]).optional(),
});

export function parseDashboardFilters(
  searchParams:
    | Record<string, string | string[] | undefined>
    | URLSearchParams
    | null
    | undefined,
): DashboardFilters {
  const base =
    searchParams instanceof URLSearchParams
      ? Object.fromEntries(searchParams.entries())
      : searchParams ?? {};

  const normalized = Object.fromEntries(
    Object.entries(base).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = filterSchema.safeParse(
    normalized,
  );

  if (!parsed.success) {
    return {
      agentId: typeof normalized.agent === "string" ? normalized.agent : "all",
      stepId: typeof normalized.step === "string" ? normalized.step : null,
      view: "frontier",
    };
  }

  return {
    agentId: parsed.data.agent ?? "all",
    stepId: parsed.data.step ?? null,
    view: parsed.data.view ?? "frontier",
  };
}

export function buildDashboardQuery(filters: DashboardFilters) {
  const params = new URLSearchParams();

  if (filters.agentId !== "all") {
    params.set("agent", filters.agentId);
  }

  if (filters.view !== "frontier") {
    params.set("view", filters.view);
  }

  if (filters.stepId) {
    params.set("step", filters.stepId);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
