import { Calendar, Rocket, Sparkles, Workflow } from "lucide-react";

import { PitchCard, PitchSlide } from "./ui";

export function SectionNext() {
  return (
    <PitchSlide label="What's coming next">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="grid gap-6 md:grid-cols-2">
          <PitchCard className="items-start">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              Advanced AI builder
            </h2>
            <p className="text-sm text-muted-foreground">
              Multi-modal prompts, brand-trained models, and guided editing to
              capture an agency’s signature look in every output.
            </p>
          </PitchCard>

          <PitchCard className="items-start">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Workflow className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              Template marketplace
            </h2>
            <p className="text-sm text-muted-foreground">
              Revenue-sharing marketplace for components, vertical templates,
              and automation recipes curated by top partners.
            </p>
          </PitchCard>

          <PitchCard className="items-start">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Rocket className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">Client portal</h2>
            <p className="text-sm text-muted-foreground">
              Deliver branded approval flows, change requests, billing, and
              status updates in a single client-facing hub.
            </p>
          </PitchCard>

          <PitchCard className="items-start">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              Integrations hub
            </h2>
            <p className="text-sm text-muted-foreground">
              Native connections to CRMs, payments, analytics, and marketing
              stacks so Social Forge sits at the center of operations.
            </p>
          </PitchCard>
        </div>

        <PitchCard className="items-start bg-muted/70">
          <h2 className="text-lg font-semibold text-foreground">
            Roadmap highlights
          </h2>
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-emerald-400">
                Q2 2025
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• White-label controls and theme presets</li>
                <li>• Advanced SEO and performance analytics</li>
                <li>• Workspace automations for client onboarding</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-sky-400">
                Q3 2025
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Mobile companion app for reviews and approvals</li>
                <li>• E-commerce primitives and inventory sync</li>
                <li>• Localization toolkit supporting 25+ locales</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-purple-400">
                Q4 2025
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Public API and integration framework</li>
                <li>• Enterprise SSO and granular permissions</li>
                <li>• Audit-ready activity trails and compliance exports</li>
              </ul>
            </div>
          </div>
        </PitchCard>
      </div>
    </PitchSlide>
  );
}
