import "server-only";

import { fetchEnsueSnapshot } from "@/features/dashboard/queries/fetch-ensue";
import { loadFixtureSnapshot } from "@/features/dashboard/queries/load-fixture";
import { buildDashboardSnapshotFromEnsue } from "@/features/dashboard/lib/normalize-snapshot";

export async function getDashboardSnapshot() {
  const fixture = await loadFixtureSnapshot();
  const raw = fixture ?? (await fetchEnsueSnapshot());
  return buildDashboardSnapshotFromEnsue(raw);
}
