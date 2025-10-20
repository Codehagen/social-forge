import { NextRequest, NextResponse } from "next/server";
import { getOctokit } from "@/lib/coding-agent/github";
import { getUserGitHubToken } from "@/lib/github/user-token";

export async function GET(request: NextRequest) {
  try {
    const token = await getUserGitHubToken();
    if (!token) {
      return NextResponse.json({ error: "GitHub account not connected" }, { status: 401 });
    }

    const url = new URL(request.url);
    const owner = url.searchParams.get("owner");
    if (!owner) {
      return NextResponse.json({ error: "Missing owner parameter" }, { status: 400 });
    }

    const octokit = await getOctokit();
    const authUser = await octokit.rest.users.getAuthenticated();
    const userLogin = authUser.data.login;

    let repos: Array<{
      name: string;
      full_name: string;
      description: string | null;
      private: boolean;
      clone_url: string;
      html_url: string;
      default_branch: string;
      updated_at: string;
    }> = [];

    if (owner.toLowerCase() === userLogin.toLowerCase()) {
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: 100,
        sort: "updated",
        visibility: "all",
      });
      repos = data.map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        clone_url: repo.clone_url,
        html_url: repo.html_url,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at ?? repo.pushed_at ?? repo.created_at ?? "",
      }));
    } else {
      try {
        const { data } = await octokit.rest.repos.listForOrg({
          org: owner,
          per_page: 100,
          sort: "updated",
          type: "all",
        });
        repos = data.map((repo) => ({
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          private: repo.private,
          clone_url: repo.clone_url,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
          updated_at: repo.updated_at ?? repo.pushed_at ?? repo.created_at ?? "",
        }));
      } catch (error) {
        console.warn(`Falling back to user repositories for owner ${owner}`, error);
        const { data } = await octokit.rest.repos.listForUser({
          username: owner,
          per_page: 100,
          sort: "updated",
          type: "all",
        });
        repos = data.map((repo) => ({
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          private: repo.private,
          clone_url: repo.clone_url,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
          updated_at: repo.updated_at ?? repo.pushed_at ?? repo.created_at ?? "",
        }));
      }
    }

    return NextResponse.json({ repos });
  } catch (error) {
    console.error("Failed to list GitHub repositories", error);
    return NextResponse.json({ error: "Failed to list GitHub repositories" }, { status: 500 });
  }
}
