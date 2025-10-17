"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import type { BillingPlan, PlanId } from "@/lib/billing/plans";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type PriceMap = Partial<Record<PlanId, { priceId: string; annualPriceId?: string }>>;

type BillingClientProps = {
  workspaceId: string;
  currentPlanId: PlanId;
  subscriptionId?: string;
  plans: BillingPlan[];
  priceMap: PriceMap;
  billingConfigured: boolean;
};

type UpgradeTarget = {
  planId: PlanId;
  annual?: boolean;
};

export function BillingClient({
  workspaceId,
  currentPlanId,
  subscriptionId,
  plans,
  priceMap,
  billingConfigured,
}: BillingClientProps) {
  const [pending, setPending] = useState<UpgradeTarget | null>(null);
  const currentPlan = plans.find((plan) => plan.id === currentPlanId);

  const handleUpgrade = async (options: UpgradeTarget) => {
    if (!billingConfigured) {
      toast.error("Stripe billing is not configured yet.");
      return;
    }

    setPending(options);

    try {
      const { data, error } = await authClient.subscription.upgrade({
        plan: options.planId,
        referenceId: workspaceId,
        ...(options.annual ? { annual: true } : {}),
        ...(subscriptionId ? { subscriptionId } : {}),
        seats: 1,
        successUrl: "/dashboard/billing?checkout=success",
        cancelUrl: "/dashboard/billing?checkout=cancel",
        returnUrl: "/dashboard/billing",
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      toast.success("Checkout initiated. Follow the Stripe window to finish.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start the upgrade checkout."
      );
    } finally {
      setPending(null);
    }
  };

  const handleOpenBillingPortal = async () => {
    if (!billingConfigured) {
      toast.error("Stripe billing is not configured yet.");
      return;
    }

    try {
      const { data, error } = await authClient.subscription.billingPortal({
        referenceId: workspaceId,
        returnUrl: "/dashboard/billing",
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      toast.error("Billing portal URL was not returned.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to open the billing portal."
      );
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your workspace plan, checkout upgrades, and access the Stripe billing portal.
        </p>
      </div>

      {currentPlan && (
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentPlan.label}
                <Badge variant="secondary">Current plan</Badge>
              </CardTitle>
              <CardDescription>{currentPlan.description}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleOpenBillingPortal}
                disabled={!billingConfigured || !subscriptionId}
              >
                Manage billing
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Target user:</span> {currentPlan.targetUser}
            </div>
            <div>
              <span className="font-medium text-foreground">Included seats:</span>{" "}
              {currentPlan.limits.includedSeats ?? "Unlimited"}
            </div>
            <div>
              <span className="font-medium text-foreground">Active project limit:</span>{" "}
              {currentPlan.limits.activeProjects ?? "Unlimited"}
            </div>
          </CardContent>
        </Card>
      )}

      {!billingConfigured && (
        <Alert>
          <AlertTitle>Stripe setup incomplete</AlertTitle>
          <AlertDescription>
            Add your Stripe API keys and price IDs to enable checkout and subscription management.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const prices = priceMap[plan.id];
          const canCheckout =
            billingConfigured &&
            !isCurrent &&
            plan.isPaid &&
            Boolean(prices?.priceId);

          return (
            <Card
              key={plan.id}
              className={isCurrent ? "border-primary/50" : undefined}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.label}
                  {isCurrent ? (
                    <Badge variant="secondary">Current</Badge>
                  ) : (
                    plan.isPaid ? null : <Badge variant="outline">Free</Badge>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Ideal for
                  </span>
                  <p className="text-sm text-foreground">{plan.targetUser}</p>
                </div>

                <Separator />

                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  {plan.isPaid ? (
                    <div className="text-sm text-muted-foreground">
                      {prices?.priceId ? (
                        <>Monthly checkout enabled</>
                      ) : (
                        <>Price ID missing</>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Always free</div>
                  )}

                  {plan.isPaid ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        onClick={() => handleUpgrade({ planId: plan.id })}
                        disabled={!canCheckout || pending !== null}
                      >
                        {pending?.planId === plan.id && !pending?.annual
                          ? "Starting checkout…"
                          : isCurrent
                          ? "Current plan"
                          : "Upgrade monthly"}
                      </Button>
                      {prices?.annualPriceId ? (
                        <Button
                          variant="outline"
                          onClick={() => handleUpgrade({ planId: plan.id, annual: true })}
                          disabled={!canCheckout || pending !== null}
                        >
                          {pending?.planId === plan.id && pending?.annual
                            ? "Starting checkout…"
                            : "Upgrade annually"}
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    <Button disabled variant="outline">
                      Included
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
