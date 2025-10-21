"use server";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { getOctokit, parseGitHubUrl } from "@/lib/coding-agent/github";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";

type FileChange = {
  filename: string;
  status: "added" | "modified" | "deleted" | "renamed";
  additions: number;
  deletions: number;
  changes: number;
};

type FileTreeNode = {
  type: "file" | "directory";
  filename?: string;
  status?: string;
  additions?: number;
  deletions?: number;
  changes?: number;
  children?: Record<string, FileTreeNode>;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const mode = request.nextUrl.searchParams.get("mode") ?? "remote";

    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      const response = NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }

    if (!task.branchName) {
      return NextResponse.json({ success: true, files: [], fileTree: {}, branchName: null });
    }

    if (!task.repoUrl) {
      return NextResponse.json({ success: true, files: [], fileTree: {}, branchName: task.branchName });
    }

    if (mode === "local") {
      if (!task.sandboxId) {
        const response = NextResponse.json(
          {
            success: false,
            error: "Sandbox is not running",
          },
          { status: 410 }
        );
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
        return response;
      }

      const files = await getLocalChanges(taskId, task.sandboxId, task.branchName);
      return NextResponse.json({
        success: true,
        branchName: task.branchName,
        ...files,
      });
    }

    const octokit = await getOctokit();
    if (!octokit.auth) {
      return NextResponse.json(
        {
          success: false,
          error: "GitHub authentication required. Please connect your GitHub account to view files.",
        },
        { status: 401 }
      );
    }

    const parsed = parseGitHubUrl(task.repoUrl);
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid repository URL format",
        },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    if (mode === "remote" || mode === "all") {
      const { files, fileTree } = await getRemoteChanges(octokit, owner, repo, task.branchName);
      return NextResponse.json({
        success: true,
        files,
        fileTree,
        branchName: task.branchName,
      });
    }

    if (mode === "all-local") {
      const remote = await getRemoteChanges(octokit, owner, repo, task.branchName);
      const local = await getLocalChanges(taskId, task.sandboxId ?? null, task.branchName);

      return NextResponse.json({
        success: true,
        files: [...remote.files, ...local.files],
        fileTree: {
          ...remote.fileTree,
          ...local.fileTree,
        },
        branchName: task.branchName,
      });
    }

    return NextResponse.json({
      success: true,
      files: [],
      fileTree: {},
      branchName: task.branchName,
    });
  } catch (error) {
    console.error("Failed to list task files", error);
    return NextResponse.json({ success: false, error: "Failed to list files" }, { status: 500 });
  }
}

