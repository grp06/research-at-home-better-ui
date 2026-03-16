import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const apiKey = process.env.ENSUE_API_KEY;
const apiUrl = process.env.ENSUE_API_URL ?? "https://api.ensue-network.ai/";
const hubOrg = process.env.ENSUE_HUB_ORG ?? "autoresearch-at-home";
const outputPath = fileURLToPath(new URL("../tests/fixtures/ensue/dashboard.json", import.meta.url));

if (!apiKey) {
  throw new Error("ENSUE_API_KEY is required to capture fixtures");
}

async function ensueRpc(toolName, argumentsValue) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: toolName, arguments: argumentsValue },
      id: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ensue RPC ${toolName} failed with status ${response.status}`);
  }

  const rawText = await response.text();
  const text = rawText.startsWith("data: ") ? rawText.slice(6) : rawText;
  const parsed = JSON.parse(text);

  if (parsed.error) {
    throw new Error(`Ensue RPC ${toolName} returned an error`);
  }

  const content = parsed.result?.content ?? [];
  if (!content.length || !content[0]?.text) {
    throw new Error(`Ensue RPC ${toolName} returned an empty payload`);
  }

  return JSON.parse(content[0].text);
}

async function listKeyNames(prefix, limit) {
  const result = await ensueRpc("list_keys", {
    prefix: `@${hubOrg}/${prefix}`,
    limit,
  });

  return (result.keys ?? []).map((entry) =>
    typeof entry === "string" ? entry : entry.key_name,
  );
}

async function getMemories(keyNames) {
  if (!keyNames.length) {
    return [];
  }

  const results = [];

  for (let index = 0; index < keyNames.length; index += 50) {
    const chunk = keyNames.slice(index, index + 50);
    const memory = await ensueRpc("get_memory", { key_names: chunk });

    for (const item of memory.results ?? []) {
      if (item.status === "success" && item.value) {
        results.push({ key_name: item.key_name, value: JSON.parse(item.value) });
      }
    }
  }

  return results;
}

async function readNamespace(prefix, limit) {
  const rawKeyNames = await listKeyNames(prefix, limit);
  const fullKeyNames = rawKeyNames.map((keyName) => `@${hubOrg}/${keyName}`);
  const memories = await getMemories(fullKeyNames);
  return memories.map((entry) => entry.value);
}

async function readSingle(keyName) {
  const memories = await getMemories([`@${hubOrg}/${keyName}`]);
  return memories[0]?.value ?? null;
}

const snapshot = {
  results: await readNamespace("results/", 5000),
  globalBest: await readSingle("best/metadata"),
  agentBests: await readNamespace("best/agent/", 500),
  tierBests: await readNamespace("best/tier/", 100),
  claims: await readNamespace("claims/", 200),
  insights: await readNamespace("insights/", 200),
  hypotheses: await readNamespace("hypotheses/", 200),
};

await mkdir(fileURLToPath(new URL("../tests/fixtures/ensue", import.meta.url)), {
  recursive: true,
});
await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

console.log(`Wrote ${outputPath}`);
console.log(`Captured ${snapshot.results.length} results`);
console.log(`Captured ${snapshot.agentBests.length} agent bests`);
console.log(`Captured ${snapshot.claims.length} claims`);
console.log(`Captured ${snapshot.insights.length} insights`);
console.log(`Captured ${snapshot.hypotheses.length} hypotheses`);
