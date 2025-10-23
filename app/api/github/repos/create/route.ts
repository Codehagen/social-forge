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
    const { name, description, private: isPrivate, orgName, autoInit = false } = body;

    if (!name) {
      return NextResponse.json({ error: "Repository name is required" }, { status: 400 });
    }

    const repoData: any = {
      name,
      description: description || "",
      private: isPrivate || false,
      auto_init: autoInit,
    };

    let result;
    if (orgName) {
      // Create repository in organization
      result = await octokit.rest.repos.createInOrg({
        org: orgName,
        ...repoData,
      });
    } else {
      // Create repository in user's account
      result = await octokit.rest.repos.createForAuthenticatedUser(repoData);
    }

    const { data: repo } = result;

    return NextResponse.json({
      success: true,
      repo: {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        sshUrl: repo.ssh_url,
        defaultBranch: repo.default_branch,
        owner: {
          login: repo.owner.login,
          type: repo.owner.type,
        },
      },
    });
  } catch (error: any) {
    console.error("Failed to create GitHub repository", error);
    
    if (error.status === 422) {
      return NextResponse.json({ 
        error: "Repository creation failed: Invalid data or repository already exists" 
      }, { status: 422 });
    }
    
    if (error.status === 403) {
      return NextResponse.json({ 
        error: "Repository creation failed: Insufficient permissions" 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      error: "Failed to create GitHub repository" 
    }, { status: 500 });
  }
}
