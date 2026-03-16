import { inferStrategyTrack, buildExperimentNote } from "@/features/dashboard/lib/strategy-taxonomy";
import type { RawEnsueSnapshot } from "@/features/dashboard/queries/fetch-ensue";
import type {
  Agent,
  CrownEntry,
  DashboardSnapshot,
  Experiment,
  FeedEvent,
  ImprovementStep,
  StrategyPulse,
} from "@/features/dashboard/lib/types";

const toneScale = [
  "#d2a312",
  "#0d7e90",
  "#0c438b",
  "#8c7d72",
  "#3d875e",
  "#b0562f",
  "#4e6ee8",
  "#7e5ce0",
  "#9a5b17",
  "#116149",
];

function sortByTimestamp<T extends { completedAt?: string; createdAt?: string; achieved_at?: string }>(
  items: T[],
  key: "completedAt" | "createdAt" | "achieved_at",
) {
  return [...items].sort((left, right) => {
    const leftDate = new Date((left[key] as string | undefined) ?? 0).getTime();
    const rightDate = new Date((right[key] as string | undefined) ?? 0).getTime();
    return leftDate - rightDate;
  });
}

function hoursBetween(left: string, right: string) {
  return Math.max(
    1,
    Math.round(
      (new Date(right).getTime() - new Date(left).getTime()) / (1000 * 60 * 60),
    ),
  );
}

function humanizeAgent(agentId: string) {
  if (agentId.startsWith("autoresearch-")) {
    return agentId;
  }

  return agentId;
}

function handleForAgent(agentId: string) {
  return `@${agentId}`;
}

function ensureAgent(agentMap: Map<string, Agent>, agentId: string) {
  if (!agentMap.has(agentId)) {
    const index = agentMap.size % toneScale.length;
    agentMap.set(agentId, {
      id: agentId,
      label: humanizeAgent(agentId),
      handle: handleForAgent(agentId),
      tone: toneScale[index]!,
    });
  }

  return agentMap.get(agentId)!;
}

function normalizeResults(raw: RawEnsueSnapshot, agentMap: Map<string, Agent>) {
  return sortByTimestamp(
    raw.results.map((entry, index): Experiment => {
      const agent = ensureAgent(agentMap, entry.agent_id);
      const valBpb =
        typeof entry.val_bpb === "number" && Number.isFinite(entry.val_bpb)
          ? entry.val_bpb
          : 0;
      const track = inferStrategyTrack(entry.description);

      return {
        id: `${agent.id}-${index}-${entry.completed_at || "result"}`,
        agentId: agent.id,
        completedAt: entry.completed_at || new Date(0).toISOString(),
        status: (entry.status as Experiment["status"]) ?? "discard",
        valBpb,
        description: entry.description,
        track,
        note: buildExperimentNote(entry.description, entry.status, entry.delta_vs_best),
        commitUrl: entry.commit_url,
        branch: entry.branch,
        deltaVsBest: entry.delta_vs_best,
        vramTier: entry.vram_tier,
      };
    }),
    "completedAt",
  );
}

