import Link from "next/link";

import { Button } from "@/components/ui/button";

import { PitchCard, PitchSlide } from "./ui";

export function SectionDemo() {
  return (
    <PitchSlide label="Platform demo">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <PitchCard className="items-start gap-6 border-foreground/12 bg-background/95 shadow-[0_35px_90px_-65px_rgba(15,23,42,0.75)]">
          <h2 className="text-balance text-3xl font-semibold text-foreground md:text-4xl">
            Build production-ready sites in minutes
          </h2>
          <p className="text-lg text-foreground/90">
            Generate layouts, copy, and components from a single prompt. Tweak
            details with visual controls or jump straight into code when you
            need to push the edges.
          </p>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li>• AI-assisted editing with instant side-by-side preview</li>
            <li>• Workspace-specific templates and brand guardrails</li>
            <li>• One-click publishing with built-in performance checks</li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="https://cal.com/socialforge/demo">Request a live demo</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-foreground/15 bg-background/90 text-foreground hover:bg-background"
            >
              <Link href="/help">Explore documentation</Link>
            </Button>
          </div>
        </PitchCard>

        <PitchCard className="items-center bg-muted/70 p-0">
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-foreground/15 bg-background/80 p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={64}
              height={64}
              fill="none"
              aria-hidden="true"
              className="text-muted-foreground/70"
            >
              <path
                fill="currentColor"
                d="M32 60.667c-4.611 0-8.944-.875-13-2.625-4.055-1.75-7.583-4.125-10.583-7.125S3.042 44.39 1.292 40.333C-.458 36.277-1.333 31.944-1.333 27.333c0-4.611.875-8.944 2.625-13 1.75-4.056 4.125-7.583 7.125-10.583S15.056-.625 19.112-2.375C23.168-4.125 27.5-5 32-5c4.5 0 8.833.875 12.888 2.625 4.055 1.75 7.583 4.125 10.583 7.125s5.375 6.527 7.125 10.583c1.75 4.056 2.625 8.389 2.625 13 0 4.611-.875 8.944-2.625 13-1.75 4.056-4.125 7.583-7.125 10.583s-6.528 5.375-10.583 7.125c-4.055 1.75-8.388 2.625-12.888 2.625Zm-3.333-20V14l20 13.333-20 13.334Z"
              />
            </svg>
            <div className="space-y-2">
              <p className="text-base font-semibold text-foreground">
                Product walkthrough coming soon
              </p>
              <p className="text-sm text-muted-foreground">
                We&apos;re recording the guided tour now. Get on the list and
                we&apos;ll send it to you first.
              </p>
            </div>
          </div>
        </PitchCard>
      </div>
    </PitchSlide>
  );
}
