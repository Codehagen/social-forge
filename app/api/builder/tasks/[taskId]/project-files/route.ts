"use server";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
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

    if (!task.sandboxId) {
      return NextResponse.json({ error: "Task does not have an active sandbox" }, { status: 400 });
    }

    const sandbox = await resolveSandbox(taskId, task.sandboxId);
    if (!sandbox) {
      return NextResponse.json({ error: "Sandbox not available" }, { status: 400 });
    }

    // With the sandbox-backed LSP, we do not need to preload project files anymore.
    return NextResponse.json({ success: true, files: [] });
  } catch (error) {
    console.error("Error in project-files API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
