"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import {
  SiteStatus,
  BuilderSessionStatus,
  SiteTransferStatus,
  DeploymentStatus,
} from "@prisma/client";

async function getCurrentWorkspaceId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const activeSession = await prisma.session.findFirst({
    where: {
      userId: session.user.id,
      activeWorkspaceId: {
        not: null,
      },
    },
    select: {
      activeWorkspaceId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (activeSession?.activeWorkspaceId) {
    return activeSession.activeWorkspaceId;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      defaultWorkspaceId: true,
    },
  });

  return user?.defaultWorkspaceId || null;
}

export type DashboardStats = {
  activeSites: number;
  teamMembers: number;
  liveSites: number;
  activeSessions: number;
  pendingTransfers: number;
};

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

  const [
    activeSites,
    teamMembers,
    liveSites,
    activeSessions,
    pendingTransfers,
  ] = await Promise.all([
    prisma.site.count({
      where: {
        workspaceId,
        status: {
          not: SiteStatus.ARCHIVED,
        },
      },
    }),
    prisma.workspaceMember.count({
      where: {
        workspaceId,
      },
    }),
    prisma.site.count({
      where: {
        workspaceId,
        status: SiteStatus.LIVE,
      },
    }),
    prisma.builderSession.count({
      where: {
        workspaceId,
        status: BuilderSessionStatus.ACTIVE,
      },
    }),
    prisma.siteTransfer.count({
      where: {
        toWorkspaceId: workspaceId,
        status: SiteTransferStatus.PENDING,
      },
    }),
  ]);

  return {
    activeSites,
    teamMembers,
    liveSites,
    activeSessions,
    pendingTransfers,
  };
}

export type RecentProject = {
  id: string;
  name: string;
  slug: string;
  status: SiteStatus;
  updatedAt: Date;
  client: {
    id: string;
    name: string;
  } | null;
  activeVersion: {
    id: string;
    number: number;
    label: string | null;
  } | null;
  _count: {
    versions: number;
  };
};

