import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getOctokit } from "@/lib/coding-agent/github";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { owner, repo } = body;

    if (!owner || !repo) {
      return NextResponse.json({ error: "Owner and repo are required" }, { status: 400 });
    }

    // Star the repository
    await octokit.rest.activity.starRepoForAuthenticatedUser({
      owner,
      repo,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to star GitHub repository", error);
    
    if (error.status === 404) {
      return NextResponse.json({ 
        error: "Repository not found" 
      }, { status: 404 });
    }
    
    if (error.status === 403) {
      return NextResponse.json({ 
        error: "Insufficient permissions to star repository" 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      error: "Failed to star GitHub repository" 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { owner, repo } = body;

    if (!owner || !repo) {
      return NextResponse.json({ error: "Owner and repo are required" }, { status: 400 });
    }

    // Unstar the repository
    await octokit.rest.activity.unstarRepoForAuthenticatedUser({
      owner,
      repo,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to unstar GitHub repository", error);
    
    if (error.status === 404) {
      return NextResponse.json({ 
        error: "Repository not found" 
      }, { status: 404 });
    }
    
    if (error.status === 403) {
      return NextResponse.json({ 
        error: "Insufficient permissions to unstar repository" 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      error: "Failed to unstar GitHub repository" 
    }, { status: 500 });
  }
}