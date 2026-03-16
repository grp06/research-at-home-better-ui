import { Lightbulb, RadioTower, Target, TriangleAlert } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardSnapshot } from "@/features/dashboard/lib/types";

const iconMap = {
  result: RadioTower,
  claim: Target,
  insight: Lightbulb,
  hypothesis: Lightbulb,
} as const;

export function ActivityFeed({
  snapshot,
  selectedAgent,
}: {
  snapshot: DashboardSnapshot;
  selectedAgent: string;
}) {
  const rows =
    selectedAgent === "all"
      ? snapshot.feed
      : snapshot.feed.filter((item) => item.agentId === selectedAgent);

  return (
    <Card className="paper-panel border-white/60">
      <CardHeader>
        <CardDescription>Live research pulse</CardDescription>
        <CardTitle className="font-display text-4xl">What the swarm is doing now</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((item) => {
          const Icon = iconMap[item.type];
          const isWarn = item.tone === "warn";

          return (
            <article
              key={item.id}
              className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex size-10 items-center justify-center rounded-full ${
                    isWarn ? "bg-destructive/12 text-destructive" : "bg-primary/10 text-primary"
                  }`}
                >
                  {isWarn ? <TriangleAlert className="size-4" /> : <Icon className="size-4" />}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                  <p className="section-kicker pt-1">{new Date(item.createdAt).toLocaleString()}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="inline-flex text-sm font-medium text-primary"
                    >
                      Open related view
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
