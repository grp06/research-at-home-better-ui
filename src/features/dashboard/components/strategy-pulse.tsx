import { ArrowUpRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardSnapshot } from "@/features/dashboard/lib/types";

export function StrategyPulse({
  snapshot,
  selectedAgent,
}: {
  snapshot: DashboardSnapshot;
  selectedAgent: string;
}) {
  const highlightedTracks = new Set(
    snapshot.improvements
      .filter((step) => selectedAgent === "all" || step.agent.id === selectedAgent)
      .map((step) => step.track),
  );

  return (
    <Card className="paper-panel border-white/60">
      <CardHeader>
        <CardDescription>Where the signal is</CardDescription>
        <CardTitle className="font-display text-4xl">Strategy pulse</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {snapshot.strategies.map((strategy, index) => {
          const active = selectedAgent === "all" || highlightedTracks.has(strategy.track);
          const width = `${Math.max(18, strategy.winRate * 100)}%`;

          return (
            <article
              key={strategy.track}
              className="rounded-[1.4rem] border border-white/65 bg-white/72 p-4"
              style={{ opacity: active ? 1 : 0.38 }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium capitalize">{strategy.track}</p>
                  <p className="text-sm text-muted-foreground">
                    {strategy.wins} frontier wins across {strategy.attempts} attempts
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-sm text-primary">
                  <ArrowUpRight className="size-4" />
                  #{index + 1}
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent via-primary to-chart-5"
                  style={{ width }}
                />
              </div>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