function buildImprovements(experiments: Experiment[], agentMap: Map<string, Agent>) {
  const keeps = experiments.filter(
    (experiment) => experiment.status === "keep" && experiment.valBpb > 0,
  );
  const improvements: ImprovementStep[] = [];
  let frontier = Number.POSITIVE_INFINITY;

  keeps.forEach((experiment) => {
    if (experiment.valBpb >= frontier) {
      return;
    }

    const previousBest = Number.isFinite(frontier) ? frontier : experiment.valBpb;
    frontier = experiment.valBpb;
    improvements.push({
      id: experiment.id,
      agent: ensureAgent(agentMap, experiment.agentId),
      description: experiment.description,
      valBpb: experiment.valBpb,
      previousBest,
      completedAt: experiment.completedAt,
      delta: Number.isFinite(previousBest)
        ? Number((previousBest - experiment.valBpb).toFixed(6))
        : 0,
      reignHours: 1,
      pressureCount: 0,
      track: experiment.track,
      note: experiment.note,
      x: 0,
      y: 0,
      windowExperimentIds: [],
    });
  });

  if (!improvements.length) {
    return improvements;
  }

  const rangeTop = improvements[0]!.valBpb;
  const rangeBottom = improvements.at(-1)!.valBpb;
  const scoreRange = Math.max(rangeTop - rangeBottom, 0.001);
  const lastCompletedAt = experiments.at(-1)?.completedAt ?? improvements.at(-1)!.completedAt;
  const totalWeight = improvements.reduce((sum, step, index) => {
    const next = improvements[index + 1];
    const nextBoundary = next?.completedAt ?? lastCompletedAt;
    const stepWindow = experiments.filter((experiment) => {
      const currentTime = new Date(experiment.completedAt).getTime();
      const stepTime = new Date(step.completedAt).getTime();
      const boundaryTime = new Date(nextBoundary).getTime();
      return (
        currentTime >= stepTime &&
        (next ? currentTime < boundaryTime : currentTime <= boundaryTime)
      );
    });

    step.reignHours = hoursBetween(step.completedAt, nextBoundary);
    step.pressureCount = stepWindow.filter((experiment) => experiment.id !== step.id).length;
    step.windowExperimentIds = stepWindow.map((experiment) => experiment.id);

    return sum + step.reignHours + step.pressureCount * 0.35;
  }, 0);

  let cursor = 4;
  improvements.forEach((step) => {
    const weight = step.reignHours + step.pressureCount * 0.35;
    step.x = cursor;
    step.y = 12 + ((step.valBpb - rangeBottom) / scoreRange) * 76;
    cursor += (weight / Math.max(totalWeight, 1)) * 90;
  });

  return improvements;
}

function buildLeaderboard(
  experiments: Experiment[],
  improvements: ImprovementStep[],
  agentMap: Map<string, Agent>,
) {
  const bestByAgent = new Map<string, CrownEntry>();

  experiments.forEach((experiment) => {
    if (experiment.valBpb <= 0) {
      return;
    }

    const agent = ensureAgent(agentMap, experiment.agentId);
    const frontierWins = improvements.filter((step) => step.agent.id === agent.id);
    const liveAttempts = experiments.filter(
      (entry) => entry.agentId === agent.id && entry.status !== "keep",
    ).length;
    const momentum = experiments
      .filter((entry) => entry.agentId === agent.id)
      .slice(-3)
      .reduce((total, entry) => total + (entry.status === "keep" ? 1.3 : 0.35), 0);
    const longestReignHours = frontierWins.reduce(
      (longest, step) => Math.max(longest, step.reignHours),
      0,
    );
    const current = bestByAgent.get(agent.id);

    if (!current || experiment.valBpb < current.bestValBpb) {
      bestByAgent.set(agent.id, {
        agent,
        bestValBpb: experiment.valBpb,
        frontierWins: frontierWins.length,
        liveAttempts,
        momentum: Number(momentum.toFixed(2)),
        longestReignHours,
      });
    }
  });

  return [...bestByAgent.values()].sort((left, right) => left.bestValBpb - right.bestValBpb);
}

function buildStrategies(experiments: Experiment[], improvements: ImprovementStep[]) {
  const map = new Map<Experiment["track"], StrategyPulse>();

  for (const experiment of experiments) {
    if (!map.has(experiment.track)) {
      map.set(experiment.track, {
        track: experiment.track,
        wins: 0,
        attempts: 0,
        winRate: 0,
      });
    }

    map.get(experiment.track)!.attempts += 1;
  }

  for (const step of improvements) {
    map.get(step.track)!.wins += 1;
  }

  return [...map.values()]
    .map((entry) => ({
      ...entry,
      winRate: Number((entry.wins / Math.max(entry.attempts, 1)).toFixed(2)),
    }))
    .sort((left, right) => right.wins - left.wins || right.winRate - left.winRate);
}

