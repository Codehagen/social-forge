import { SiteStatus } from "@prisma/client";

import prisma from "@/lib/prisma";
import { getBillingPlan, resolvePlanId } from "./plans";
import type { PlanId } from "./plans";
import { getActiveWorkspaceSubscription } from "./subscription";

export class PlanLimitError extends Error {
  planId: PlanId;
  limit: number | null;

  constructor(planId: PlanId, limit: number | null, message: string) {
    super(message);
    this.name = "PlanLimitError";
    this.planId = planId;
    this.limit = limit;
  }
}

export async function assertWorkspaceCanCreateProject(workspaceId: string) {
  const subscription = await getActiveWorkspaceSubscription(workspaceId);

  const planId = subscription?.plan
    ? resolvePlanId(subscription.plan)
    : ("free" as PlanId);

  const plan = getBillingPlan(planId);
  const projectLimit = plan.limits.activeProjects;

  if (projectLimit === null) {
    return;
  }

  const activeProjects = await prisma.site.count({
    where: {
      workspaceId,
      archivedAt: null,
      status: {
        not: SiteStatus.ARCHIVED,
      },
    },
  });

  if (activeProjects >= projectLimit) {
    const message =
      planId === "free"
        ? "Free plan limit reached. Upgrade to create more projects."
        : `Your ${plan.label} plan allows up to ${projectLimit} active projects. Upgrade to add more.`;
    throw new PlanLimitError(planId, projectLimit, message);
  }
}
