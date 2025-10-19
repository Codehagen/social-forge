import { Clock, Cpu, Layers } from "lucide-react";

import { PitchCard, PitchSlide } from "./ui";

export function SectionProblem() {
  return (
    <PitchSlide label="Current problem">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="grid gap-6 md:grid-cols-2">
          <PitchCard className="items-start">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-foreground">
              Slow, manual delivery
            </h2>
            <p className="text-sm text-muted-foreground">
              Agencies lose margin to repetitive setup steps, manual QA, and
              jumpy handoffs. Shipping a baseline site regularly eats full
              project weeks that should be spent on strategy.
            </p>
          </PitchCard>

          <PitchCard className="items-start">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-foreground">
              Fragmented tooling
            </h2>
            <p className="text-sm text-muted-foreground">
              Teams juggle builders, hosting dashboards, billing apps, and
              shared spreadsheets. The context switching erodes margin and
              forces manual reconciliation for every account.
            </p>
          </PitchCard>

          <PitchCard className="items-start md:col-span-2">
            <h2 className="text-2xl font-semibold text-foreground">
              The market is inefficient and painfully expensive
            </h2>
            <p className="text-sm text-muted-foreground">
              Retainers disappear into setup hours, clients wait weeks for
              incremental updates, and agencies struggle to scale without
              ballooning headcount. Even high-performing teams can’t productize
              their craft with today’s tooling.
            </p>
          </PitchCard>
        </div>

        <div className="grid gap-6">
          <PitchCard className="items-start bg-muted/70">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Cpu className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-2xl font-semibold text-foreground">
              Agencies need a unified operating system
            </h2>
            <p className="text-base text-muted-foreground">
              Social Forge automates site creation, orchestrates client
              workspaces, and keeps revenue-driving context in one place so
              teams reclaim time for strategic work.
            </p>
          </PitchCard>
        </div>
      </div>
    </PitchSlide>
  );
}