export async function getRecentProjects(
  limit: number = 6
): Promise<RecentProject[]> {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const projects = await prisma.site.findMany({
    where: {
      workspaceId,
      status: {
        not: SiteStatus.ARCHIVED,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      activeVersion: {
        select: {
          id: true,
          number: true,
          label: true,
        },
      },
      _count: {
        select: {
          versions: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  });

  return projects;
}

export type PendingAction = {
  type: "transfer" | "deployment" | "invitation";
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  metadata?: Record<string, any>;
};

export async function getPendingActions(): Promise<PendingAction[]> {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const [pendingTransfers, failedDeployments, pendingInvitations] =
    await Promise.all([
      prisma.siteTransfer.findMany({
        where: {
          toWorkspaceId: workspaceId,
          status: SiteTransferStatus.PENDING,
        },
        include: {
          site: {
            select: {
              name: true,
            },
          },
          fromWorkspace: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          initiatedAt: "desc",
        },
        take: 5,
      }),
      prisma.siteDeployment.findMany({
        where: {
          environment: {
            site: {
              workspaceId,
            },
          },
          status: DeploymentStatus.FAILED,
        },
        include: {
          environment: {
            select: {
              name: true,
              site: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          requestedAt: "desc",
        },
        take: 5,
      }),
      prisma.workspaceInvitation.findMany({
        where: {
          workspaceId,
          acceptedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

  const actions: PendingAction[] = [];

  pendingTransfers.forEach((transfer) => {
    actions.push({
      type: "transfer",
      id: transfer.id,
      title: "Site Transfer Request",
      description: `${transfer.fromWorkspace.name} wants to transfer "${transfer.site.name}" to your workspace`,
      createdAt: transfer.initiatedAt,
      metadata: {
        siteId: transfer.siteId,
        fromWorkspaceName: transfer.fromWorkspace.name,
      },
    });
  });

  failedDeployments.forEach((deployment) => {
    actions.push({
      type: "deployment",
      id: deployment.id,
      title: "Deployment Failed",
      description: `${deployment.environment.site.name} - ${deployment.environment.name}`,
      createdAt: deployment.requestedAt,
      metadata: {
        url: deployment.url,
      },
    });
  });

  pendingInvitations.forEach((invitation) => {
    actions.push({
      type: "invitation",
      id: invitation.id,
      title: "Pending Invitation",
      description: `Invitation sent to ${invitation.email}`,
      createdAt: invitation.createdAt,
      metadata: {
        email: invitation.email,
        role: invitation.role,
      },
    });
  });

  return actions.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export type ActivityItem = {
  id: string;
  type:
    | "site_created"
    | "site_deployed"
    | "version_created"
    | "session_completed"
    | "member_joined"
    | "transfer_completed";
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string | null;
    email: string;
  } | null;
  metadata?: Record<string, any>;
};

export async function getActivityFeed(limit: number = 10): Promise<ActivityItem[]> {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const [recentSites, recentDeployments, recentSessions, recentMembers] =
    await Promise.all([
      prisma.site.findMany({
        where: { workspaceId },
        select: {
          id: true,
          name: true,
          createdAt: true,
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.siteDeployment.findMany({
        where: {
          environment: {
            site: { workspaceId },
          },
          status: DeploymentStatus.READY,
        },
        select: {
          id: true,
          completedAt: true,
          environment: {
            select: {
              name: true,
              type: true,
              site: {
                select: {
                  name: true,
                },
              },
            },
          },
          triggeredBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
      prisma.builderSession.findMany({
        where: {
          workspaceId,
          status: BuilderSessionStatus.COMPLETED,
        },
        select: {
          id: true,
          endedAt: true,
          promptSummary: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          site: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { endedAt: "desc" },
        take: 5,
      }),
      prisma.workspaceMember.findMany({
        where: { workspaceId },
        select: {
          joinedAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { joinedAt: "desc" },
        take: 5,
      }),
    ]);

  const activities: ActivityItem[] = [];

  recentSites.forEach((site) => {
    activities.push({
      id: `site-${site.id}`,
      type: "site_created",
      title: "Site Created",
      description: `"${site.name}" was created`,
      timestamp: site.createdAt,
      user: site.createdBy,
    });
  });

  recentDeployments.forEach((deployment) => {
    activities.push({
      id: `deploy-${deployment.id}`,
      type: "site_deployed",
      title: "Site Deployed",
      description: `"${deployment.environment.site.name}" deployed to ${deployment.environment.name}`,
      timestamp: deployment.completedAt || new Date(),
      user: deployment.triggeredBy,
      metadata: {
        environment: deployment.environment.type,
      },
    });
  });

  recentSessions.forEach((session) => {
    activities.push({
      id: `session-${session.id}`,
      type: "session_completed",
      title: "Builder Session Completed",
      description: session.site
        ? `Built "${session.site.name}"`
        : session.promptSummary || "Builder session completed",
      timestamp: session.endedAt || new Date(),
      user: session.user,
    });
  });

  recentMembers.forEach((member) => {
    activities.push({
      id: `member-${member.user.email}`,
      type: "member_joined",
      title: "Team Member Joined",
      description: `${member.user.name || member.user.email} joined the workspace`,
      timestamp: member.joinedAt,
      user: member.user,
    });
  });

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export type ActiveSession = {
  id: string;
  startedAt: Date;
  promptSummary: string | null;
  site: {
    id: string;
    name: string;
  } | null;
  user: {
    name: string | null;
    email: string;
  } | null;
};

export async function getActiveBuilderSessions(): Promise<ActiveSession[]> {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const sessions = await prisma.builderSession.findMany({
    where: {
      workspaceId,
      status: BuilderSessionStatus.ACTIVE,
    },
    select: {
      id: true,
      startedAt: true,
      promptSummary: true,
      site: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });

  return sessions;
}
