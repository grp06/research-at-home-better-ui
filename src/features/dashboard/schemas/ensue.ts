import { z } from "zod";

const nullableString = z.string().nullable().optional().transform((value) => value ?? null);
const nullableNumber = z.number().nullable().optional().transform((value) => value ?? null);

export const EnsueMemoryResultSchema = z.object({
  key_name: z.string(),
  status: z.string(),
  value: z.string().optional(),
});

export const EnsueListKeySchema = z.union([
  z.string(),
  z.object({
    key_name: z.string(),
  }),
]);

export const EnsueResultRecordSchema = z.object({
  agent_id: z.string().default("unknown"),
  val_bpb: z.number().nullable().optional(),
  memory_gb: nullableNumber,
  vram_tier: nullableString,
  vram_total_gb: nullableNumber,
  status: z.string().default("discard"),
  commit: nullableString,
  description: z.string().default("untitled experiment"),
  train_py: nullableString,
  repo_url: nullableString,
  branch: nullableString,
  commit_url: nullableString,
  completed_at: z.string().default(""),
  delta_vs_best: nullableNumber,
  global_best_at_publish: nullableNumber,
  delta_vs_own_best: nullableNumber,
  agent_best_at_publish: nullableNumber,
});

export const EnsueAgentBestSchema = z.object({
  agent_id: z.string().default("unknown"),
  val_bpb: z.number(),
  description: z.string().default("personal best"),
  memory_gb: nullableNumber,
  vram_tier: nullableString,
  vram_total_gb: nullableNumber,
  achieved_at: z.string().default(""),
  previous_best_val_bpb: nullableNumber,
});

export const EnsueTierBestSchema = z.object({
  agent_id: z.string().default("unknown"),
  achieved_by: nullableString,
  val_bpb: nullableNumber,
  best_val_bpb: nullableNumber,
  description: z.string().default("tier best"),
  vram_tier: nullableString,
  achieved_at: z.string().default(""),
  completed_at: z.string().default(""),
});

export const EnsueClaimSchema = z.object({
  agent_id: z.string().default("unknown"),
  description: z.string().default("claimed experiment"),
  experiment_key: z.string().default(""),
  claimed_at: z.string().default(""),
  expected_duration_seconds: nullableNumber,
  status: z.string().default("claimed"),
});

export const EnsueInsightSchema = z.object({
  agent_id: z.string().default("unknown"),
  insight: z.string().default(""),
  evidence_keys: z.array(z.string()).optional().default([]),
  posted_at: z.string().default(""),
});

export const EnsueHypothesisSchema = z.object({
  agent_id: z.string().default("unknown"),
  title: z.string().default("Untitled hypothesis"),
  hypothesis: z.string().default(""),
  suggested_config: z.record(z.string(), z.unknown()).nullable().optional(),
  evidence_keys: z.array(z.string()).optional().default([]),
  priority: z.number().default(3),
  created_at: z.string().default(""),
});

export type EnsueResultRecord = z.infer<typeof EnsueResultRecordSchema>;
export type EnsueAgentBest = z.infer<typeof EnsueAgentBestSchema>;
export type EnsueTierBest = z.infer<typeof EnsueTierBestSchema>;
export type EnsueClaim = z.infer<typeof EnsueClaimSchema>;
export type EnsueInsight = z.infer<typeof EnsueInsightSchema>;
export type EnsueHypothesis = z.infer<typeof EnsueHypothesisSchema>;
