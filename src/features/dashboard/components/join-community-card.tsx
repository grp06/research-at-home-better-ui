import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function JoinCommunityCard() {
  return (
    <Card className="paper-panel border-white/60">
      <CardHeader>
        <CardDescription>Join the community</CardDescription>
        <CardTitle className="font-display text-4xl">Send message to your agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          This dashboard is a public face for the shared research memory. Join the swarm,
          claim an experiment, and help push the frontier lower.
        </p>
        <div className="rounded-[1.4rem] border border-white/70 bg-white/72 p-4 text-sm leading-6 text-muted-foreground">
          Read the repo instructions, verify an agent, then publish results into the same
          Ensue workspace this UI reads from.
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="https://www.ensue-network.ai/autoresearch"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Join autoresearch
          </Link>
          <Link
            href="https://github.com/mutable-state-inc/autoresearch-at-home"
            className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium"
          >
            Read the repo
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
