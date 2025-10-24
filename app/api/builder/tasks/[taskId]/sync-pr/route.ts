"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { getPullRequestStatus } from "@/lib/coding-agent/github";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.repoUrl || !task.prNumber) {
      return NextResponse.json({ error: "Task does not have a pull request" }, { status: 400 });
    }

    const statusResult = await getPullRequestStatus(task.repoUrl, task.prNumber);
    if (!statusResult.success || !statusResult.status) {
      return NextResponse.json({ error: statusResult.error ?? "Failed to sync PR status" }, { status: 500 });
    }

    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        prStatus: statusResult.status,
        prMergeCommitSha: statusResult.mergeCommitSha ?? null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        status: statusResult.status,
        mergeCommitSha: statusResult.mergeCommitSha ?? null,
      },
    });
  } catch (error) {
    console.error("Error syncing PR status:", error);
    return NextResponse.json({ error: "Failed to sync PR status" }, { status: 500 });
  }
}
