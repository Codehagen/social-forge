"use server";

import { NextRequest, NextResponse, after } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import { listBuilderTasks, createBuilderTask, updateBuilderTask } from "@/lib/coding-agent/task-service";
import { CreateTaskRequestSchema } from "@/lib/coding-agent/task-schema";
import { checkRateLimit } from "@/lib/coding-agent/rate-limit";
import { runBuilderTask } from "@/lib/coding-agent/task-runner";
import { BuilderAgent } from "@prisma/client";
import { createTaskLogger } from "@/lib/coding-agent/task-logger";
import { generateBranchName, createFallbackBranchName } from "@/lib/coding-agent/branch-names";

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

    let newTask = await createBuilderTask(session.user.id, parsed.data);

    after(async () => {
      const logger = createTaskLogger(newTask.id);
      let taskForExecution = newTask;

      if (!taskForExecution.branchName) {
        let branchName: string | null = null;

        try {
          if (!process.env.AI_GATEWAY_API_KEY) {
            throw new Error("AI branch naming disabled");
          }

          await logger.info("Generating AI-powered branch name…");
          const repoName = extractRepoName(parsed.data.repoUrl);
          branchName = await generateBranchName({
            description: parsed.data.prompt,
            repoName: repoName ?? undefined,
            context: `${taskForExecution.selectedAgent} agent task`,
          });
          await logger.success("Generated AI branch name");
        } catch (error) {
          const fallback = createFallbackBranchName(taskForExecution.id);
          branchName = fallback;
          await logger.info("Using fallback branch name");
          if (error instanceof Error && error.message !== "AI branch naming disabled") {
            console.error("Failed to generate AI branch name:", error);
          }
        }

        if (branchName) {
          try {
            taskForExecution = await updateBuilderTask(taskForExecution.id, { branchName });
          } catch (updateError) {
            console.error("Failed to persist branch name:", updateError);
            taskForExecution = { ...taskForExecution, branchName };
          }
        }
      }

      try {
        await runBuilderTask({
          task: taskForExecution,
          prompt: parsed.data.prompt,
          repoUrl: parsed.data.repoUrl,
          selectedAgent: taskForExecution.selectedAgent ?? BuilderAgent.CLAUDE,
          selectedModel: parsed.data.selectedModel,
          installDependencies: parsed.data.installDependencies ?? false,
          maxDuration: parsed.data.maxDuration ?? taskForExecution.maxDuration,
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

function extractRepoName(repoUrl?: string | null) {
  if (!repoUrl) return null;
  try {
    const url = new URL(repoUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return parts[parts.length - 1].replace(/\.git$/, "");
    }
  } catch {
    // ignore parse errors
  }
  return null;
}
