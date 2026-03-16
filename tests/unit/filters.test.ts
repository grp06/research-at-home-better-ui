import { describe, expect, it } from "vitest";

import {
  buildDashboardQuery,
  parseDashboardFilters,
} from "@/features/dashboard/lib/filters";

describe("parseDashboardFilters", () => {
  it("falls back to the default view when query params are invalid", () => {
    const filters = parseDashboardFilters({
      agent: "autoresearch-bwell",
      step: "step-123",
      view: "unknown-mode",
    });

    expect(filters).toEqual({
      agentId: "autoresearch-bwell",
      stepId: "step-123",
      view: "frontier",
    });
  });
});

describe("buildDashboardQuery", () => {
  it("omits default values from the URL", () => {
    expect(
      buildDashboardQuery({
        agentId: "all",
        stepId: null,
        view: "frontier",
      }),
    ).toBe("");
  });
});
