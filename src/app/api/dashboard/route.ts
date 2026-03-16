import { NextResponse } from "next/server";

import { getDashboardSnapshot } from "@/features/dashboard/lib/dashboard";
import {
  DashboardConfigError,
  DashboardDataError,
} from "@/features/dashboard/lib/errors";
import type { DashboardApiResponse } from "@/features/dashboard/lib/types";

export const revalidate = 15;

export async function GET() {
  try {
    const snapshot = await getDashboardSnapshot();
    return NextResponse.json<DashboardApiResponse>({ ok: true, snapshot });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Dashboard request failed";
    const code =
      error instanceof DashboardConfigError || error instanceof DashboardDataError
        ? error.code
        : "DASHBOARD_UNKNOWN_ERROR";

    return NextResponse.json<DashboardApiResponse>(
      {
        ok: false,
        error: {
          code,
          message,
        },
      },
      { status: code === "DASHBOARD_CONFIG_ERROR" ? 500 : 502 },
    );
  }
}
