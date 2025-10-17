import type { Subscription } from "@prisma/client";

import prisma from "@/lib/prisma";
import {
  getBillingPlan,
  resolvePlanId,
  type BillingPlan,
  type PlanId,
} from "./plans";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
]);

export type WorkspaceSubscriptionSummary = {
  plan: BillingPlan;
  planId: PlanId;
  subscription: Subscription | null;
};

export async function getWorkspaceSubscription(
  workspaceId: string
): Promise<WorkspaceSubscriptionSummary> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      referenceId: workspaceId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const planId =
    subscription?.plan && subscription?.status
      ? ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)
        ? resolvePlanId(subscription.plan)
        : ("free" as const)
      : ("free" as const);

  const activeSubscription =
    subscription && ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)
      ? subscription
      : null;

  return {
    plan: getBillingPlan(planId),
    planId,
    subscription: activeSubscription,
  };
}

export async function getActiveWorkspaceSubscription(
  workspaceId: string
): Promise<Subscription | null> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      referenceId: workspaceId,
      status: {
        in: Array.from(ACTIVE_SUBSCRIPTION_STATUSES),
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return subscription;
}

export function subscriptionSupportsMultipleProjects(plan: BillingPlan) {
  return plan.limits.activeProjects === null || plan.limits.activeProjects > 1;
}