async function getLocalChanges(taskId: string, sandboxId: string | null, branchName: string) {
  if (!sandboxId) {
    return { files: [] as FileChange[], fileTree: {} as Record<string, FileTreeNode> };
  }

  const sandbox = await resolveSandbox(taskId, sandboxId);

  if (!sandbox) {
    return {
      files: [] as FileChange[],
      fileTree: {},
      message: "Sandbox not found",
    };
  }

  const statusResult = await sandbox.runCommand("git", ["status", "--porcelain"]);

  if (statusResult.exitCode !== 0) {
    return {
      files: [] as FileChange[],
      fileTree: {},
      message: "Failed to get local changes",
    };
  }

  const statusOutput = await statusResult.stdout();
  const statusLines = statusOutput
    .trim()
    .split("\n")
    .filter((line) => line.trim());

  const remoteBranchRef = `origin/${branchName}`;
  const compareCheck = await sandbox.runCommand("git", ["rev-parse", "--verify", remoteBranchRef]);
  const compareRef = compareCheck.exitCode === 0 ? remoteBranchRef : "HEAD";

  const diffStats: Record<string, { additions: number; deletions: number }> = {};
  const numstatResult = await sandbox.runCommand("git", ["diff", "--numstat", compareRef]);
  if (numstatResult.exitCode === 0) {
    const numstatOutput = await numstatResult.stdout();
    const numstatLines = numstatOutput
      .trim()
      .split("\n")
      .filter((line) => line.trim());

    for (const line of numstatLines) {
      const [addStr, delStr, filename] = line.split("\t");
      if (filename) {
        diffStats[filename] = {
          additions: Number.parseInt(addStr || "0", 10) || 0,
          deletions: Number.parseInt(delStr || "0", 10) || 0,
        };
      }
    }
  }

  const files: FileChange[] = [];
  const fileTree: Record<string, FileTreeNode> = {};

  const getStatus = (index: string, worktree: string) => {
    if (index === "A" || worktree === "A") return "added";
    if (index === "D" || worktree === "D") return "deleted";
    if (index === "R" || worktree === "R") return "renamed";
    return "modified";
  };

  const addToTree = (filename: string, info: FileChange) => {
    const parts = filename.split("/");
    let current: Record<string, FileTreeNode> = fileTree;

    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      if (!part) continue;

      if (!current[part]) {
        current[part] = {
          type: i === parts.length - 1 ? "file" : "directory",
          children: i === parts.length - 1 ? undefined : {},
        };
      }

      const node = current[part];
      if (i === parts.length - 1) {
        node.type = "file";
        node.filename = filename;
        node.status = info.status;
        node.additions = info.additions;
        node.deletions = info.deletions;
        node.changes = info.changes;
      } else if (!node.children) {
        node.children = {};
      }
      current = node.children ?? {};
    }
  };

  for (const line of statusLines) {
    const indexStatus = line.charAt(0);
    const worktreeStatus = line.charAt(1);
    let filename = line.substring(3).trim();

    if (filename.includes(" -> ")) {
      filename = filename.split(" -> ").pop() ?? filename;
    }

    const stats = diffStats[filename] ?? { additions: 0, deletions: 0 };
    const info: FileChange = {
      filename,
      status: getStatus(indexStatus, worktreeStatus) as FileChange["status"],
      additions: stats.additions,
      deletions: stats.deletions,
      changes: stats.additions + stats.deletions,
    };

    files.push(info);
    addToTree(filename, info);
  }

  return { files, fileTree };
}

async function getRemoteChanges(
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  owner: string,
  repo: string,
  branch: string
) {
  const baseBranch = await resolveBaseBranch(octokit, owner, repo);
  let compare;

  try {
    compare = await octokit.rest.repos.compareCommitsWithBasehead({
      owner,
      repo,
      basehead: `${baseBranch}...${branch}`,
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return {
        files: [] as FileChange[],
        fileTree: {} as Record<string, FileTreeNode>,
      };
    }
    throw error;
  }

  const files: FileChange[] = [];
  const fileTree: Record<string, FileTreeNode> = {};

  const addToTree = (filename: string, info: FileChange) => {
    const parts = filename.split("/");
    let current: Record<string, FileTreeNode> = fileTree;

    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      if (!part) continue;

      if (!current[part]) {
        current[part] = {
          type: i === parts.length - 1 ? "file" : "directory",
          children: i === parts.length - 1 ? undefined : {},
        };
      }

      const node = current[part];
      if (i === parts.length - 1) {
        node.type = "file";
        node.filename = filename;
        node.status = info.status;
        node.additions = info.additions;
        node.deletions = info.deletions;
        node.changes = info.changes;
      } else if (!node.children) {
        node.children = {};
      }
      current = node.children ?? {};
    }
  };

  for (const file of compare.data.files ?? []) {
    if (!file.filename) continue;
    const info: FileChange = {
      filename: file.filename,
      status: (file.status ?? "modified") as FileChange["status"],
      additions: file.additions ?? 0,
      deletions: file.deletions ?? 0,
      changes: file.changes ?? (file.additions ?? 0) + (file.deletions ?? 0),
    };
    files.push(info);
    addToTree(file.filename, info);
  }

  return { files, fileTree };
}

async function resolveBaseBranch(
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  owner: string,
  repo: string
): Promise<string> {
  try {
    const repoInfo = await octokit.rest.repos.get({ owner, repo });
    if (repoInfo?.data?.default_branch) {
      return repoInfo.data.default_branch;
    }
  } catch {
    // Fallback handled below.
  }

  return "main";
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  if ("status" in error && (error as { status?: number }).status === 404) {
    return true;
  }

  if ("code" in error && (error as { code?: string }).code === "NOT_FOUND") {
    return true;
  }

  return false;
}
