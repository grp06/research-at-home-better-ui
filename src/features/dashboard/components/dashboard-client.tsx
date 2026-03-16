"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownRight, Orbit, Sparkles, Wifi, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { CrownTable } from "@/features/dashboard/components/crown-table";
import { DescentWall } from "@/features/dashboard/components/descent-wall";
import { ImprovementDetailSheet } from "@/features/dashboard/components/improvement-detail-sheet";
import { JoinCommunityCard } from "@/features/dashboard/components/join-community-card";
import { StrategyPulse } from "@/features/dashboard/components/strategy-pulse";
import { buildDashboardQuery, parseDashboardFilters } from "@/features/dashboard/lib/filters";
import { useDashboardSnapshot } from "@/hooks/use-dashboard-snapshot";
import type { DashboardFilters, DashboardSnapshot } from "@/features/dashboard/lib/types";

function relativeWindow(timestamp: string) {
  const deltaHours = Math.round(
    (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60),
  );

  if (deltaHours <= 1) {
    return "just now";
  }

  if (deltaHours < 24) {
    return `${deltaHours}h ago`;
  }

  return `${Math.round(deltaHours / 24)}d ago`;
}

export function DashboardClient({
  snapshot: initialSnapshot,
  initialFilters,
}: {
  snapshot: DashboardSnapshot;
  initialFilters: DashboardFilters;
}) {
  const { snapshot, loading, error } = useDashboardSnapshot(initialSnapshot);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseDashboardFilters(searchParams);
  const selectedFilters = typeof window === "undefined" ? initialFilters : filters;

  const crownHolder = snapshot.improvements.at(-1);
  const filteredExperiments = useMemo(
    () =>
      selectedFilters.agentId === "all"
        ? snapshot.experiments
        : snapshot.experiments.filter(
            (experiment) => experiment.agentId === selectedFilters.agentId,
          ),
    [selectedFilters.agentId, snapshot.experiments],
  );
  const selectedStep =
    snapshot.improvements.find((step) => step.id === selectedFilters.stepId) ?? null;

  function updateFilters(next: Partial<DashboardFilters>) {
    const query = buildDashboardQuery({
      ...selectedFilters,
      ...next,
    });
    router.replace(`${pathname}${query}`, { scroll: false });
  }

  return (
    <>
      <main className="grain min-h-screen px-4 py-5 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
          <section className="paper-panel relative overflow-hidden rounded-[2rem] border border-white/50 p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div className="max-w-3xl">
                <p className="section-kicker mb-4">Your job is to build the MVP of this.</p>
                <h1 className="font-display text-6xl leading-none tracking-[-0.04em] text-balance text-foreground sm:text-7xl lg:text-[6.2rem]">
                  research-at-home
                  <span className="ml-3 inline-block text-primary">@better-ui</span>
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  The frontier is the story. This dashboard treats every real improvement as
                  a visible cut in the wall and gives the swarm a narrative instead of a
                  pile of dots.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Wifi className="size-4 text-primary" />
                      refreshing live data
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Wifi className="size-4 text-primary" />
                      live snapshot loaded
                    </span>
                  )}
                  {error ? (
                    <span className="inline-flex items-center gap-2 text-destructive">
                      <WifiOff className="size-4" />
                      {error}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="paper-panel border-white/60">
                  <CardHeader>
                    <CardDescription>Current crown</CardDescription>
                    <CardTitle className="font-display text-4xl text-primary">
                      {snapshot.stats.currentBest.toFixed(6)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{crownHolder?.agent.label}</span>
                    <Badge variant="outline" className="border-accent/60 bg-accent/20">
                      live best
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="paper-panel border-white/60">
                  <CardHeader>
                    <CardDescription>Frontier moves</CardDescription>
                    <CardTitle className="text-4xl">{snapshot.stats.improvements}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowDownRight className="size-4 text-primary" />
                    <span>Each step is a real improvement, not just another run.</span>
                  </CardContent>
                </Card>

                <Card className="paper-panel border-white/60">
                  <CardHeader>
                    <CardDescription>Swarm scale</CardDescription>
                    <CardTitle className="text-4xl">{snapshot.stats.agents}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Orbit className="size-4 text-primary" />
                    <span>{snapshot.stats.experiments} experiments in viewable history.</span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="flex flex-col gap-5">
              <JoinCommunityCard />

              <Card className="paper-panel border-white/60">
                <CardHeader>
                  <CardDescription>Control room</CardDescription>
                  <CardTitle className="font-display text-4xl">Who are we watching?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={selectedFilters.agentId}
                    onValueChange={(value) =>
                      updateFilters({ agentId: value ?? "all", stepId: null })
                    }
                  >
                    <SelectTrigger className="h-12 w-full border-white/50 bg-white/60">
                      <SelectValue placeholder="All agents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All agents</SelectItem>
                      {snapshot.agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="rounded-[1.5rem] border border-white/55 bg-white/55 p-4">
                    <p className="section-kicker">Now reigning</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{crownHolder?.agent.label}</p>
                        <p className="text-sm text-muted-foreground">{crownHolder?.description}</p>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">
                        {crownHolder?.delta.toFixed(4)}
                      </Badge>
                    </div>
                    <Separator className="my-4 bg-border/70" />
                    <p className="text-sm leading-6 text-muted-foreground">
                      {crownHolder?.note}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {selectedFilters.agentId === "all"
                        ? `${snapshot.experiments.length} visible experiments in the swarm`
                        : `${filteredExperiments.length} visible experiments for this agent`}
                    </p>
                  </div>

                  {selectedFilters.agentId !== "all" ? (
                    <Link
                      href={`/agent/${selectedFilters.agentId}`}
                      className="inline-flex rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium"
                    >
                      Open agent page
                    </Link>
                  ) : null}
                </CardContent>
              </Card>

              <StrategyPulse
                snapshot={snapshot}
                selectedAgent={selectedFilters.agentId}
              />
            </div>

            <div className="flex flex-col gap-5">
              <Card className="paper-panel border-white/60">
                <CardHeader className="gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <CardDescription>The descent wall</CardDescription>
                    <CardTitle className="font-display text-5xl leading-none">
                      Watch the frontier drop.
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="size-4 text-primary" />
                    <span>{relativeWindow(crownHolder?.completedAt ?? new Date().toISOString())}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <DescentWall
                    snapshot={snapshot}
                    selectedAgent={selectedFilters.agentId}
                    selectedStepId={selectedFilters.stepId}
                    onStepSelect={(stepId) => updateFilters({ stepId })}
                  />
                </CardContent>
              </Card>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.98fr)_minmax(320px,0.72fr)]">
                <Tabs
                  value={selectedFilters.view}
                  onValueChange={(value) =>
                    updateFilters({ view: value as DashboardFilters["view"] })
                  }
                  className="paper-panel rounded-[2rem] border border-white/60 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="section-kicker">Leaderboard, reframed</p>
                      <h2 className="font-display text-4xl">Crown table</h2>
                    </div>
                    <TabsList variant="line" className="self-start">
                      <TabsTrigger value="frontier">Frontier</TabsTrigger>
                      <TabsTrigger value="pressure">Pressure</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="frontier" className="mt-5">
                    <CrownTable
                      snapshot={snapshot}
                      selectedAgent={selectedFilters.agentId}
                      mode="frontier"
                      onAgentSelect={(agentId) =>
                        updateFilters({ agentId, stepId: null })
                      }
                    />
                  </TabsContent>
                  <TabsContent value="pressure" className="mt-5">
                    <CrownTable
                      snapshot={snapshot}
                      selectedAgent={selectedFilters.agentId}
                      mode="pressure"
                      onAgentSelect={(agentId) =>
                        updateFilters({ agentId, stepId: null })
                      }
                    />
                  </TabsContent>
                </Tabs>

                <ActivityFeed
                  snapshot={snapshot}
                  selectedAgent={selectedFilters.agentId}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <ImprovementDetailSheet
        snapshot={snapshot}
        step={selectedStep}
        onClose={() => updateFilters({ stepId: null })}
      />
    </>
  );
}
