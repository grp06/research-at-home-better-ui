import { logger } from "@/lib/logger";

export function trackEvent(name: string, meta?: Record<string, unknown>) {
  logger.info(`[trace] ${name}`, meta);
}
