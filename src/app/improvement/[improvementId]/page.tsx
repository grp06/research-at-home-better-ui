import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Orbit, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardSnapshot } from "@/features/dashboard/lib/dashboard";

export default async function ImprovementPage({
  params,
}: {
  params: Promise<{ improvementId: string }>;
}) {
  const { improvementId: rawImprovementId } = await params;
  const improvementId = decodeURIComponent(rawImprovementId);
  const snapshot = await getDashboardSnapshot();
  const stepIndex = snapshot.improvements.findIndex((step) => step.id === improvementId);
  const step = stepIndex >= 0 ? snapshot.improvements[stepIndex] : null;

  if (!step) {
    notFound();
  }

  const previous = stepIndex > 0 ? snapshot.improvements[stepIndex - 1] : null;
  const next =
    stepIndex < snapshot.improvements.length - 1
      ? snapshot.improvements[stepIndex + 1]
      : null;
  const windowExperiments = snapshot.experiments.filter((experiment) =>
    step.windowExperimentIds.includes(experiment.id),
  );

  return (
    <main className="grain min-h-screen px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
        <Link
          href={`/?step=${encodeURIComponent(step.id)}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to the live dashboard
        </Link>

        <section className="paper-panel rounded-[2rem] border border-white/60 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="section-kicker">Frontier cut</p>
              <h1 className="font-display mt-3 text-5xl leading-none sm:text-6xl">
                {step.description}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                This page freezes one real descent-wall move and the pressure window around it
                so you can see what changed, how much it mattered, and which nearby attempts
                were part of the same frontier battle.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {step.valBpb.toFixed(6)}
                </Badge>
                <Badge variant="outline">-{step.delta.toFixed(4)} vs previous best</Badge>
                <Badge variant="outline">{step.reignHours}h reign</Badge>
                <Badge variant="outline">{step.pressureCount} nearby attempts</Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="border-white/60 bg-white/65">
                <CardHeader>
                  <CardDescription>Winning agent</CardDescription>
                  <CardTitle className="text-lg">{step.agent.label}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-white/60 bg-white/65">
                <CardHeader>
                  <CardDescription>Strategy family</CardDescription>
                  <CardTitle className="text-lg capitalize">{step.track}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-white/60 bg-white/65">
                <CardHeader>
                  <CardDescription>Landed at</CardDescription>
                  <CardTitle className="text-lg">
                    {new Date(step.completedAt).toLocaleString()}
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
                <CardDescription>Why this mattered</CardDescription>
                <CardTitle className="font-display text-4xl">The move itself</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4 text-sm leading-6 text-muted-foreground">
                  {step.note}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4">
                    <p className="section-kicker">Previous best</p>
                    <p className="mt-3 text-3xl font-medium">
                      {step.previousBest.toFixed(6)}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4">
                    <p className="section-kicker">New best</p>
                    <p className="mt-3 text-3xl font-medium">{step.valBpb.toFixed(6)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="paper-panel border-white/60">
              <CardHeader>
                <CardDescription>Pressure window</CardDescription>
                <CardTitle className="font-display text-4xl">What else happened nearby</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {windowExperiments.map((experiment) => (
                  <article
                    key={experiment.id}
                    className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{experiment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {experiment.agentId} · {new Date(experiment.completedAt).toLocaleString()}
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
                    </div>
                  </article>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <Card className="paper-panel border-white/60">
              <CardHeader>
                <CardDescription>Wall context</CardDescription>
                <CardTitle className="font-display text-4xl">Where this cut sits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4">
                  <p className="section-kicker">Current cut</p>
                  <p className="mt-2 font-medium">{step.description}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.agent.label} pushed the frontier by {step.delta.toFixed(4)}.
                  </p>
                </div>
                {previous ? (
                  <Link
                    href={`/improvement/${previous.id}`}
                    className="block rounded-[1.35rem] border border-white/70 bg-white/78 p-4"
                  >
                    <p className="section-kicker">Previous cut</p>
                    <p className="mt-2 font-medium">{previous.description}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {previous.valBpb.toFixed(6)} by {previous.agent.label}
                    </p>
                  </Link>
                ) : null}
                {next ? (
                  <Link
                    href={`/improvement/${next.id}`}
                    className="block rounded-[1.35rem] border border-white/70 bg-white/78 p-4"
                  >
                    <p className="section-kicker">Next cut</p>
                    <p className="mt-2 font-medium">{next.description}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {next.valBpb.toFixed(6)} by {next.agent.label}
                    </p>
                  </Link>
                ) : (
                  <div className="rounded-[1.35rem] border border-white/70 bg-white/78 p-4">
                    <p className="section-kicker">Current crown</p>
                    <p className="mt-2 font-medium">This cut still owns the frontier.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="paper-panel border-white/60">
              <CardHeader>
                <CardDescription>Related jump-offs</CardDescription>
                <CardTitle className="font-display text-4xl">Keep exploring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/agent/${step.agent.id}`}
                  className="flex items-center justify-between rounded-[1.35rem] border border-white/70 bg-white/78 p-4"
                >
                  <span>Open {step.agent.label}</span>
                  <Trophy className="size-4 text-primary" />
                </Link>
                <Link
                  href={`/?step=${encodeURIComponent(step.id)}`}
                  className="flex items-center justify-between rounded-[1.35rem] border border-white/70 bg-white/78 p-4"
                >
                  <span>Back to the descent wall</span>
                  <Orbit className="size-4 text-primary" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