function buildFeed(
  raw: RawEnsueSnapshot,
  experiments: Experiment[],
  improvements: ImprovementStep[],
) {
  const feed: FeedEvent[] = [];
  const byAgentResult = [...experiments].reverse();
  const improvementIds = new Set(improvements.map((step) => step.id));

  for (const experiment of byAgentResult.slice(0, 40)) {
    feed.push({
      id: `result-${experiment.id}`,
      type: "result",
      agentId: experiment.agentId,
      createdAt: experiment.completedAt,
      title: experiment.status === "crash" ? "Crash reported" : "Result published",
      body:
        experiment.status === "crash"
          ? `${experiment.description} crashed for ${experiment.agentId}.`
          : `${experiment.agentId} published ${experiment.description} at ${experiment.valBpb.toFixed(6)}.`,
      tone: experiment.status === "crash" ? "warn" : experiment.deltaVsBest && experiment.deltaVsBest < 0 ? "win" : "neutral",
      href: improvementIds.has(experiment.id) ? `/improvement/${experiment.id}` : undefined,
    });
  }

  for (const claim of raw.claims) {
    feed.push({
      id: `claim-${claim.experiment_key || claim.claimed_at}`,
      type: "claim",
      agentId: claim.agent_id,
      createdAt: claim.claimed_at,
      title: "Claimed next move",
      body: `${claim.agent_id} is trying ${claim.description}.`,
      tone: "neutral",
    });
  }

  for (const insight of raw.insights) {
    feed.push({
      id: `insight-${insight.posted_at}-${insight.agent_id}`,
      type: "insight",
      agentId: insight.agent_id,
      createdAt: insight.posted_at,
      title: "Insight",
      body: insight.insight,
      tone: "neutral",
    });
  }

  for (const hypothesis of raw.hypotheses) {
    feed.push({
      id: `hypothesis-${hypothesis.created_at}-${hypothesis.agent_id}`,
      type: "hypothesis",
      agentId: hypothesis.agent_id,
      createdAt: hypothesis.created_at,
      title: hypothesis.title,
      body: hypothesis.hypothesis,
      tone: "neutral",
    });
  }

  return sortByTimestamp(feed, "createdAt").reverse().slice(0, 24);
}

export function buildDashboardSnapshotFromEnsue(raw: RawEnsueSnapshot): DashboardSnapshot {
  const agentMap = new Map<string, Agent>();
  raw.agentBests.forEach((entry) => ensureAgent(agentMap, entry.agent_id));
  raw.results.forEach((entry) => ensureAgent(agentMap, entry.agent_id));
  raw.claims.forEach((entry) => ensureAgent(agentMap, entry.agent_id));
  raw.insights.forEach((entry) => ensureAgent(agentMap, entry.agent_id));
  raw.hypotheses.forEach((entry) => ensureAgent(agentMap, entry.agent_id));

  const experiments = normalizeResults(raw, agentMap);
  const improvements = buildImprovements(experiments, agentMap);
  const leaderboard = buildLeaderboard(experiments, improvements, agentMap);
  const strategies = buildStrategies(experiments, improvements);
  const feed = buildFeed(raw, experiments, improvements);
  const bestByAgent = Object.fromEntries(
    leaderboard.map((entry) => [entry.agent.id, entry]),
  );
  const currentBest =
    improvements.at(-1)?.valBpb ??
    leaderboard[0]?.bestValBpb ??
    raw.globalBest?.val_bpb ??
    0;

  return {
    agents: [...agentMap.values()].sort((left, right) => left.label.localeCompare(right.label)),
    experiments,
    feed,
    improvements,
    leaderboard,
    strategies,
    stats: {
      experiments: experiments.length,
      improvements: improvements.length,
      agents: Object.keys(bestByAgent).length || agentMap.size,
      currentBest,
    },
    bestByAgent,
  };
}
