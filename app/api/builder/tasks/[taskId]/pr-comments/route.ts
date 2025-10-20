"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { getOctokit, parseGitHubUrl } from "@/lib/coding-agent/github";

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

    if (!task.repoUrl || !task.prNumber) {
      return NextResponse.json({ success: false, error: "Task does not have a pull request" }, { status: 400 });
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
    const comments = await octokit.rest.pulls.listReviewComments({
      owner,
      repo,
      pull_number: task.prNumber,
      per_page: 100,
    });

    return NextResponse.json({
      success: true,
      comments: comments.data.map((comment) => ({
        id: comment.id,
        user: {
          login: comment.user?.login ?? "unknown",
          avatar_url: comment.user?.avatar_url ?? null,
        },
        body: comment.body ?? "",
        created_at: comment.created_at,
        html_url: comment.html_url,
      })),
    });
  } catch (error) {
    console.error("Error fetching PR comments:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch PR comments" }, { status: 500 });
  }
}
