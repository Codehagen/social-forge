import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/coding-agent/session";
import { getUserGitHubToken } from "@/lib/github/user-token";
import { getOctokit } from "@/lib/coding-agent/github";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ connected: false });
    }

    const fallbackToken = await getUserGitHubToken();

    let account: { accessToken: string | null; updatedAt: Date } | null = null;

    if (session?.user?.id) {
      account = await prisma.account.findFirst({
        where: { userId: session.user.id, providerId: "github" },
        select: {
          accessToken: true,
          updatedAt: true,
        },
      });
    }

    const tokenSource = account?.accessToken ? "account" : fallbackToken ? "env" : null;

    if (!tokenSource) {
      return NextResponse.json({ connected: false });
    }

    let username: string | null = null;
    try {
      const octokit = await getOctokit();
      const userResponse = await octokit.rest.users.getAuthenticated();
      username = userResponse.data.login ?? null;
    } catch (error) {
      console.warn("Failed to fetch GitHub user information", error);
    }

    return NextResponse.json({
      connected: true,
      username,
      source: tokenSource,
      connectedAt: account?.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Failed to resolve GitHub connection status", error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
