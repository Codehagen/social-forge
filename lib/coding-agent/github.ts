"use server";

import { Octokit } from "@octokit/rest";
import { getUserGitHubToken } from "@/lib/github/user-token";

export async function getOctokit(): Promise<Octokit> {
  const token = await getUserGitHubToken();

  if (!token) {
    console.warn("No GitHub token found for current user.");
  }

  return new Octokit({
    auth: token ?? undefined,
  });
}

export function parseGitHubUrl(repoUrl: string): { owner: string; repo: string } | null {
  try {
    const match = repoUrl.match(/github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?$/i);
    if (!match) {
      return null;
    }
    return {
      owner: match[1],
      repo: match[2],
    };
  } catch (error) {
    console.error("Failed to parse GitHub URL", error);
    return null;
  }
}

interface CreatePullRequestParams {
  repoUrl: string;
  branchName: string;
  title: string;
  body?: string;
  baseBranch?: string;
}

export async function createPullRequest({
  repoUrl,
  branchName,
  title,
  body = "",
  baseBranch = "main",
}: CreatePullRequestParams) {
  const octokit = await getOctokit();
  if (!octokit.auth) {
    return { success: false, error: "GitHub account not connected" } as const;
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return { success: false, error: "Invalid GitHub repository URL" } as const;
  }

  try {
    const response = await octokit.rest.pulls.create({
      owner: parsed.owner,
      repo: parsed.repo,
      title,
      body,
      head: branchName,
      base: baseBranch,
    });

    return {
      success: true,
      prUrl: response.data.html_url,
      prNumber: response.data.number,
    } as const;
  } catch (error: unknown) {
    console.error("Failed to create pull request", error);

    if (error && typeof error === "object" && "status" in error) {
      const status = (error as { status: number }).status;
      if (status === 422) {
        return { success: false, error: "Pull request already exists or branch missing" } as const;
      }
      if (status === 403) {
        return { success: false, error: "Permission denied. Check repository access." } as const;
      }
    }

    return { success: false, error: "Failed to create pull request" } as const;
  }
}

interface MergePullRequestParams {
  repoUrl: string;
  prNumber: number;
  mergeMethod?: "merge" | "squash" | "rebase";
  commitTitle?: string;
  commitMessage?: string;
}

export async function mergePullRequest({
  repoUrl,
  prNumber,
  mergeMethod = "squash",
  commitTitle,
  commitMessage,
}: MergePullRequestParams) {
  const octokit = await getOctokit();
  if (!octokit.auth) {
    return { success: false, error: "GitHub account not connected" } as const;
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return { success: false, error: "Invalid GitHub repository URL" } as const;
  }

  try {
    const response = await octokit.rest.pulls.merge({
      owner: parsed.owner,
      repo: parsed.repo,
      pull_number: prNumber,
      merge_method: mergeMethod,
      commit_title: commitTitle,
      commit_message: commitMessage,
    });

    return {
      success: true,
      merged: response.data.merged,
      message: response.data.message,
      sha: response.data.sha,
    } as const;
  } catch (error: unknown) {
    console.error("Failed to merge pull request", error);

    if (error && typeof error === "object" && "status" in error) {
      const status = (error as { status: number }).status;
      if (status === 405) {
        return { success: false, error: "Pull request is not mergeable" } as const;
      }
      if (status === 409) {
        return { success: false, error: "Merge conflict detected" } as const;
      }
    }

    return { success: false, error: "Failed to merge pull request" } as const;
  }
}

export async function closePullRequest(repoUrl: string, prNumber: number) {
  const octokit = await getOctokit();
  if (!octokit.auth) {
    return { success: false, error: "GitHub account not connected" } as const;
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return { success: false, error: "Invalid GitHub repository URL" } as const;
  }

  try {
    await octokit.rest.pulls.update({
      owner: parsed.owner,
      repo: parsed.repo,
      pull_number: prNumber,
      state: "closed",
    });

    return { success: true } as const;
  } catch (error) {
    console.error("Failed to close pull request", error);
    return { success: false, error: "Failed to close pull request" } as const;
  }
}

export async function reopenPullRequest(repoUrl: string, prNumber: number) {
  const octokit = await getOctokit();
  if (!octokit.auth) {
    return { success: false, error: "GitHub account not connected" } as const;
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return { success: false, error: "Invalid GitHub repository URL" } as const;
  }

  try {
    await octokit.rest.pulls.update({
      owner: parsed.owner,
      repo: parsed.repo,
      pull_number: prNumber,
      state: "open",
    });

    return { success: true } as const;
  } catch (error) {
    console.error("Failed to reopen pull request", error);
    return { success: false, error: "Failed to reopen pull request" } as const;
  }
}

export async function getPullRequestStatus(repoUrl: string, prNumber: number) {
  const octokit = await getOctokit();
  if (!octokit.auth) {
    return { success: false, error: "GitHub account not connected" } as const;
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return { success: false, error: "Invalid GitHub repository URL" } as const;
  }

  try {
    const response = await octokit.rest.pulls.get({
      owner: parsed.owner,
      repo: parsed.repo,
      pull_number: prNumber,
    });

    const status =
      response.data.merged_at !== null
        ? "MERGED"
        : response.data.state === "closed"
          ? "CLOSED"
          : "OPEN";

    return {
      success: true,
      status,
      mergeCommitSha: response.data.merge_commit_sha ?? undefined,
    } as const;
  } catch (error) {
    console.error("Failed to fetch pull request status", error);
    return { success: false, error: "Failed to fetch pull request status" } as const;
  }
}
