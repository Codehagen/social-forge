"use server";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { killSandbox, unregisterSandbox } from "@/lib/coding-agent/sandbox/sandbox-registry";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await context.params;
    const task = await prisma.builderTask.findUnique({ where: { id: taskId } });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    unregisterSandbox(task.id);

    if (task.sandboxId) {
      await killSandbox(task.id);
    }

    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        sandboxId: null,
        sandboxUrl: null,
        keepAlive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to stop sandbox", error);
    return NextResponse.json({ error: "Failed to stop sandbox" }, { status: 500 });
  }
}
