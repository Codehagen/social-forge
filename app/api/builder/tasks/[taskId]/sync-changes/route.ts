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

    const addResult = await sandbox.runCommand("git", ["add", "."]);
    if (addResult.exitCode !== 0) {
      const stderr = await addResult.stderr();
      console.error("Failed to add changes:", stderr);
      return NextResponse.json({ success: false, error: "Failed to stage changes" }, { status: 500 });
    }

    const statusResult = await sandbox.runCommand("git", ["status", "--porcelain"]);
    if (statusResult.exitCode !== 0) {
      const stderr = await statusResult.stderr();
      console.error("Failed to check status:", stderr);
      return NextResponse.json({ success: false, error: "Failed to check status" }, { status: 500 });
    }

    const statusOutput = await statusResult.stdout();
    if (!statusOutput.trim()) {
      return NextResponse.json({
        success: true,
        message: "No changes to sync",
        committed: false,
        pushed: false,
      });
    }

    const message = commitMessage || "Sync local changes";
    const commitResult = await sandbox.runCommand("git", ["commit", "-m", message]);
    if (commitResult.exitCode !== 0) {
      const stderr = await commitResult.stderr();
      console.error("Failed to commit changes:", stderr);
      return NextResponse.json({ success: false, error: "Failed to commit changes" }, { status: 500 });
    }

    const pushResult = await sandbox.runCommand("git", ["push", "origin", task.branchName]);
    if (pushResult.exitCode !== 0) {
      const stderr = await pushResult.stderr();
      console.error("Failed to push changes:", stderr);
      return NextResponse.json({ success: false, error: "Failed to push changes" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Changes synced successfully",
      committed: true,
      pushed: true,
    });
  } catch (error) {
    console.error("Error syncing changes:", error);
    return NextResponse.json({ success: false, error: "An error occurred while syncing changes" }, { status: 500 });
  }
}
