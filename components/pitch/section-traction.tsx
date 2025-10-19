"use client";

import { PitchCard, PitchSlide } from "./ui";

export function SectionTraction() {
  return (
    <PitchSlide label="Where we are">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="grid gap-6 md:grid-cols-2">
          <PitchCard className="items-start">
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-primary">
                Beta users
              </span>
              <p className="text-sm text-muted-foreground">
                Early partners running production sites and weekly feedback
                sessions to shape the roadmap.
              </p>
            </div>
            <span className="text-5xl font-semibold text-foreground md:text-[70px]">
              50+
            </span>
          </PitchCard>

          <PitchCard className="items-start">
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-primary">
                Active workspaces
              </span>
              <p className="text-sm text-muted-foreground">
                Agencies and freelancers managing live clients in Social Forge
                today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.25)]" />
              <span className="text-5xl font-semibold text-foreground md:text-[70px]">
                25+
              </span>
            </div>
          </PitchCard>

          <PitchCard className="items-start">
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-primary">
                Sites built
              </span>
              <p className="text-sm text-muted-foreground">
                AI-generated projects created, iterated, and shipped through the
                platform.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.25)]" />
              <span className="text-5xl font-semibold text-foreground md:text-[70px]">
                100+
              </span>
            </div>
          </PitchCard>

          <PitchCard className="items-start bg-muted/70">
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-primary">
                Development stage
              </span>
              <p className="text-sm text-muted-foreground">
                Focused on onboarding design partners before broad release.
              </p>
            </div>
            <span className="text-base font-semibold text-emerald-400">
              Private beta
            </span>
          </PitchCard>
        </div>

        <PitchCard className="items-start bg-muted/70">
          <h2 className="text-2xl font-semibold text-foreground">Momentum</h2>
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Growing interest
              </h3>
              <p className="text-sm text-muted-foreground">
                Cold outreach response rates are above 40% as agencies look for
                AI-enabled workflow alternatives.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Time saved
              </h3>
              <p className="text-sm text-muted-foreground">
                Design partners report a 50% reduction in net-new site builds
                and faster turnaround on customer revisions.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Retention signals
              </h3>
              <p className="text-sm text-muted-foreground">
                Weekly active users have increased 3x in the last quarter as new
                automations unlocked additional use cases.
              </p>
            </div>
          </div>
        </PitchCard>
      </div>
    </PitchSlide>
  );
}
