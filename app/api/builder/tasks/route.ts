"use server";

import { NextRequest, NextResponse, after } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import { listBuilderTasks, createBuilderTask } from "@/lib/coding-agent/task-service";
import { CreateTaskRequestSchema } from "@/lib/coding-agent/task-schema";
import { checkRateLimit } from "@/lib/coding-agent/rate-limit";
import { runBuilderTask } from "@/lib/coding-agent/task-runner";
import { BuilderAgent } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await listBuilderTasks(session.user.id);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You have reached the daily limit of ${rateLimit.total} messages. Limit resets at ${rateLimit.resetAt.toISOString()}`,
          remaining: rateLimit.remaining,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = CreateTaskRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const newTask = await createBuilderTask(session.user.id, parsed.data);

    after(async () => {
      try {
        await runBuilderTask({
          task: newTask,
          prompt: parsed.data.prompt,
          repoUrl: parsed.data.repoUrl,
          selectedAgent: newTask.selectedAgent ?? BuilderAgent.CLAUDE,
          selectedModel: parsed.data.selectedModel,
          installDependencies: parsed.data.installDependencies ?? false,
          maxDuration: parsed.data.maxDuration ?? newTask.maxDuration,
          keepAlive: parsed.data.keepAlive ?? false,
        });
      } catch (error) {
        console.error("Background task execution failed:", error);
      }
    });

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
