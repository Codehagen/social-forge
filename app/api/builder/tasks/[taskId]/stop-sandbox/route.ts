"use server";

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import prisma from "@/lib/prisma";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";
import { unregisterSandbox } from "@/lib/coding-agent/sandbox/sandbox-registry";

export async function POST(_request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.sandboxId) {
      return NextResponse.json({ error: "Sandbox is not active" }, { status: 400 });
    }

    const sandbox = await resolveSandbox(taskId, task.sandboxId);
    if (sandbox) {
      try {
        await sandbox.stop();
      } catch (error) {
        console.warn("Failed to stop sandbox gracefully:", error);
      }
    }

    unregisterSandbox(taskId);

    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        sandboxId: null,
        sandboxUrl: null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Sandbox stopped successfully" });
  } catch (error) {
    console.error("Error stopping sandbox:", error);
    return NextResponse.json({ error: "Failed to stop sandbox" }, { status: 500 });
  }
}
