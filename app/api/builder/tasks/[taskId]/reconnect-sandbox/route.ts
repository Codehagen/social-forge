"use server";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Sandbox } from "@vercel/sandbox";
import { resolveSandboxCredentials } from "@/lib/coding-agent/sandbox/env";
import { registerSandbox } from "@/lib/coding-agent/sandbox/sandbox-registry";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await context.params;
    const body = await request.json();
    const { sandboxId } = body;

    if (!sandboxId) {
      return NextResponse.json({ error: "sandboxId is required" }, { status: 400 });
    }

    const task = await prisma.builderTask.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Try to reconnect to the sandbox
    const { token, teamId, projectId } = await resolveSandboxCredentials();
    if (!token || !teamId || !projectId) {
      return NextResponse.json({ error: "Missing Vercel sandbox credentials" }, { status: 500 });
    }

    const sandbox = await Sandbox.get({
      sandboxId,
      token,
      teamId,
      projectId,
    });

    // Test if sandbox is alive
    const ping = await sandbox.runCommand("echo", ["ok"]);
    if (ping.exitCode !== 0) {
      return NextResponse.json({ error: "Sandbox is not responding" }, { status: 400 });
    }

    // Get the sandbox URL
    const sandboxUrl = sandbox.domain(3000);

    // Register the sandbox
    registerSandbox(taskId, sandbox);

    // Update the task in the database
    await prisma.builderTask.update({
      where: { id: taskId },
      data: {
        sandboxId,
        sandboxUrl,
        keepAlive: true, // Enable keep-alive so it doesn't get cleaned up again
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      sandboxId,
      sandboxUrl,
      message: "Sandbox reconnected successfully",
    });
  } catch (error) {
    console.error("Error reconnecting sandbox:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reconnect sandbox" },
      { status: 500 }
    );
  }
}

