import "server-only";

import { z } from "zod";

import { DashboardConfigError } from "@/features/dashboard/lib/errors";

const serverSchema = z.object({
  ENSUE_API_KEY: z.string().min(1, "ENSUE_API_KEY is required"),
  ENSUE_API_URL: z
    .string()
    .url("ENSUE_API_URL must be a valid URL")
    .default("https://api.ensue-network.ai/"),
  ENSUE_HUB_ORG: z.string().min(1).default("autoresearch-at-home"),
});

export type DashboardServerEnv = z.infer<typeof serverSchema>;

export function getDashboardServerEnv(): DashboardServerEnv {
  const parsed = serverSchema.safeParse({
    ENSUE_API_KEY: process.env.ENSUE_API_KEY,
    ENSUE_API_URL: process.env.ENSUE_API_URL,
    ENSUE_HUB_ORG: process.env.ENSUE_HUB_ORG ?? "autoresearch-at-home",
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new DashboardConfigError(issue?.message ?? "Dashboard env is invalid");
  }

  return parsed.data;
}
