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

    const parts = filename.split("/");
    if (parts.length > 1) {
      const dirPath = parts.slice(0, -1).join("/");
      const mkdirResult = await sandbox.runCommand("mkdir", ["-p", dirPath]);
      if (mkdirResult.exitCode !== 0) {
        const stderr = await mkdirResult.stderr();
        console.error("Failed to create parent directories:", stderr);
        return NextResponse.json({ success: false, error: "Failed to create parent directories" }, { status: 500 });
      }
    }

    const touchResult = await sandbox.runCommand("touch", [filename]);
    if (touchResult.exitCode !== 0) {
      const stderr = await touchResult.stderr();
      console.error("Failed to create file:", stderr);
      return NextResponse.json({ success: false, error: "Failed to create file" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "File created successfully",
      filename,
    });
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json({ success: false, error: "An error occurred while creating the file" }, { status: 500 });
  }
}
