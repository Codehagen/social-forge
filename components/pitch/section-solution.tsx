import { Bot, ListChecks, UsersRound, Workflow } from "lucide-react";

import { PitchCard, PitchSlide } from "./ui";

export function SectionSolution() {
  return (
    <PitchSlide label="Our solution">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="grid gap-6 md:grid-cols-2">
          <PitchCard className="items-start">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Workflow className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-foreground">One platform</h2>
            <p className="text-sm text-muted-foreground">
              Social Forge unifies AI website generation, workspace management,
              deployment, and billing into a single surface designed for agency
              scale.
            </p>
          </PitchCard>

          <PitchCard className="items-start">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UsersRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-foreground">
              Multi-tenant workspaces
            </h2>
            <p className="text-sm text-muted-foreground">
              Each client receives a dedicated workspace with roles, assets, and
              approvals—keeping teams organized while preserving white-label
              control.
            </p>
          </PitchCard>

          <PitchCard className="items-start md:col-span-2">
            <h2 className="text-2xl font-semibold text-foreground">
              We help agencies ship, sell, and expand faster with AI automation
            </h2>
            <p className="text-sm text-muted-foreground">
              Social Forge compresses production timelines from weeks to
              minutes, freeing teams to focus on client strategy, upsells, and
              recurring revenue.
            </p>
          </PitchCard>

          <PitchCard className="items-start md:col-span-2 lg:col-span-1">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-foreground">
              AI-powered execution
            </h2>
            <p className="text-sm text-muted-foreground">
              Generate production-ready sites from structured prompts, enforce
              design systems automatically, and roll changes to every workspace
              with confidence.
            </p>
          </PitchCard>
        </div>

        <PitchCard className="items-start bg-muted/70">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ListChecks className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-semibold text-foreground">Key capabilities</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>• Prompt-to-site generation with responsive quality gates</li>
            <li>• Workspace billing, client permissions, and branded portals</li>
            <li>• Automated deployments, backups, and performance monitoring</li>
            <li>• Version history with instant rollback for every site</li>
            <li>• Built-in collaboration—comments, tasks, and change reviews</li>
          </ul>
        </PitchCard>
      </div>
    </PitchSlide>
  );
}
