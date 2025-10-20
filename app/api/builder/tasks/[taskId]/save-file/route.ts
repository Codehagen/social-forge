"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const { filename, content } = await request.json();

    if (!filename || content === undefined) {
      return NextResponse.json({ error: "Missing filename or content" }, { status: 400 });
    }

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

    const escapedFilename = `'${filename.replace(/'/g, "'\\''")}'`;
    const encodedContent = Buffer.from(content).toString("base64");
    const command = `echo '${encodedContent}' | base64 -d > ${escapedFilename}`;

    const result = await sandbox.runCommand("sh", ["-c", command]);
    if (result.exitCode !== 0) {
      let stderr = "";
      try {
        stderr = await result.stderr();
      } catch {
        // ignore
      }
      console.error("Failed to write file:", stderr);
      return NextResponse.json({ error: "Failed to write file to sandbox" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "File saved successfully" });
  } catch (error) {
    console.error("Error in save-file API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
