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

    const { data: orgs } = await octokit.rest.orgs.listForAuthenticatedUser({
      per_page: 100,
    });

    return NextResponse.json({
      orgs: orgs.map((org) => ({
        id: org.id,
        login: org.login,
        name: org.name,
        avatarUrl: org.avatar_url,
        htmlUrl: org.html_url,
        description: org.description,
        type: org.type,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch GitHub organizations", error);
    return NextResponse.json({ error: "Failed to fetch GitHub organizations" }, { status: 500 });
  }
}