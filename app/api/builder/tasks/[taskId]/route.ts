"use server";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import { killSandbox, unregisterSandbox } from "@/lib/coding-agent/sandbox/sandbox-registry";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { taskId } = await context.params;
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.builderTask.findUnique({
      where: { id: taskId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Failed to fetch task", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await context.params;
    const task = await prisma.builderTask.findUnique({ where: { id: taskId } });

    if (!task || task.userId !== session.user.id || task.deletedAt) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    unregisterSandbox(task.id);

    if (task.sandboxId) {
      try {
        await killSandbox(task.id);
      } catch (error) {
        console.error("Failed to kill sandbox during task deletion", error);
      }
    }

    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        deletedAt: new Date(),
        sandboxId: null,
        sandboxUrl: null,
        keepAlive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
