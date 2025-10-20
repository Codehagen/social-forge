import { NextResponse } from "next/server";
import { getUserGitHubToken } from "@/lib/github/user-token";
import { getOctokit } from "@/lib/coding-agent/github";

export async function GET() {
  try {
    const token = await getUserGitHubToken();
    if (!token) {
      return NextResponse.json({ error: "GitHub account not connected" }, { status: 401 });
    }

    const octokit = await getOctokit();
    const { data } = await octokit.rest.users.getAuthenticated();

    return NextResponse.json({
      login: data.login,
      name: data.name,
      avatarUrl: data.avatar_url,
      htmlUrl: data.html_url,
    });
  } catch (error) {
    console.error("Failed to fetch GitHub user", error);
    return NextResponse.json({ error: "Failed to fetch GitHub user" }, { status: 500 });
  }
}
