export type AgentId = string;
export type ExperimentStatus = "keep" | "discard" | "crash" | "claimed";
export type FeedEventType = "result" | "claim" | "insight" | "hypothesis";
export type DashboardView = "frontier" | "pressure";
export type StrategyTrack =
  | "baseline"
  | "optimizer"
  | "attention"
  | "shape"
  | "depth"
  | "systems"
  | "residuals"
  | "other";

export interface DashboardFilters {
  agentId: string;
  stepId: string | null;
  view: DashboardView;
}

export interface Agent {
  id: AgentId;
  label: string;
  handle: string;
  tone: string;
}

export interface Experiment {
  id: string;
  agentId: AgentId;
  completedAt: string;
  status: ExperimentStatus;
  valBpb: number;
  description: string;
  track: StrategyTrack;
  note: string;
  commitUrl: string | null;
  branch: string | null;
  deltaVsBest: number | null;
  vramTier: string | null;
}

export interface FeedEvent {
  id: string;
  type: FeedEventType;
  agentId: AgentId;
  createdAt: string;
  title: string;
  body: string;
  tone?: "neutral" | "win" | "warn";
  href?: string;
}

export interface ImprovementStep {
  id: string;
  agent: Agent;
  description: string;
  valBpb: number;
  previousBest: number;
  completedAt: string;
  delta: number;
  reignHours: number;
  pressureCount: number;
  track: StrategyTrack;
  note: string;
  x: number;
  y: number;
  windowExperimentIds: string[];
}

export interface CrownEntry {
  agent: Agent;
  bestValBpb: number;
  frontierWins: number;
  liveAttempts: number;
  momentum: number;
  longestReignHours: number;
}

export interface StrategyPulse {
  track: StrategyTrack;
  wins: number;
  attempts: number;
  winRate: number;
}

export interface DashboardStats {
  experiments: number;
  improvements: number;
  agents: number;
  currentBest: number;
}

export interface DashboardSnapshot {
  agents: Agent[];
  experiments: Experiment[];
  feed: FeedEvent[];
  improvements: ImprovementStep[];
  leaderboard: CrownEntry[];
  strategies: StrategyPulse[];
  stats: DashboardStats;
  bestByAgent: Record<string, CrownEntry>;
}

export interface DashboardApiSuccess {
  ok: true;
  snapshot: DashboardSnapshot;
}

export interface DashboardApiError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export type DashboardApiResponse = DashboardApiSuccess | DashboardApiError;
