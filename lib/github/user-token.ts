"use server";

import { getServerSession } from "@/lib/coding-agent/session";
import prisma from "@/lib/prisma";

/**
 * Retrieve the GitHub OAuth access token for the signed-in user, if available.
 * Currently returns `null` because GitHub provider is not yet wired into Better Auth.
 * This placeholder keeps the Copilot agent happy without crashing the builder UI.
 */
export async function getUserGitHubToken(): Promise<string | null> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return null;
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "github",
      },
      select: {
        accessToken: true,
      },
    });

    return account?.accessToken ?? null;
  } catch (error) {
    console.warn("Failed to fetch GitHub token", error);
    return null;
  }
}
