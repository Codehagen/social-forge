import { PitchCard, PitchSlide } from "./ui";

export function SectionVision() {
  return (
    <PitchSlide label="Our vision">
      <div className="space-y-8">
        <h1 className="text-balance text-4xl font-semibold leading-tight text-foreground md:text-5xl lg:text-6xl">
          Become the default operating system for AI-first agencies worldwide.
        </h1>

        <PitchCard className="items-start bg-muted/70">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                Compounding automation
              </h2>
              <p className="text-sm text-muted-foreground">
                Encode the best agency playbooks into reusable automations that
                get smarter with every project shipped.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                Human-first workflows
              </h2>
              <p className="text-sm text-muted-foreground">
                Keep designers, developers, and producers in control with
                reliable guardrails, audit trails, and accessible collaboration.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                Global scale from day one
              </h2>
              <p className="text-sm text-muted-foreground">
                Localized experiences, compliance-ready infrastructure, and APIs
                that plug into the tools agencies already rely on.
              </p>
            </div>
          </div>
        </PitchCard>
      </div>
    </PitchSlide>
  );
}
