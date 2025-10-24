"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Server actions for client components
export async function switchWorkspaceAction(workspaceId: string) {
  try {
    await switchWorkspace(workspaceId);
    // Force a page reload to update the workspace context
    redirect("/dashboard");
  } catch (error) {
    console.error("Error switching workspace:", error);
    throw error;
  }
}

export async function getUserWorkspaces() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return [];
    }

    const workspaces = await prisma.workspaceMember.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        workspace: {
          createdAt: "desc",
        },
      },
    });

    return workspaces.map((member) => ({
      ...member.workspace,
      role: member.role,
      joinedAt: member.joinedAt,
    }));
  } catch (error) {
    console.error("Error fetching user workspaces:", error);
    return [];
  }
}

export async function getCurrentWorkspace() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return null;
    }

    // Check if there's an active workspace in the session
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        activeWorkspaceId: {
          not: null,
        },
      },
      include: {
        activeWorkspace: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (activeSession?.activeWorkspace) {
      return activeSession.activeWorkspace;
    }

    // If no active workspace, get user's default workspace
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        defaultWorkspace: true,
      },
    });

    if (user?.defaultWorkspace) {
      return user.defaultWorkspace;
    }

    // If no default workspace, get the first workspace the user is a member of
    const firstWorkspace = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return firstWorkspace?.workspace || null;
  } catch (error) {
    console.error("Error fetching current workspace:", error);
    return null;
  }
}

export async function createWorkspace(name: string, slug?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const workspaceSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-");

    // Check if slug is already taken
    const existingWorkspace = await prisma.workspace.findUnique({
      where: {
        slug: workspaceSlug,
      },
    });

    if (existingWorkspace) {
      throw new Error("Workspace slug already exists");
    }

    // Create workspace and add user as owner
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug: workspaceSlug,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Set as default workspace if user doesn't have one
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user?.defaultWorkspaceId) {
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          defaultWorkspaceId: workspace.id,
        },
      });
    }

    return workspace;
  } catch (error) {
    console.error("Error creating workspace:", error);
    throw error;
  }
}

export async function switchWorkspace(workspaceId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify user is a member of the workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new Error("Not a member of this workspace");
    }

    // Update the session's active workspace
    await prisma.session.updateMany({
      where: {
        userId: session.user.id,
      },
      data: {
        activeWorkspaceId: workspaceId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error switching workspace:", error);
    throw error;
  }
}
