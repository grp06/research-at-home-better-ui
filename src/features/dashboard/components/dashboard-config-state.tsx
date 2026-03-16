import { AlertCircle, KeyRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardConfigState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="grain min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Card className="paper-panel border-white/60">
          <CardHeader className="gap-5">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-8" />
            </div>
            <div>
              <p className="section-kicker">Dashboard configuration</p>
              <CardTitle className="font-display text-5xl leading-none">{title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">{message}</p>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <KeyRound className="size-5" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Required environment</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Set `ENSUE_API_KEY`. Optional overrides are `ENSUE_API_URL`,
                    `ENSUE_HUB_ORG`, and the test-only `ENSUE_FIXTURE_PATH`.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
