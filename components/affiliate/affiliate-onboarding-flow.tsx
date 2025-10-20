"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Affiliate } from "@prisma/client";

import {
  completeAffiliateOnboarding,
  createAffiliateOnboardingLink,
  refreshAffiliateAccountStatus,
} from "@/app/actions/affiliate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";

type ConnectProps = {
  stripeStatus: string | null;
  isRefreshing: boolean;
};

function Connect({ stripeStatus, isRefreshing }: ConnectProps) {
  const [isOpening, startOpenTransition] = useTransition();
  const isConnected = stripeStatus === "complete";
  const isBusy = isRefreshing || isOpening;
  const label = isRefreshing
    ? "Checking status…"
    : isOpening
      ? "Opening Stripe…"
      : isConnected
        ? "Connected"
        : "Connect payouts";

  const handleClick = () => {
    if (isBusy || isConnected) {
      return;
    }

    startOpenTransition(async () => {
      try {
        const { url } = await createAffiliateOnboardingLink();

        if (url) {
          window.location.href = url;
          return;
        }

        toast.error("Unable to generate Stripe onboarding link.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to create onboarding link."
        );
      }
    });
  };

  return (
    <ItemActions className="justify-end">
      <Button
        size="sm"
        variant="outline"
        data-status={isConnected ? "connected" : "pending"}
        className={cn(
          "min-w-[160px]",
          isConnected &&
            "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-emerald-200"
        )}
        disabled={isBusy || isConnected}
        onClick={handleClick}
        type="button"
      >
        {label}
      </Button>
    </ItemActions>
  );
}

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
  "Client referrals / word of mouth",
  "Just getting started",
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
  const [hasInitialStatusCheck, setHasInitialStatusCheck] = useState(false);
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

    setCurrentStep(3);
  };

  const refreshStripeStatus = useCallback(
    async (showToast = false) => {
      try {
        const updated = await refreshAffiliateAccountStatus();
        const nextStatus = updated?.stripeConnectStatus ?? null;
        setStripeStatus(nextStatus);

        if (showToast) {
          toast.success(
            nextStatus === "complete"
              ? "Stripe account connected"
              : "Stripe status refreshed"
          );
        }
      } catch (error) {
        if (showToast) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to refresh Stripe status"
          );
        } else {
          console.error("Unable to refresh Stripe status", error);
        }
      }
    },
    []
  );

  const statusBadgeVariant =
    stripeStatus === "complete" ? "default" : "secondary";
  const statusBadgeLabel =
    stripeStatus === "complete" ? "Ready" : "Action needed";
  const statusDetail = stripeStatus ?? "pending";

  useEffect(() => {
    if (hasInitialStatusCheck || stripeStatus === "complete") {
      return;
    }

    setHasInitialStatusCheck(true);
    startRefreshTransition(() => refreshStripeStatus(false));
  }, [
    hasInitialStatusCheck,
    refreshStripeStatus,
    startRefreshTransition,
    stripeStatus,
  ]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && stripeStatus !== "complete") {
        startRefreshTransition(() => refreshStripeStatus(false));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshStripeStatus, startRefreshTransition, stripeStatus]);

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
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Connect Stripe payouts
              </h2>
              <p className="text-sm text-muted-foreground">
                We pay commissions through Stripe Connect. It takes about 2 minutes, and you can edit details later.
              </p>
            </div>

            <ItemGroup>
              <Item variant="outline" className="flex-wrap gap-4 sm:flex-nowrap">
                <ItemContent className="min-w-0 space-y-2">
                  <ItemTitle className="flex items-center gap-2">
                    Stripe payouts
                    <Badge variant={statusBadgeVariant}>{statusBadgeLabel}</Badge>
                  </ItemTitle>
                  <ItemDescription>
                    {`Status: ${statusDetail}. Stripe handles tax forms and payouts, and you can update details anytime.`}
                  </ItemDescription>
                </ItemContent>
                <Connect stripeStatus={stripeStatus} isRefreshing={isRefreshing} />
              </Item>
            </ItemGroup>

            <div className="flex justify-end gap-3">
              {stripeStatus !== "complete" && (
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Skip for now
                </Button>
              )}
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={stripeStatus !== "complete"}
              >
                Continue
              </Button>
            </div>
          </section>
        )}

      {currentStep === 2 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Share your promotion plan
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Share how you plan to promote Social Forge. We use this to tailor resources, and it&apos;s totally fine if you&apos;re just getting started.
              </p>
            </div>

            <form onSubmit={handleSubmitInfo} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primary-channel">Primary channel *</Label>
                <Input
                  id="primary-channel"
                  placeholder='e.g. YouTube reviews, community chats, client referrals, or "Just getting started"'
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

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
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
