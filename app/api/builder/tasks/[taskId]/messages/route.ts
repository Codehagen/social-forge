"use server";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";

type RouteParams = {
  params: {
    taskId: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.builderTask.findUnique({
      where: { id: params.taskId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const messages = await prisma.builderTaskMessage.findMany({
      where: { taskId: task.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to load task messages", error);
    return NextResponse.json({ error: "Failed to load task messages" }, { status: 500 });
  }
}
