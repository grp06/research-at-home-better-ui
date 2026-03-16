import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Orbit } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { StrategyPulse } from "@/features/dashboard/components/strategy-pulse";
import { getDashboardSnapshot } from "@/features/dashboard/lib/dashboard";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId: rawAgentId } = await params;
  const agentId = decodeURIComponent(rawAgentId);
  const snapshot = await getDashboardSnapshot();
  const agent = snapshot.agents.find((entry) => entry.id === agentId);
  const best = snapshot.bestByAgent[agentId];

  if (!agent || !best) {
    notFound();
  }

  const improvements = snapshot.improvements.filter((step) => step.agent.id === agentId);
  const experiments = snapshot.experiments.filter((experiment) => experiment.agentId === agentId);
  const latestExperiment = experiments.at(-1) ?? null;

  return (
    <main className="grain min-h-screen px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
        <Link
          href={`/?agent=${encodeURIComponent(agentId)}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to the live dashboard
        </Link>

        <section className="paper-panel rounded-[2rem] border border-white/60 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="section-kicker">Agent profile</p>
              <h1 className="font-display mt-3 text-5xl leading-none sm:text-6xl">
                {agent.label}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                This page isolates how one agent has moved the frontier, where it is
                currently applying pressure, and which strategy families keep showing up in
                its work.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  best {best.bestValBpb.toFixed(6)}
                </Badge>
                <Badge variant="outline">{best.frontierWins} frontier wins</Badge>
                <Badge variant="outline">{best.liveAttempts} pressure runs</Badge>
                <Badge variant="outline">{best.longestReignHours}h longest reign</Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="border-white/60 bg-white/65">
                <CardHeader>
                  <CardDescription>Current personal best</CardDescription>
                  <CardTitle className="text-4xl">{best.bestValBpb.toFixed(6)}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-white/60 bg-white/65">
                <CardHeader>
                  <CardDescription>Frontier wins</CardDescription>
                  <CardTitle className="text-4xl">{best.frontierWins}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-white/60 bg-white/65">
                <CardHeader>
                  <CardDescription>Latest activity</CardDescription>
                  <CardTitle className="text-lg">
                    {latestExperiment
                      ? new Date(latestExperiment.completedAt).toLocaleString()
                      : "No recent run"}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.8fr)]">
          <div className="flex flex-col gap-5">
            <Card className="paper-panel border-white/60">
              <CardHeader>
                <CardDescription>Frontier history</CardDescription>
                <CardTitle className="font-display text-4xl">Every cut this agent landed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {improvements.length ? (
                  improvements
                    .slice()
                    .reverse()
                    .map((step) => (
                      <Link
                        key={step.id}
                        href={`/improvement/${step.id}`}
                        className="block rounded-[1.35rem] border border-white/70 bg-white/78 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{step.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(step.completedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{step.valBpb.toFixed(6)}</p>
                            <p className="text-sm text-primary">-{step.delta.toFixed(4)}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="size-4" />
                            {step.reignHours}h reign
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Orbit className="size-4" />
                            {step.pressureCount} nearby attempts
                          </span>
                        </div>
                      </Link>
                    ))
                ) : (
                  <div className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4 text-sm text-muted-foreground">
                    This agent has not landed a frontier cut in the current snapshot.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="paper-panel border-white/60">
              <CardHeader>
                <CardDescription>Recent experiments</CardDescription>
                <CardTitle className="font-display text-4xl">Pressure and follow-through</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {experiments
                  .slice()
                  .reverse()
                  .slice(0, 8)
                  .map((experiment) => (
                    <article
                      key={experiment.id}
                      className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{experiment.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(experiment.completedAt).toLocaleString()}
                          </p>
                        </div>
                        {experiment.valBpb > 0 ? (
                          <span className="font-medium">{experiment.valBpb.toFixed(6)}</span>
                        ) : (
                          <Badge variant="destructive">crash</Badge>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline">{experiment.status}</Badge>
                        <Badge variant="outline">{experiment.track}</Badge>
                        {experiment.deltaVsBest !== null ? (
                          <Badge variant="outline">
                            delta {experiment.deltaVsBest.toFixed(4)}
                          </Badge>
                        ) : null}
                      </div>
                    </article>
                  ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <StrategyPulse snapshot={snapshot} selectedAgent={agentId} />
            <ActivityFeed snapshot={snapshot} selectedAgent={agentId} />
            <Card className="paper-panel border-white/60">
              <CardHeader>
                <CardDescription>Contribution snapshot</CardDescription>
                <CardTitle className="font-display text-4xl">How this agent shows up</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4">
                  {agent.label} has created {best.frontierWins} global-best moves and held the
                  crown for as long as {best.longestReignHours} hours on a single cut.
                </p>
                <p className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4">
                  Momentum is currently {best.momentum.toFixed(2)}, which blends recent result
                  quality with how often this agent is testing the active frontier.
                </p>
                <p className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4">
                  Latest run: {latestExperiment?.description ?? "No recorded experiment"}.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
