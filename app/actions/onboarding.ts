"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail } from "./email";

export interface OnboardingData {
  role?: string;
  useCase?: string;
  discoverySource?: string;
  workspaceName: string;
  firstName?: string;
  businessName?: string;
  businessPhone?: string;
}

export async function completeOnboarding(data: OnboardingData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const workspaceSlug = data.workspaceName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    // Check if slug is already taken
    const existingWorkspace = await prisma.workspace.findUnique({
      where: {
        slug: workspaceSlug,
      },
    });

    if (existingWorkspace) {
      throw new Error("Workspace name already exists. Please choose another.");
    }

    // Create workspace and update user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create workspace
      const workspace = await tx.workspace.create({
        data: {
          name: data.workspaceName,
          slug: workspaceSlug,
          businessName: data.businessName || data.workspaceName,
          businessEmail: session.user.email,
          businessPhone: data.businessPhone || null,
          members: {
            create: {
              userId: session.user.id,
              role: "OWNER",
            },
          },
        },
      });

      // Update user with onboarding completion
      const user = await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          onboardingCompleted: true,
          ...(data.firstName && { name: data.firstName }),
          onboardingData: {
            ...(data.role && { role: data.role }),
            ...(data.useCase && { useCase: data.useCase }),
            ...(data.discoverySource && { discoverySource: data.discoverySource }),
            completedAt: new Date().toISOString(),
          },
          defaultWorkspaceId: workspace.id,
        },
      });

      return { workspace, user };
    });

    // Send welcome email after successful onboarding
    // Don't block the response if email fails
    sendWelcomeEmail(session.user.id).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

    return { success: true, workspace: result.workspace };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw error;
  }
}

export async function updateOnboardingData(data: Partial<OnboardingData>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get current onboarding data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingData: true },
    });

    const currentData = (user?.onboardingData ? (user.onboardingData as unknown as OnboardingData) : {}) as OnboardingData;

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        onboardingData: {
          ...currentData,
          ...data,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating onboarding data:", error);
    throw error;
  }
}
