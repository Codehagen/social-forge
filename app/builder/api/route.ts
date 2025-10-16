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

    const tasks = await (prisma as any).codingTask.findMany({
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
        code: true,
        logs: true,
        error: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
      },
    });

    const total = await (prisma as any).codingTask.count({ where });

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
export async function POST(request: NextRequest) {
  try {
    const session = await getCodingAgentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Create the task
    const task = await (prisma as any).codingTask.create({
      data: {
        userId: session.userId,
        prompt: validatedData.prompt,
        agent: validatedData.selectedAgent,
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

    // Start background processing
    processCodingTask(task.id).catch(console.error);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Claude agent processing function
async function processCodingTask(taskId: string) {
  try {
    // Get task details
    const task = await (prisma as any).codingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    // Update task to processing
    await (prisma as any).codingTask.update({
      where: { id: taskId },
      data: {
        status: "PROCESSING",
        progress: 10,
        logs: [{ type: "info", message: "Starting code generation..." }],
      },
    });

    let generatedCode = "";
    let logs: any[] = [];

    if (task.agent === "claude") {
      const result = await processWithClaude(task.prompt);
      generatedCode = result.code;
      logs = result.logs;
    } else if (task.agent === "codex") {
      const result = await processWithOpenAI(task.prompt);
      generatedCode = result.code;
      logs = result.logs;
    } else if (task.agent === "gemini") {
      const result = await processWithGemini(task.prompt);
      generatedCode = result.code;
      logs = result.logs;
    } else {
      // Fallback for unsupported agents
      generatedCode = `// ${task.agent} processing for: ${task.prompt}
// TODO: Implement ${task.agent} integration
console.log("Task processed with ${task.agent}");
export const result = "Code generated";`;
      logs = [{ type: "info", message: `Processed with ${task.agent}` }];
    }

    // Update task as completed
    await (prisma as any).codingTask.update({
      where: { id: taskId },
      data: {
        status: "COMPLETED",
        progress: 100,
        code: generatedCode,
        logs,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error processing task:", error);
    await (prisma as any).codingTask.update({
      where: { id: taskId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Processing failed",
        logs: [{ type: "error", message: error instanceof Error ? error.message : "Processing failed" }],
      },
    });
  }
}

// Claude integration using AI SDK
async function processWithClaude(prompt: string): Promise<{ code: string; logs: any[] }> {
  try {
    const logs = [{ type: "info", message: "Initializing Claude..." }];

    // Import dynamically to avoid issues if Claude key not set
    const { generateText } = await import("ai");
    const { createAnthropic } = await import("@ai-sdk/anthropic");

    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });

    logs.push({ type: "info", message: "Sending request to Claude..." });

    const systemPrompt = `You are an expert software developer. Generate clean, well-documented code based on the user's request.
    Provide only the code without explanations, unless specifically asked for documentation.
    Use modern JavaScript/TypeScript best practices.
    Include appropriate imports and exports.`;

    const result = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      system: systemPrompt,
      prompt: `Generate code for: ${prompt}`,
    });

    logs.push({ type: "success", message: "Code generated successfully" });

    return {
      code: result.text,
      logs,
    };
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error("Failed to generate code with Claude");
  }
}

// OpenAI integration using AI SDK
async function processWithOpenAI(prompt: string): Promise<{ code: string; logs: any[] }> {
  try {
    const logs = [{ type: "info", message: "Initializing OpenAI..." }];

    const { generateText } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });

    logs.push({ type: "info", message: "Sending request to OpenAI..." });

    const systemPrompt = `You are an expert software developer. Generate clean, well-documented code based on the user's request.
    Provide only the code without explanations, unless specifically asked for documentation.
    Use modern JavaScript/TypeScript best practices.
    Include appropriate imports and exports.`;

    const result = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Generate code for: ${prompt}`,
    });

    logs.push({ type: "success", message: "Code generated successfully" });

    return {
      code: result.text,
      logs,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate code with OpenAI");
  }
}

// Gemini integration using AI SDK
async function processWithGemini(prompt: string): Promise<{ code: string; logs: any[] }> {
  try {
    const logs = [{ type: "info", message: "Initializing Gemini..." }];

    const { generateText } = await import("ai");
    const { createGoogleGenerativeAI } = await import("@ai-sdk/google");

    const gemini = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || "",
    });

    logs.push({ type: "info", message: "Sending request to Gemini..." });

    const systemPrompt = `You are an expert software developer. Generate clean, well-documented code based on the user's request.
    Provide only the code without explanations, unless specifically asked for documentation.
    Use modern JavaScript/TypeScript best practices.
    Include appropriate imports and exports.`;

    const result = await generateText({
      model: gemini("gemini-1.5-flash"),
      system: systemPrompt,
      prompt: `Generate code for: ${prompt}`,
    });

    logs.push({ type: "success", message: "Code generated successfully" });

    return {
      code: result.text,
      logs,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate code with Gemini");
  }
}
