"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Affiliate } from "@prisma/client";

import {
  completeAffiliateOnboarding,
  refreshAffiliateAccountStatus,
} from "@/app/actions/affiliate";
import { ManagePayoutButton } from "@/components/affiliate/manage-payout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type AffiliateOnboardingFlowProps = {
  affiliate: Pick<
    Affiliate,
    "id" | "referralCode" | "stripeConnectStatus" | "onboardingCompleted"
  >;
};

const channels = [
  "YouTube",
  "Blog / SEO",
  "Newsletter",
  "Podcast",
  "Agency clients",
  "Communities / Slack / Discord",
  "Paid ads",
  "Other",
];

export function AffiliateOnboardingFlow({ affiliate }: AffiliateOnboardingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [primaryChannel, setPrimaryChannel] = useState("");
  const [promotionPlan, setPromotionPlan] = useState("");
  const [audienceSize, setAudienceSize] = useState("");
  const [resourcesNeeded, setResourcesNeeded] = useState("");
  const [stripeStatus, setStripeStatus] = useState<string | null>(
    affiliate.stripeConnectStatus ?? null
  );
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [isCompleting, startCompleteTransition] = useTransition();
  const [origin, setOrigin] = useState(
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleSubmitInfo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!primaryChannel.trim() || !promotionPlan.trim()) {
      toast.error("Share your promotion plan before continuing.");
      return;
    }

    setCurrentStep(2);
  };

  const handleRefreshStatus = () => {
    startRefreshTransition(async () => {
      try {
        const updated = await refreshAffiliateAccountStatus();
        setStripeStatus(updated?.stripeConnectStatus ?? null);
        toast.success("Stripe status refreshed");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to refresh Stripe status"
        );
      }
    });
  };

  const handleFinish = () => {
    startCompleteTransition(async () => {
      try {
        await completeAffiliateOnboarding({
          primaryChannel: primaryChannel.trim(),
          promotionPlan: promotionPlan.trim(),
          audienceSize: audienceSize.trim() || undefined,
          resourcesNeeded: resourcesNeeded.trim() || undefined,
          stripeStatus,
        });

        toast.success("Affiliate onboarding complete");
        router.push("/affiliate/dashboard");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to complete onboarding"
        );
      }
    });
  };

  return (
    <div className="flex flex-col space-y-8">
      {currentStep === 1 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Welcome to the crew
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Share how you plan to promote Social Forge. This helps us give you the right support and assets.
              </p>
            </div>

            <form onSubmit={handleSubmitInfo} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primary-channel">Primary channel *</Label>
                <Input
                  id="primary-channel"
                  placeholder="e.g. YouTube reviews, newsletter, agency clients"
                  list="affiliate-channels"
                  value={primaryChannel}
                  onChange={(event) => setPrimaryChannel(event.target.value)}
                  required
                />
                <datalist id="affiliate-channels">
                  {channels.map((channel) => (
                    <option key={channel} value={channel} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promotion-plan">How will you pitch Social Forge? *</Label>
                <Textarea
                  id="promotion-plan"
                  value={promotionPlan}
                  onChange={(event) => setPromotionPlan(event.target.value)}
                  placeholder="Tell us about your upcoming content, campaigns, or client work."
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience-size">
                  Audience size (optional)
                </Label>
                <Input
                  id="audience-size"
                  placeholder="e.g. 20k newsletter subscribers"
                  value={audienceSize}
                  onChange={(event) => setAudienceSize(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resources-needed">
                  Anything you need from us?
                </Label>
                <Textarea
                  id="resources-needed"
                  value={resourcesNeeded}
                  onChange={(event) => setResourcesNeeded(event.target.value)}
                  placeholder="Share the assets, copy, or examples that would help you promote faster."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">Continue to Stripe</Button>
              </div>
            </form>
          </section>
        )}

      {currentStep === 2 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Connect Stripe payouts
              </h2>
              <p className="text-sm text-muted-foreground">
                We pay commissions through Stripe Connect. It takes about 2 minutes, and you can edit details later.
              </p>
            </div>

            <div className="rounded-lg border bg-muted/40 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Current status</p>
                  <p className="text-sm text-muted-foreground">
                    {stripeStatus ?? "pending"}
                  </p>
                </div>
                <Badge variant={stripeStatus === "complete" ? "default" : "secondary"}>
                  {stripeStatus === "complete" ? "Ready" : "Action needed"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ManagePayoutButton label="Open Stripe onboarding" />
              <Button
                variant="outline"
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Refreshing…" : "I've connected"}
              </Button>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)}>
                {stripeStatus === "complete"
                  ? "Continue"
                  : "Skip for now"}
              </Button>
            </div>
          </section>
        )}

      {currentStep === 3 && (
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Grab your referral link
              </h2>
              <p className="text-sm text-muted-foreground">
                Share this link anywhere you promote. We track referrals for 30 days and pay $100 for every workspace that upgrades.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referral-link" className="text-sm font-medium">
                Your unique link
              </Label>
              <div className="flex gap-2">
                <Input
                  id="referral-link"
                  value={`${origin}/?ref=${affiliate.referralCode}`}
                  readOnly
                  className="font-mono text-xs"
                  onFocus={(event) => event.currentTarget.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const referralLink = `${origin}/?ref=${affiliate.referralCode}`;

                    if (navigator?.clipboard?.writeText) {
                      navigator.clipboard
                        .writeText(referralLink)
                        .then(() => toast.success("Referral link copied"))
                        .catch(() =>
                          toast.error(
                            "Unable to copy link. Copy it manually."
                          )
                        );
                    } else {
                      toast.error("Clipboard access unavailable. Copy manually.");
                    }
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Pro tip: add UTM parameters when sharing publicly so you can
              attribute performance in your analytics tool.
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button onClick={handleFinish} disabled={isCompleting}>
                {isCompleting ? "Finishing…" : "Jump into dashboard"}
              </Button>
            </div>
          </section>
        )}

      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Program highlights</p>
          <ul className="mt-3 space-y-2">
            <li>• $100 per upgraded workspace</li>
            <li>• Unlimited referrals, 30-day window</li>
            <li>• Stripe handles taxes & compliance</li>
            <li>• Dedicated partner support</li>
          </ul>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4 text-xs text-muted-foreground">
          Need help? Email
          {" "}
          <a
            href="mailto:partners@socialforge.tech"
            className="font-medium text-foreground underline"
          >
            partners@socialforge.tech
          </a>
          {" "}
          or DM @codehagen on X. We typically reply within a day.
        </div>
      </div>
    </div>
  );
}
