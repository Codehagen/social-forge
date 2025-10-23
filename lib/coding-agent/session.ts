import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

type WorkspaceContext = {
  userId: string;
  workspaceId: string;
};

/**
 * Get the server session for the coding agent
 * This is a wrapper around the main auth session
 */
export async function getServerSession() {
  const headersList = await headers()
  return await auth.api.getSession({
    headers: headersList,
  })
}

/**
 * Resolve workspace context for the current user
 */
export async function resolveWorkspaceContext(
  workspaceId?: string
): Promise<WorkspaceContext> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  let targetWorkspaceId = workspaceId ?? null;

  if (!targetWorkspaceId) {
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
    targetWorkspaceId = activeSession?.activeWorkspaceId ?? null;
  }

  if (!targetWorkspaceId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        workspaceId: true,
      },
      orderBy: {
        joinedAt: "asc",
      },
    });
    targetWorkspaceId = membership?.workspaceId ?? null;
  }

  if (!targetWorkspaceId) {
    throw new Error("Workspace not found");
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: targetWorkspaceId,
      },
    },
  });

  if (!membership) {
    throw new Error("Not a member of this workspace");
  }

  return {
    userId: session.user.id,
    workspaceId: targetWorkspaceId,
  };
}