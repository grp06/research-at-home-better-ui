"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DashboardSnapshot, ImprovementStep } from "@/features/dashboard/lib/types";

export function ImprovementDetailSheet({
  snapshot,
  step,
  onClose,
}: {
  snapshot: DashboardSnapshot;
  step: ImprovementStep | null;
  onClose: () => void;
}) {
  if (!step) {
    return null;
  }

  const windowExperiments = snapshot.experiments.filter((experiment) =>
    step.windowExperimentIds.includes(experiment.id),
  );

  return (
    <div className="fixed inset-0 z-50 bg-foreground/10 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-hidden border-l border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(252,246,235,0.92))] shadow-[0_24px_80px_rgba(40,28,8,0.22)]">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
          <div>
            <p className="section-kicker">Improvement story</p>
            <h2 className="font-display text-4xl leading-none">{step.description}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close detail sheet">
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            <div className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {step.valBpb.toFixed(6)}
                </Badge>
                <Badge variant="outline" className="border-accent/40 bg-accent/16">
                  -{step.delta.toFixed(4)}
                </Badge>
                <Badge variant="outline">{step.reignHours}h reign</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{step.note}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>Agent: {step.agent.label}</span>
                <span>Track: {step.track}</span>
                <span>{new Date(step.completedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/70 bg-white/72 p-5">
              <p className="section-kicker">Pressure window</p>
              <div className="mt-4 space-y-3">
                {windowExperiments.map((experiment) => (
                  <div
                    key={experiment.id}
                    className="rounded-[1.1rem] border border-border/60 bg-background/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{experiment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {experiment.agentId} · {experiment.status}
                        </p>
                      </div>
                      {experiment.valBpb > 0 ? (
                        <span className="text-sm font-medium">
                          {experiment.valBpb.toFixed(6)}
                        </span>
                      ) : (
                        <Badge variant="destructive">crash</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/improvement/${step.id}`}
                className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
              >
                Open story page
              </Link>
              <Link
                href={`/agent/${step.agent.id}`}
                className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium"
              >
                View agent profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
