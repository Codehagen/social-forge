import { PitchCard, PitchSlide } from "./ui";

export function SectionTeam() {
  return (
    <PitchSlide label="Who we are">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <PitchCard className="items-start">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-primary/15 text-2xl font-semibold text-primary">
            SF
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Christer Hagen
            </h2>
            <p className="text-sm text-muted-foreground">
              Founder · Technical lead
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Previous SaaS founder and senior full-stack engineer delivering
            large-scale marketing systems for European brands. Obsessed with
            workflows that help small teams act like global agencies.
          </p>

          <dl className="grid w-full gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground/70">
                Expertise
              </dt>
              <dd>Product, platform, go-to-market</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground/70">
                Base
              </dt>
              <dd>Oslo, Norway</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground/70">
                Focus
              </dt>
              <dd>AI workflow automation</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground/70">
                Advisors
              </dt>
              <dd>Design, AI research, growth</dd>
            </div>
          </dl>
        </PitchCard>

        <PitchCard className="items-start bg-muted/70">
          <blockquote className="text-2xl font-semibold text-foreground">
            “We’re building the operating system that lets every agency scale
            like a top-tier studio.”
          </blockquote>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Social Forge started after years of shipping marketing sites the
              hard way. We set out to automate best practices—performance,
              accessibility, deployment—so teams stay focused on outcomes.
            </p>
            <p>
              Today we work closely with design partners across Europe and North
              America to encode their playbooks into Social Forge. Their feedback
              fuels our roadmap and ensures we deliver compounding leverage with
              every release.
            </p>
          </div>
        </PitchCard>
      </div>
    </PitchSlide>
  );
}
