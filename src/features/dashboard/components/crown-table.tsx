import { Flame, Orbit, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { DashboardSnapshot } from "@/features/dashboard/lib/types";

export function CrownTable({
  snapshot,
  selectedAgent,
  mode,
  onAgentSelect,
}: {
  snapshot: DashboardSnapshot;
  selectedAgent: string;
  mode: "frontier" | "pressure";
  onAgentSelect: (agentId: string) => void;
}) {
  const rows = [...snapshot.leaderboard].sort((left, right) => {
    if (mode === "frontier") {
      return (
        right.frontierWins - left.frontierWins ||
        left.bestValBpb - right.bestValBpb ||
        right.momentum - left.momentum
      );
    }

    return right.liveAttempts - left.liveAttempts || right.momentum - left.momentum;
  });

  return (
    <div className="space-y-3">
      {rows.map((entry, index) => {
        const selected = selectedAgent === "all" || selectedAgent === entry.agent.id;

        return (
          <button
            type="button"
            key={entry.agent.id}
            onClick={() => onAgentSelect(entry.agent.id)}
            className="w-full rounded-[1.5rem] border border-white/60 bg-white/70 px-4 py-4 text-left transition-all"
            style={{ opacity: selected ? 1 : 0.42 }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex size-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: entry.agent.tone }}
                >
                  #{index + 1}
                </div>
                <div>
                  <p className="font-medium">{entry.agent.label}</p>
                  <p className="text-sm text-muted-foreground">{entry.agent.handle}</p>
                </div>
              </div>

              <div className="grid min-w-[320px] grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl bg-background/75 p-3">
                  <p className="section-kicker">Best</p>
                  <p className="mt-2 font-medium">{entry.bestValBpb.toFixed(6)}</p>
                </div>
                <div className="rounded-2xl bg-background/75 p-3">
                  <p className="section-kicker">{mode === "frontier" ? "Frontier wins" : "Pressure"}</p>
                  <p className="mt-2 font-medium">
                    {mode === "frontier" ? entry.frontierWins : entry.liveAttempts}
                  </p>
                </div>
                <div className="rounded-2xl bg-background/75 p-3">
                    <p className="section-kicker">Momentum</p>
                    <p className="mt-2 font-medium">{entry.momentum.toFixed(2)}</p>
                  </div>
                  <div className="rounded-2xl bg-background/75 p-3">
                    <p className="section-kicker">Longest reign</p>
                    <p className="mt-2 font-medium">{entry.longestReignHours}h</p>
                  </div>
              </div>
            </div>

            <Separator className="my-4 bg-border/65" />
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/18 bg-primary/8 text-foreground">
                <Trophy className="mr-1 size-3" />
                {entry.frontierWins} crowns
              </Badge>
              <Badge variant="outline" className="border-accent/45 bg-accent/18 text-foreground">
                <Orbit className="mr-1 size-3" />
                {entry.liveAttempts} pressure runs
              </Badge>
              <Badge variant="outline" className="border-chart-3/20 bg-chart-3/8 text-foreground">
                <Flame className="mr-1 size-3" />
                moving now
              </Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}
