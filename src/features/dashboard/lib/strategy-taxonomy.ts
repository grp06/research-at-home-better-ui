import type { StrategyTrack } from "@/features/dashboard/lib/types";

const rules: Array<[RegExp, StrategyTrack]> = [
  [/\bbaseline\b/i, "baseline"],
  [/\blr\b|\bwarmup\b|\bwarmdown\b|\bfinal lr\b|\bembedding lr\b/i, "optimizer"],
  [/\bhead\b|\bqk\b|\battn\b|\battention\b|\bfa4\b/i, "attention"],
  [/\baspect ratio\b|\bgate channels\b|\bhidden\b|\bshape\b/i, "shape"],
  [/\bdepth\b/i, "depth"],
  [/\bmatmul\b|\bcuda\b|\binductor\b|\bcompile\b|\bgraph\b|\bprecision\b/i, "systems"],
  [/\bresidual\b|\bsublayer\b/i, "residuals"],
];

export function inferStrategyTrack(description: string): StrategyTrack {
  for (const [pattern, track] of rules) {
    if (pattern.test(description)) {
      return track;
    }
  }

  return "other";
}

export function buildExperimentNote(
  description: string,
  status: string,
  deltaVsBest: number | null,
) {
  if (status === "crash") {
    return `This run crashed while trying "${description}".`;
  }

  if (status === "keep" && typeof deltaVsBest === "number" && deltaVsBest < 0) {
    return `This change improved the frontier by ${Math.abs(deltaVsBest).toFixed(4)}.`;
  }

  if (status === "keep") {
    return `This run was kept as a useful result even though it did not become the global best.`;
  }

  return `This experiment did not beat the active frontier.`;
}
