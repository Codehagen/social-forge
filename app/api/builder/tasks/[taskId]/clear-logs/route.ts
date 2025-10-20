"use server";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/coding-agent/session";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";

export async function POST(_request: Request, { params }: { params: Promise<{ taskId: string }> }) {
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

    await prisma.builderTask.update({
      where: { id: task.id },
      data: { logs: [], updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Logs cleared successfully" });
  } catch (error) {
    console.error("Error clearing logs:", error);
    return NextResponse.json({ success: false, error: "Failed to clear logs" }, { status: 500 });
  }
}
