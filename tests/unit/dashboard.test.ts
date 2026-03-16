import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildDashboardSnapshotFromEnsue } from "@/features/dashboard/lib/normalize-snapshot";
import type { RawEnsueSnapshot } from "@/features/dashboard/queries/fetch-ensue";

const fixturePath = path.join(process.cwd(), "tests/fixtures/ensue/dashboard.json");
const rawFixture = JSON.parse(readFileSync(fixturePath, "utf8")) as RawEnsueSnapshot;

describe("buildDashboardSnapshotFromEnsue", () => {
  it("derives the descent wall, leaderboard, and feed from raw Ensue data", () => {
    const snapshot = buildDashboardSnapshotFromEnsue(rawFixture);

    expect(snapshot.stats.currentBest).toBe(0.926381);
    expect(snapshot.improvements).toHaveLength(11);
    expect(snapshot.improvements[0]?.description).toBe("baseline");
    expect(snapshot.improvements.at(-1)?.agent.id).toBe("autoresearch-bwell");
    expect(snapshot.leaderboard[0]?.agent.id).toBe("autoresearch-bwell");
    expect(snapshot.feed.some((item) => item.type === "claim")).toBe(true);
  });

  it("only links result feed events to real frontier cuts", () => {
    const snapshot = buildDashboardSnapshotFromEnsue(rawFixture);
    const nonFrontierKeep = snapshot.feed.find((item) =>
      item.body.includes("head dim 64 -> 72"),
    );

    expect(nonFrontierKeep?.type).toBe("result");
    expect(nonFrontierKeep?.href).toBeUndefined();
  });
});
