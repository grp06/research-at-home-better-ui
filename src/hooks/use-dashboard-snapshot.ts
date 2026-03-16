"use client";

import { startTransition, useEffect, useRef, useState } from "react";

import type {
  DashboardApiResponse,
  DashboardSnapshot,
} from "@/features/dashboard/lib/types";

const POLL_INTERVAL_MS = 15_000;

export function useDashboardSnapshot(initial: DashboardSnapshot) {
  const [snapshot, setSnapshot] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      const data = (await response.json()) as DashboardApiResponse;

      if (!response.ok || !data.ok) {
        setError(data.ok ? "Dashboard refresh failed" : data.error.message);
        return;
      }

      setError(null);
      startTransition(() => {
        if (mounted.current) {
          setSnapshot(data.snapshot);
        }
      });
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Dashboard refresh failed";
      setError(message);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    mounted.current = true;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      mounted.current = false;
      window.clearInterval(interval);
    };
  }, []);

  return { snapshot, loading, error, refresh };
}
