import { describe, expect, it } from "vitest";

import {
  buildExperimentNote,
  inferStrategyTrack,
} from "@/features/dashboard/lib/strategy-taxonomy";

describe("inferStrategyTrack", () => {
  it("classifies the main experiment families", () => {
    expect(inferStrategyTrack("baseline + adopt xl tier head mix")).toBe("baseline");
    expect(inferStrategyTrack("final lr frac 0.05 -> 0.02")).toBe("optimizer");
    expect(inferStrategyTrack("qk scale 1.15 with custom FA4 torch")).toBe("attention");
    expect(inferStrategyTrack("aspect ratio 40 -> 32")).toBe("shape");
    expect(inferStrategyTrack("depth 10 -> 14")).toBe("depth");
    expect(inferStrategyTrack("matmul precision bf16 -> tf32")).toBe("systems");
    expect(inferStrategyTrack("residual gate reorder")).toBe("residuals");
    expect(inferStrategyTrack("mystery ablation")).toBe("other");
  });
});

describe("buildExperimentNote", () => {
  it("writes an improvement note for winning keeps", () => {
    expect(buildExperimentNote("final lr frac 0.05 -> 0.02", "keep", -0.001719)).toContain(
      "0.0017",
    );
  });

  it("writes a crash note for failing runs", () => {
    expect(buildExperimentNote("embedding lr 1.0 -> 1.4", "crash", null)).toContain(
      "crashed",
    );
  });
});
