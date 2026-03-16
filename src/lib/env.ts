import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

export const env = serverSchema.parse(process.env);
