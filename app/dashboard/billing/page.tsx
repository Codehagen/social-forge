import { notFound } from "next/navigation";

import { getCurrentWorkspace } from "@/app/actions/workspace";
import {
  getBillingPlans,
  isStripeBillingConfigured,
  resolveStripePlans,
  type PlanId,
} from "@/lib/billing/plans";
import { getWorkspaceSubscription } from "@/lib/billing/subscription";

import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    notFound();
  }

  const [subscriptionSummary, plans] = await Promise.all([
    getWorkspaceSubscription(workspace.id),
    Promise.resolve(getBillingPlans()),
  ]);

  const stripePlans = resolveStripePlans();
  const billingConfigured = isStripeBillingConfigured();

  const priceMap: Partial<Record<PlanId, { priceId: string; annualPriceId?: string }>> =
    stripePlans.reduce((acc, plan) => {
      acc[plan.name as PlanId] = {
        priceId: plan.priceId,
        ...(plan.annualDiscountPriceId
          ? { annualPriceId: plan.annualDiscountPriceId }
          : {}),
      };
      return acc;
    }, {} as Partial<Record<PlanId, { priceId: string; annualPriceId?: string }>>);

  return (
    <BillingClient
      workspaceId={workspace.id}
      currentPlanId={subscriptionSummary.planId}
      subscriptionId={subscriptionSummary.subscription?.stripeSubscriptionId ?? undefined}
      plans={plans}
      priceMap={priceMap}
      billingConfigured={billingConfigured}
    />
  );
}
