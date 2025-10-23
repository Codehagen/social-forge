import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getOctokit } from "@/lib/coding-agent/github";

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const octokit = await getOctokit();
    if (!octokit.auth) {
      return NextResponse.json({ error: "GitHub account not connected" }, { status: 401 });
    }

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
