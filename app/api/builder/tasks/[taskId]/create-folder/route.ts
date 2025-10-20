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
    const { foldername } = await request.json();

    if (!foldername || typeof foldername !== "string") {
      return NextResponse.json({ success: false, error: "Folder name is required" }, { status: 400 });
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

    const mkdirResult = await sandbox.runCommand("mkdir", ["-p", foldername]);
    if (mkdirResult.exitCode !== 0) {
      const stderr = await mkdirResult.stderr();
      console.error("Failed to create folder:", stderr);
      return NextResponse.json({ success: false, error: "Failed to create folder" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Folder created successfully",
      foldername,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ success: false, error: "An error occurred while creating the folder" }, { status: 500 });
  }
}
