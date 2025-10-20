"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json({ success: false, error: "Missing filename parameter" }, { status: 400 });
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

    const lsResult = await sandbox.runCommand("git", ["ls-files", filename]);
    const tracked = (await lsResult.stdout()).trim().length > 0;

    if (tracked) {
      const revert = await sandbox.runCommand("git", ["checkout", "HEAD", "--", filename]);
      if (revert.exitCode !== 0) {
        const stderr = await revert.stderr();
        console.error("Failed to discard changes:", stderr);
        return NextResponse.json({ success: false, error: "Failed to discard changes" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Changes discarded successfully" });
    }

    const remove = await sandbox.runCommand("rm", [filename]);
    if (remove.exitCode !== 0) {
      const stderr = await remove.stderr();
      console.error("Failed to delete file:", stderr);
      return NextResponse.json({ success: false, error: "Failed to delete file" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "New file deleted successfully" });
  } catch (error) {
    console.error("Error discarding file changes:", error);
    return NextResponse.json({ success: false, error: "An error occurred while discarding changes" }, { status: 500 });
  }
}
