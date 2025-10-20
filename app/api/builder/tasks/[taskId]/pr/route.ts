"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/coding-agent/session";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { createPullRequest } from "@/lib/coding-agent/github";

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const { title, body, baseBranch } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.repoUrl || !task.branchName) {
      return NextResponse.json({ error: "Task does not have branch information" }, { status: 400 });
    }

    const result = await createPullRequest({
      repoUrl: task.repoUrl,
      branchName: task.branchName,
      title,
      body,
      baseBranch,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Failed to create pull request" }, { status: 500 });
    }

    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        prUrl: result.prUrl ?? null,
        prNumber: result.prNumber ?? null,
        prStatus: result.prNumber ? "OPEN" : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error creating pull request:", error);
    return NextResponse.json({ error: "Failed to create pull request" }, { status: 500 });
  }
}
