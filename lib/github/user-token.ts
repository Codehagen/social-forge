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
      return process.env.GITHUB_PERSONAL_ACCESS_TOKEN ?? process.env.GITHUB_TOKEN ?? null;
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

    if (account?.accessToken) {
      return account.accessToken;
    }

    return process.env.GITHUB_PERSONAL_ACCESS_TOKEN ?? process.env.GITHUB_TOKEN ?? null;
  } catch (error) {
    console.warn("Failed to fetch GitHub token", error);
    return process.env.GITHUB_PERSONAL_ACCESS_TOKEN ?? process.env.GITHUB_TOKEN ?? null;
  }
}
