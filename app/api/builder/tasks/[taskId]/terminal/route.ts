"use server";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const { command } = await request.json();

    if (!command || typeof command !== "string") {
      return NextResponse.json({ success: false, error: "Command is required" }, { status: 400 });
    }

    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    if (!task.sandboxId) {
      return NextResponse.json({ success: false, error: "No sandbox found for this task" }, { status: 400 });
    }

    const sandbox = await resolveSandbox(taskId, task.sandboxId);
    if (!sandbox) {
      return NextResponse.json({ success: false, error: "Sandbox not available" }, { status: 400 });
    }

    const result = await sandbox.runCommand("sh", ["-c", command]);

    let stdout = "";
    let stderr = "";

    try {
      stdout = await result.stdout();
    } catch {
      // ignore
    }

    try {
      stderr = await result.stderr();
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      data: {
        exitCode: result.exitCode,
        stdout,
        stderr,
      },
    });
  } catch (error) {
    console.error("Error executing terminal command:", error);
    return NextResponse.json({ success: false, error: "Command execution failed" }, { status: 500 });
  }
}
