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
    const { operation, sourceFile, targetPath } = await request.json();

    if (!operation || !sourceFile) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
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
      return NextResponse.json({ success: false, error: "Sandbox not found" }, { status: 404 });
    }

    const baseName = sourceFile.split("/").pop() ?? sourceFile;
    const destination = targetPath ? `${targetPath.replace(/\/$/, "")}/${baseName}` : baseName;

    if (operation === "copy") {
      const result = await sandbox.runCommand("cp", ["-r", sourceFile, destination]);
      if (result.exitCode !== 0) {
        const stderr = await result.stderr();
        console.error("Failed to copy file:", stderr);
        return NextResponse.json({ success: false, error: "Failed to copy file" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "File copied successfully" });
    }

    if (operation === "cut") {
      const result = await sandbox.runCommand("mv", [sourceFile, destination]);
      if (result.exitCode !== 0) {
        const stderr = await result.stderr();
        console.error("Failed to move file:", stderr);
        return NextResponse.json({ success: false, error: "Failed to move file" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "File moved successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid operation" }, { status: 400 });
  } catch (error) {
    console.error("Error performing file operation:", error);
    return NextResponse.json({ success: false, error: "Failed to perform file operation" }, { status: 500 });
  }
}
