import Link from "next/link";

import { Button } from "@/components/ui/button";

import { PitchCard, PitchSlide } from "./ui";

export function SectionStart() {
  return (
    <PitchSlide
      label="Investor pitch"
      action={
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
          Pitch/2025
        </span>
      }
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <PitchCard className="items-start gap-6 border-foreground/12 bg-background/95 shadow-[0_35px_90px_-65px_rgba(15,23,42,0.75)]">
          <h1 className="text-balance text-4xl font-semibold text-foreground md:text-5xl lg:text-6xl">
            Social Forge is the operating system for AI-first agencies.
          </h1>
          <p className="text-lg text-foreground/90">
            We automate the repetitive work of building, managing, and scaling
            web properties so agencies can reinvest time in strategy, upsells,
            and client relationships.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="https://cal.com/socialforge/demo">Book a briefing</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-foreground/15 bg-background/90 text-foreground hover:bg-background"
            >
              <Link href="/open">View open metrics</Link>
            </Button>
          </div>
        </PitchCard>

        <PitchCard className="items-start bg-muted/70">
          <h2 className="text-lg font-semibold text-foreground">
            Why agencies partner with us
          </h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              • <strong className="text-foreground">50% faster launches</strong>{" "}
              from prompt-to-site generation and instant deployments
            </li>
            <li>
              • <strong className="text-foreground">Workspace automation</strong>{" "}
              keeps billing, approvals, and reporting in one place
            </li>
            <li>
              • <strong className="text-foreground">Enterprise-ready</strong>{" "}
              security, compliance, and observability from the start
            </li>
          </ul>
          <dl className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground/70">
                Founded
              </dt>
              <dd>2025 · Remote-first</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground/70">
                Stage
              </dt>
              <dd>Private beta</dd>
            </div>
          </dl>
        </PitchCard>
      </div>
    </PitchSlide>
  );
}
