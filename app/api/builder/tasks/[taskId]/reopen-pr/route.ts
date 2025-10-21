"use server";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { reopenPullRequest } from "@/lib/coding-agent/github";

export async function POST(_request: Request, { params }: { params: Promise<{ taskId: string }> }) {
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

    const result = await reopenPullRequest(task.repoUrl, task.prNumber);
    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Failed to reopen pull request" }, { status: 500 });
    }

    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        prStatus: "OPEN",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Pull request reopened successfully" });
  } catch (error) {
    console.error("Error reopening pull request:", error);
    return NextResponse.json({ error: "Failed to reopen pull request" }, { status: 500 });
  }
}
