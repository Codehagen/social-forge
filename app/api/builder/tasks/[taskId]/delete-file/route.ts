"use server";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const { filename } = await request.json();

    if (!filename || typeof filename !== "string") {
      return NextResponse.json({ success: false, error: "Filename is required" }, { status: 400 });
    }

    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    if (!task.sandboxId) {
      return NextResponse.json({ success: false, error: "Sandbox not available" }, { status: 400 });
    }

    const sandbox = await resolveSandbox(taskId, task.sandboxId);
    if (!sandbox) {
      return NextResponse.json({ success: false, error: "Sandbox not found or inactive" }, { status: 400 });
    }

    const rmResult = await sandbox.runCommand("rm", [filename]);
    if (rmResult.exitCode !== 0) {
      const stderr = await rmResult.stderr();
      console.error("Failed to delete file:", stderr);
      return NextResponse.json({ success: false, error: "Failed to delete file" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      filename,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ success: false, error: "An error occurred while deleting the file" }, { status: 500 });
  }
}
