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
    const { commitMessage } = await request.json().catch(() => ({}));

    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    if (!task.sandboxId) {
      return NextResponse.json({ success: false, error: "Sandbox not available" }, { status: 400 });
    }

    if (!task.branchName) {
      return NextResponse.json({ success: false, error: "Branch not available" }, { status: 400 });
    }

    const sandbox = await resolveSandbox(taskId, task.sandboxId);
    if (!sandbox) {
      return NextResponse.json({ success: false, error: "Sandbox not found or inactive" }, { status: 400 });
    }

    const statusResult = await sandbox.runCommand("git", ["status", "--porcelain"]);
    if (statusResult.exitCode !== 0) {
      const stderr = await statusResult.stderr();
      console.error("Failed to check status:", stderr);
      return NextResponse.json({ success: false, error: "Failed to check status" }, { status: 500 });
    }

    const statusOutput = await statusResult.stdout();
    const hasChanges = statusOutput.trim().length > 0;

    if (hasChanges) {
      const addResult = await sandbox.runCommand("git", ["add", "."]);
      if (addResult.exitCode !== 0) {
        const stderr = await addResult.stderr();
        console.error("Failed to add changes:", stderr);
        return NextResponse.json({ success: false, error: "Failed to stage changes" }, { status: 500 });
      }

      const message = commitMessage || "Checkpoint before reset";
      const commitResult = await sandbox.runCommand("git", ["commit", "-m", message]);
      if (commitResult.exitCode !== 0) {
        const stderr = await commitResult.stderr();
        console.error("Failed to commit changes:", stderr);
        return NextResponse.json({ success: false, error: "Failed to commit changes" }, { status: 500 });
      }
    }

    const lsRemoteResult = await sandbox.runCommand("git", ["ls-remote", "--heads", "origin", task.branchName]);
    let resetTarget = "HEAD";

    if (lsRemoteResult.exitCode === 0) {
      const lsRemoteOutput = await lsRemoteResult.stdout();
      if (lsRemoteOutput.trim()) {
        const fetchResult = await sandbox.runCommand("git", ["fetch", "origin", task.branchName]);
        if (fetchResult.exitCode !== 0) {
          const stderr = await fetchResult.stderr();
          console.error("Failed to fetch from remote:", stderr);
          return NextResponse.json({ success: false, error: "Failed to fetch from remote" }, { status: 500 });
        }
        resetTarget = "FETCH_HEAD";
      }
    }

    const resetResult = await sandbox.runCommand("git", ["reset", "--hard", resetTarget]);
    if (resetResult.exitCode !== 0) {
      const stderr = await resetResult.stderr();
      console.error("Failed to reset:", stderr);
      return NextResponse.json({ success: false, error: "Failed to reset changes" }, { status: 500 });
    }

    const cleanResult = await sandbox.runCommand("git", ["clean", "-fd"]);
    if (cleanResult.exitCode !== 0) {
      const stderr = await cleanResult.stderr();
      console.warn("Failed to clean untracked files:", stderr);
    }

    return NextResponse.json({
      success: true,
      message: "Changes reset successfully",
      hadLocalChanges: hasChanges,
    });
  } catch (error) {
    console.error("Error resetting changes:", error);
    return NextResponse.json({ success: false, error: "An error occurred while resetting changes" }, { status: 500 });
  }
}
