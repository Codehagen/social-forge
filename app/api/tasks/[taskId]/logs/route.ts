import { NextRequest, NextResponse } from "next/server";
import { getCodingAgentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/tasks/[taskId]/logs - Get task logs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getCodingAgentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after");

    const task = await (prisma as any).codingTask.findFirst({
      where: {
        id: taskId,
        userId: session.userId,
      },
      select: {
        id: true,
        logs: true,
        status: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let logs = task.logs || [];

    // Filter logs after a specific timestamp if provided
    if (after) {
      const afterTime = new Date(after);
      logs = logs.filter((log: any) => new Date(log.timestamp || log.createdAt) > afterTime);
    }

    return NextResponse.json({
      logs,
      status: task.status,
    });
  } catch (error) {
    console.error("Error fetching task logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
