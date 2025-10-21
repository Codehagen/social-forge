import { NextRequest, NextResponse } from "next/server";
import { getOctokit } from "@/lib/coding-agent/github";
import { getUserGitHubOAuthToken } from "@/lib/github/user-token";

export async function GET(request: NextRequest) {
  try {
    const token = await getUserGitHubOAuthToken();
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

    // Fetch all repositories by paginating through all pages
    const allRepos: Array<{
      name: string;
      full_name: string;
      description: string | null;
      private: boolean;
      clone_url: string;
      html_url: string;
      default_branch: string;
      updated_at: string;
    }> = []

    let page = 1
    const perPage = 100 // GitHub's maximum per page

    while (true) {
      let apiUrl: string

      if (owner.toLowerCase() === userLogin.toLowerCase()) {
        // Use /user/repos for authenticated user to get private repos, but only owned repos
        apiUrl = `https://api.github.com/user/repos?sort=name&direction=asc&per_page=${perPage}&page=${page}&visibility=all&affiliation=owner`
      } else {
        // Check if it's an organization
        const orgResponse = await fetch(`https://api.github.com/orgs/${owner}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        })

        if (orgResponse.ok) {
          // Use /orgs/{org}/repos for organizations to get private repos
          apiUrl = `https://api.github.com/orgs/${owner}/repos?sort=name&direction=asc&per_page=${perPage}&page=${page}`
        } else {
          // Fallback to /users/{owner}/repos (public only)
          apiUrl = `https://api.github.com/users/${owner}/repos?sort=name&direction=asc&per_page=${perPage}&page=${page}`
        }
      }

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // No more pages or org/user not found
          break
        }
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const pageRepos = await response.json()

      if (pageRepos.length === 0) {
        // No more repos
        break
      }

      const mappedRepos = pageRepos.map((repo: any) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        clone_url: repo.clone_url,
        html_url: repo.html_url,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at ?? repo.pushed_at ?? repo.created_at ?? "",
      }))

      allRepos.push(...mappedRepos)

      // Check if we've got all repos (less than perPage means last page)
      if (pageRepos.length < perPage) {
        break
      }

      page++
    }

    repos = allRepos

    return NextResponse.json(repos);
  } catch (error) {
    console.error("Failed to list GitHub repositories", error);
    return NextResponse.json({ error: "Failed to list GitHub repositories" }, { status: 500 });
  }
}
