"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/coding-agent/session";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { mergePullRequest } from "@/lib/coding-agent/github";

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const { mergeMethod, commitTitle, commitMessage } = await request.json();

    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.repoUrl || !task.prNumber) {
      return NextResponse.json({ error: "Task does not have a pull request" }, { status: 400 });
    }

    const result = await mergePullRequest({
      repoUrl: task.repoUrl,
      prNumber: task.prNumber,
      mergeMethod,
      commitTitle,
      commitMessage,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Failed to merge pull request" }, { status: 500 });
    }

    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        prStatus: result.merged ? "MERGED" : task.prStatus,
        prMergeCommitSha: result.sha ?? null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error merging pull request:", error);
    return NextResponse.json({ error: "Failed to merge pull request" }, { status: 500 });
  }
}
