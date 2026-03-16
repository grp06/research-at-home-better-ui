import { ArrowDown, Clock3, Dot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { DashboardSnapshot } from "@/features/dashboard/lib/types";

function toneForPoint(selected: boolean, tone: string) {
  if (selected) {
    return tone;
  }

  return "rgb(160 143 113 / 0.35)";
}

export function DescentWall({
  snapshot,
  selectedAgent,
  selectedStepId,
  onStepSelect,
}: {
  snapshot: DashboardSnapshot;
  selectedAgent: string;
  selectedStepId: string | null;
  onStepSelect: (stepId: string) => void;
}) {
  const steps = snapshot.improvements;
  const pathPoints = steps
    .map((step, index) => {
      const previous = steps[index - 1];
      if (!previous) {
        return `M ${step.x} ${step.y} H ${step.x + 4}`;
      }

      return `H ${step.x} V ${step.y}`;
    })
    .join(" ");

  const areaPoints = steps.reduce((segments, step, index) => {
    if (index === 0) {
      return `${segments} M ${step.x} ${step.y} H ${step.x + 4}`;
    }

    return `${segments} H ${step.x} V ${step.y}`;
  }, "");

  const selectedSteps =
    selectedAgent === "all"
      ? steps
      : steps.filter((step) => step.agent.id === selectedAgent);

  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(250,244,230,0.72))] p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Global best trajectory</p>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            The line only moves when the swarm actually beats the current best.
            Faint dots are the pressure cloud: experiments that tested the same plateau but did not move the wall.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/25 bg-primary/8 text-foreground">
            {steps.length} frontier cuts
          </Badge>
          <Badge variant="outline" className="border-accent/45 bg-accent/18 text-foreground">
            {selectedSteps.length} by selection
          </Badge>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          className="h-[500px] w-full overflow-visible"
          preserveAspectRatio="none"
          aria-label="Descent wall showing frontier improvements over time"
        >
          <defs>
            <linearGradient id="wall-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(15,118,110,0.22)" />
              <stop offset="100%" stopColor="rgba(15,118,110,0.03)" />
            </linearGradient>
            <linearGradient id="wall-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(175,132,13,0.72)" />
              <stop offset="50%" stopColor="rgba(15,118,110,0.76)" />
              <stop offset="100%" stopColor="rgba(7,64,128,0.82)" />
            </linearGradient>
          </defs>

          {[18, 34, 50, 66, 82].map((line) => (
            <g key={line}>
              <line
                x1="0"
                x2="100"
                y1={line}
                y2={line}
                stroke="rgba(120,104,74,0.12)"
                strokeWidth="0.25"
                strokeDasharray="0.8 1.2"
              />
            </g>
          ))}

          <path
            d={`${areaPoints} H 96 V 92 H 4 V ${steps[0]?.y ?? 0}`}
            fill="url(#wall-fill)"
            opacity="0.8"
          />
          <path
            d={pathPoints}
            fill="none"
            stroke="url(#wall-stroke)"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {snapshot.experiments
            .filter((experiment) => experiment.status !== "keep" && experiment.valBpb > 0)
            .map((experiment, index) => {
              const anchor =
                steps.findLast((step) => new Date(step.completedAt) <= new Date(experiment.completedAt)) ??
                steps[0];

              const orbitX = anchor.x + 2 + (index % 5) * 1.8;
              const orbitY = anchor.y - 2.2 - (index % 4) * 0.9;

              return (
                <circle
                  key={experiment.id}
                  cx={orbitX}
                  cy={orbitY}
                  r="0.5"
                  fill="rgba(94, 76, 46, 0.28)"
                />
              );
            })}

          {steps.map((step) => {
            const isSelected = selectedAgent === "all" || selectedAgent === step.agent.id;
            const tone = toneForPoint(isSelected, step.agent.tone);
            const halo = isSelected ? `${step.agent.tone}20` : "rgba(160, 143, 113, 0.16)";

            return (
              <g key={step.id}>
                <circle cx={step.x} cy={step.y} r="2.6" fill={halo} />
                <circle cx={step.x} cy={step.y} r="1.25" fill={tone} />
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0">
          {steps.map((step, index) => {
            const isSelected = selectedAgent === "all" || selectedAgent === step.agent.id;
            const isStepSelected = selectedStepId === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepSelect(step.id)}
                className="pointer-events-auto absolute max-w-[240px] -translate-x-1/2 text-left transition-transform hover:scale-[1.01] text-left focus:outline-none"
                style={{
                  left: `${step.x}%`,
                  top: `${Math.max(8, step.y - (index % 2 === 0 ? 10 : 20))}%`,
                  opacity: isSelected ? 1 : 0.42,
                }}
              >
                <div
                  className={`rounded-[1.3rem] border px-3 py-3 shadow-[0_16px_40px_rgba(99,76,35,0.08)] backdrop-blur-md ${
                    isStepSelected
                      ? "border-primary/60 bg-white"
                      : "border-white/70 bg-white/82"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{step.agent.label}</p>
                    <Badge
                      variant="outline"
                      className="border-transparent bg-primary/10 text-primary"
                    >
                      <ArrowDown className="mr-1 size-3" />
                      {step.delta.toFixed(4)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-foreground/90">{step.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3" />
                      {step.reignHours}h reign
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Dot className="size-4" />
                      {step.pressureCount} attempts nearby
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
