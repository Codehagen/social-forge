import { NextResponse } from "next/server";
import { getOctokit } from "@/lib/coding-agent/github";
import { getUserGitHubToken } from "@/lib/github/user-token";

export async function GET() {
  try {
    const token = await getUserGitHubToken();
    if (!token) {
      return NextResponse.json({ error: "GitHub account not connected" }, { status: 401 });
    }

    const octokit = await getOctokit();
    const userResponse = await octokit.rest.users.getAuthenticated();

    const personalAccount = {
      login: userResponse.data.login,
      avatarUrl: userResponse.data.avatar_url,
      type: "User" as const,
    };

    let organizations: Array<{ login: string; avatarUrl: string | null; type: string }> = [];
    try {
      const { data } = await octokit.rest.orgs.listForAuthenticatedUser({ per_page: 100 });
      organizations = data.map((org) => ({
        login: org.login,
        avatarUrl: org.avatar_url,
        type: "Organization" as const,
      }));
    } catch (error) {
      console.warn("Failed to fetch GitHub organizations", error);
    }

    return NextResponse.json([personalAccount, ...organizations]);
  } catch (error) {
    console.error("Failed to list GitHub owners", error);
    return NextResponse.json({ error: "Failed to list GitHub owners" }, { status: 500 });
  }
}
