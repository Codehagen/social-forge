"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireOperator() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const operator = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      agent: true,
      superAdmin: true,
    },
  });

  if (!operator || (!operator.agent && !operator.superAdmin)) {
    throw new Error("Forbidden");
  }

  return operator;
}

export async function getControlRoomSidebarMetrics() {
  await requireOperator();

  const now = new Date();

  const [pendingWorkspaceInvites, delinquentSubscriptions, pendingAffiliatePayouts] =
    await Promise.all([
      prisma.workspaceInvitation.count({
        where: {
          acceptedAt: null,
          expiresAt: {
            gt: now,
          },
        },
      }),
      prisma.subscription.count({
        where: {
          status: {
            in: ["past_due", "incomplete", "unpaid"],
          },
        },
      }),
      prisma.referral.count({
        where: {
          status: "CONVERTED",
          commissionPaidAt: null,
        },
      }),
    ]);

  return {
    pendingWorkspaceInvites,
    delinquentSubscriptions,
    pendingAffiliatePayouts,
  };
}

export async function getControlRoomOverview() {
  await requireOperator();

  const now = new Date();
  const thirtyDaysOut = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);

  const [
    workspacesTotal,
    membersTotal,
    activeSubscriptions,
    pendingAffiliatesCount,
    sitesAwaitingReview,
    recentWorkspaces,
    upcomingRenewals,
    pendingAffiliates,
    workspaceInvitesPending,
    delinquentSubscriptions,
    upcomingRenewalsCount,
  ] = await Promise.all([
    prisma.workspace.count(),
    prisma.workspaceMember.count(),
    prisma.subscription.count({
      where: {
        status: {
          in: ["active", "trialing"],
        },
      },
    }),
    prisma.affiliate.count({
      where: {
        status: "PENDING",
      },
    }),
    prisma.site.count({
      where: {
        status: {
          in: ["REVIEW", "READY_FOR_TRANSFER"],
        },
      },
    }),
    prisma.workspace.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
            sites: true,
          },
        },
      },
    }),
    prisma.subscription.findMany({
      take: 5,
      where: {
        periodEnd: {
          not: null,
          gte: now,
          lte: thirtyDaysOut,
        },
      },
      orderBy: {
        periodEnd: "asc",
      },
      select: {
        id: true,
        plan: true,
        status: true,
        periodEnd: true,
        seats: true,
      },
    }),
    prisma.affiliate.findMany({
      take: 5,
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        referralCode: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.workspaceInvitation.count({
      where: {
        acceptedAt: null,
        expiresAt: {
          gt: now,
        },
      },
    }),
    prisma.subscription.count({
      where: {
        status: {
          in: ["past_due", "incomplete", "unpaid"],
        },
      },
    }),
    prisma.subscription.count({
      where: {
        periodEnd: {
          not: null,
          gte: now,
          lte: thirtyDaysOut,
        },
      },
    }),
  ]);

  return {
    totals: {
      workspaces: workspacesTotal,
      members: membersTotal,
      activeSubscriptions,
      pendingAffiliates: pendingAffiliatesCount,
      sitesAwaitingReview,
    },
    upcomingRenewalsCount,
    workspaceInvitesPending,
    delinquentSubscriptions,
    recentWorkspaces,
    upcomingRenewals,
    pendingAffiliates,
  };
}
