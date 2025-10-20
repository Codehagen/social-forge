"use server";

import { getServerSession } from "@/lib/coding-agent/session";
import prisma from "@/lib/prisma";

const envFallback = () => process.env.GITHUB_PERSONAL_ACCESS_TOKEN ?? process.env.GITHUB_TOKEN ?? null;

export async function getGitHubTokenForUser(userId?: string | null): Promise<string | null> {
  if (!userId) {
    return envFallback();
  }

  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "github",
      },
      select: {
        accessToken: true,
      },
    });

    if (account?.accessToken) {
      return account.accessToken;
    }
  } catch (error) {
    console.warn("Failed to fetch GitHub token for user", error);
  }

  return envFallback();
}

export async function getUserGitHubToken(): Promise<string | null> {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id;
    return getGitHubTokenForUser(userId);
  } catch (error) {
    console.warn("Failed to resolve user GitHub token", error);
    return envFallback();
  }
}
