import { Badge } from "@/components/ui/badge";

import { PitchCard, PitchSlide } from "./ui";

export function SectionPricing() {
  return (
    <PitchSlide label="How we earn">
      <div className="space-y-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Subscription tiers</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <PitchCard className="items-start">
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs uppercase tracking-wide">
                Starter
              </Badge>
              <h3 className="text-2xl font-semibold text-foreground">$29/mo</h3>
              <p className="text-sm text-muted-foreground">
                Freelancers and solo agencies with up to three client workspaces
                and core AI generation.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• 3 workspaces</li>
                <li>• 10 sites per workspace</li>
                <li>• Base AI credits included</li>
              </ul>
            </PitchCard>

            <PitchCard className="items-start border-primary/30 shadow-[0_30px_80px_-60px_rgba(79,70,229,0.8)]">
              <Badge className="rounded-full px-4 py-1 text-xs uppercase tracking-wide">
                Professional
              </Badge>
              <h3 className="text-2xl font-semibold text-foreground">$99/mo</h3>
              <p className="text-sm text-muted-foreground">
                Growing agencies with unlimited workspaces, advanced AI tooling,
                and priority support.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Unlimited workspaces</li>
                <li>• Advanced automations</li>
                <li>• Shared workspace analytics</li>
              </ul>
            </PitchCard>

            <PitchCard className="items-start">
              <Badge variant="outline" className="rounded-full px-4 py-1 text-xs uppercase tracking-wide">
                Enterprise
              </Badge>
              <h3 className="text-2xl font-semibold text-foreground">Custom</h3>
              <p className="text-sm text-muted-foreground">
                White-label deployments with dedicated success, SLAs, and
                integration support.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Tailored limits and usage</li>
                <li>• Dedicated success manager</li>
                <li>• Compliance and SSO support</li>
              </ul>
            </PitchCard>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Additional revenue streams
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <PitchCard className="items-start">
              <h3 className="text-lg font-semibold text-foreground">Team seats</h3>
              <p className="text-sm text-muted-foreground">
                $10/month per extra seat. Unlimited collaborator invites keep
                client teams fully engaged.
              </p>
            </PitchCard>
            <PitchCard className="items-start">
              <h3 className="text-lg font-semibold text-foreground">AI usage</h3>
              <p className="text-sm text-muted-foreground">
                Metered billing for heavy prompt usage, real-time rendering, and
                design audit automation.
              </p>
            </PitchCard>
            <PitchCard className="items-start">
              <h3 className="text-lg font-semibold text-foreground">
                Premium templates
              </h3>
              <p className="text-sm text-muted-foreground">
                Revenue-sharing marketplace for best-in-class templates,
                vertical bundles, and automation packs.
              </p>
            </PitchCard>
          </div>
        </div>
      </div>
    </PitchSlide>
  );
}
