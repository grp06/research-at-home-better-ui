import "server-only";

import {
  EnsueAgentBestSchema,
  EnsueClaimSchema,
  EnsueHypothesisSchema,
  EnsueInsightSchema,
  EnsueListKeySchema,
  EnsueMemoryResultSchema,
  EnsueResultRecordSchema,
  EnsueTierBestSchema,
  type EnsueAgentBest,
  type EnsueClaim,
  type EnsueHypothesis,
  type EnsueInsight,
  type EnsueResultRecord,
  type EnsueTierBest,
} from "@/features/dashboard/schemas/ensue";
import { DashboardDataError } from "@/features/dashboard/lib/errors";
import { getDashboardServerEnv } from "@/features/dashboard/lib/server-env";
import { logger } from "@/lib/logger";

export interface RawEnsueSnapshot {
  results: EnsueResultRecord[];
  globalBest: EnsueResultRecord | null;
  agentBests: EnsueAgentBest[];
  tierBests: EnsueTierBest[];
  claims: EnsueClaim[];
  insights: EnsueInsight[];
  hypotheses: EnsueHypothesis[];
}

interface RpcResponse {
  result?: {
    content?: Array<{ text?: string }>;
  };
  error?: unknown;
}

const DEFAULT_LIMIT = 500;

function getKeyName(entry: unknown) {
  const parsed = EnsueListKeySchema.parse(entry);
  return typeof parsed === "string" ? parsed : parsed.key_name;
}

async function ensueRpc<T>(toolName: string, argumentsValue: Record<string, unknown>) {
  const env = getDashboardServerEnv();
  const payload = {
    jsonrpc: "2.0",
    method: "tools/call",
    params: { name: toolName, arguments: argumentsValue },
    id: 1,
  };

  const response = await fetch(env.ENSUE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.ENSUE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new DashboardDataError(
      `Ensue RPC ${toolName} failed with status ${response.status}`,
      "ENSUE_RPC_HTTP_ERROR",
    );
  }

  const rawText = await response.text();
  const text = rawText.startsWith("data: ") ? rawText.slice(6) : rawText;
  const parsed = JSON.parse(text) as RpcResponse;

  if (parsed.error) {
    throw new DashboardDataError(
      `Ensue RPC ${toolName} returned an error`,
      "ENSUE_RPC_ERROR",
    );
  }

  const content = parsed.result?.content ?? [];
  if (!content.length || !content[0]?.text) {
    throw new DashboardDataError(
      `Ensue RPC ${toolName} returned an empty payload`,
      "ENSUE_RPC_EMPTY",
    );
  }

  return JSON.parse(content[0].text) as T;
}

async function listKeyNames(prefix: string, limit = DEFAULT_LIMIT) {
  const env = getDashboardServerEnv();
  const result = await ensueRpc<{ keys?: unknown[] }>("list_keys", {
    prefix: `@${env.ENSUE_HUB_ORG}/${prefix}`,
    limit,
  });

  return (result.keys ?? []).map(getKeyName);
}

async function getMemories(keyNames: string[]) {
  if (!keyNames.length) {
    return [];
  }

  const results: Array<{ key_name: string; value: string }> = [];

  for (let index = 0; index < keyNames.length; index += 50) {
    const chunk = keyNames.slice(index, index + 50);
    const memory = await ensueRpc<{ results?: unknown[] }>("get_memory", {
      key_names: chunk,
    });

    for (const item of memory.results ?? []) {
      const parsed = EnsueMemoryResultSchema.parse(item);
      if (parsed.status === "success" && parsed.value) {
        results.push({ key_name: parsed.key_name, value: parsed.value });
      }
    }
  }

  return results;
}

async function readNamespace<T>(
  prefix: string,
  schema: { parse: (value: unknown) => T },
  limit = DEFAULT_LIMIT,
) {
  const env = getDashboardServerEnv();
  const rawKeyNames = await listKeyNames(prefix, limit);
  const fullKeyNames = rawKeyNames.map((keyName) => `@${env.ENSUE_HUB_ORG}/${keyName}`);
  const memories = await getMemories(fullKeyNames);

  return memories
    .map((entry) => {
      try {
        return schema.parse(JSON.parse(entry.value));
      } catch (error) {
        logger.warn("Skipping invalid Ensue memory payload", {
          keyName: entry.key_name,
          error: error instanceof Error ? error.message : "unknown parse error",
        });
        return null;
      }
    })
    .filter((entry): entry is T => entry !== null);
}

async function readSingle<T>(
  keyName: string,
  schema: { parse: (value: unknown) => T },
) {
  const env = getDashboardServerEnv();
  const memories = await getMemories([`@${env.ENSUE_HUB_ORG}/${keyName}`]);
  const first = memories[0];

  if (!first) {
    return null;
  }

  return schema.parse(JSON.parse(first.value));
}

export async function fetchResults() {
  return readNamespace("results/", EnsueResultRecordSchema, 5000);
}

export async function fetchAgentBests() {
  return readNamespace("best/agent/", EnsueAgentBestSchema, 500);
}

export async function fetchGlobalBest() {
  return readSingle("best/metadata", EnsueResultRecordSchema);
}

export async function fetchTierBests() {
  return readNamespace("best/tier/", EnsueTierBestSchema, 100);
}

export async function fetchClaims() {
  return readNamespace("claims/", EnsueClaimSchema, 200);
}

export async function fetchInsights() {
  return readNamespace("insights/", EnsueInsightSchema, 200);
}

export async function fetchHypotheses() {
  return readNamespace("hypotheses/", EnsueHypothesisSchema, 200);
}

export async function fetchEnsueSnapshot(): Promise<RawEnsueSnapshot> {
  const [results, globalBest, agentBests, tierBests, claims, insights, hypotheses] =
    await Promise.all([
      fetchResults(),
      fetchGlobalBest(),
      fetchAgentBests(),
      fetchTierBests(),
      fetchClaims(),
      fetchInsights(),
      fetchHypotheses(),
    ]);

  return {
    results,
    globalBest,
    agentBests,
    tierBests,
    claims,
    insights,
    hypotheses,
  };
}
