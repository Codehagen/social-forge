"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { getOctokit, parseGitHubUrl } from "@/lib/coding-agent/github";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    if (!task.branchName || !task.repoUrl) {
      return NextResponse.json({ success: false, error: "Task does not have a branch" }, { status: 400 });
    }

    const parsed = parseGitHubUrl(task.repoUrl);
    if (!parsed) {
      return NextResponse.json({ success: false, error: "Invalid repository URL" }, { status: 400 });
    }

    const octokit = await getOctokit();
    if (!octokit.auth) {
      return NextResponse.json({ success: false, error: "GitHub authentication required" }, { status: 401 });
    }

    const { owner, repo } = parsed;
    const branch = await octokit.rest.repos.getBranch({ owner, repo, branch: task.branchName }).catch((error) => {
      if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 404) {
        return null;
      }
      throw error;
    });

    if (!branch) {
      return NextResponse.json({ success: true, checkRuns: [] });
    }

    const ref = branch.data.commit.sha;
    const checkRuns = await octokit.rest.checks.listForRef({ owner, repo, ref });

    return NextResponse.json({
      success: true,
      checkRuns: checkRuns.data.check_runs.map((run) => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        html_url: run.html_url,
        started_at: run.started_at,
        completed_at: run.completed_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching check runs:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch check runs" }, { status: 500 });
  }
}
