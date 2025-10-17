import { NextRequest, NextResponse } from "next/server";
import { getCodingAgentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Zod schemas for validation
const createTaskSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  repoUrl: z.string().url().optional(),
  selectedAgent: z.enum(["claude", "openai", "cursor", "gemini", "opencode"]).default("claude"),
  selectedModel: z.string().optional(),
  installDependencies: z.boolean().default(false),
  maxDuration: z.number().default(300),
  keepAlive: z.boolean().default(false),
});

// GET /api/builder - List user's coding tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getCodingAgentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = { userId: session.userId };
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const tasks = await prisma.codingTask.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        prompt: true,
        agent: true,
        status: true,
        progress: true,
        logs: true,
        error: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
      },
    });

    const total = await prisma.codingTask.count({ where });

    return NextResponse.json({
      tasks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/builder - Create a new coding task
// Note: This is a simplified version that delegates to coding-agent-template
export async function POST(request: NextRequest) {
  try {
    const session = await getCodingAgentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Create the task in Prisma
    const task = await prisma.codingTask.create({
      data: {
        userId: session.userId,
        prompt: validatedData.prompt,
        repoUrl: validatedData.repoUrl,
        agent: validatedData.selectedAgent,
        model: validatedData.selectedModel,
        installDependencies: validatedData.installDependencies,
        maxDuration: validatedData.maxDuration,
        keepAlive: validatedData.keepAlive,
        status: "PENDING",
        progress: 0,
      },
      select: {
        id: true,
        prompt: true,
        agent: true,
        status: true,
        progress: true,
        createdAt: true,
      },
    });

    // TODO: Delegate task processing to coding-agent-template via API call or shared service
    // For now, just mark as processing and return
    await prisma.codingTask.update({
      where: { id: task.id },
      data: {
        status: "PROCESSING",
        logs: [{ type: "info", message: "Task queued for processing" }],
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
