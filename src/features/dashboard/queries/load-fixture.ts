import "server-only";

import { readFile } from "node:fs/promises";

import embeddedFixture from "../../../../tests/fixtures/ensue/dashboard.json";
import type { RawEnsueSnapshot } from "@/features/dashboard/queries/fetch-ensue";

export async function loadFixtureSnapshot() {
  if (
    process.env.ENSUE_EMBEDDED_FIXTURE?.trim() === "1" ||
    process.env.ENSUE_EMBEDDED_FIXTURE?.trim().toLowerCase() === "true"
  ) {
    return embeddedFixture as RawEnsueSnapshot;
  }

  const fixturePath = process.env.ENSUE_FIXTURE_PATH;

  if (!fixturePath) {
    return null;
  }

  const text = await readFile(fixturePath, "utf8");
  return JSON.parse(text) as RawEnsueSnapshot;
}
