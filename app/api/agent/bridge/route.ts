import { NextResponse } from "next/server";
import { z } from "zod";

import { agentBridge } from "@/lib/agent/bridge";
import { auth } from "@/lib/auth";
import { agentTaskInputSchema } from "@social-forge/agent-bridge";

const requestSchema = z.object({
	method: z.enum(["resolveWorkspaceContext", "listWorkspaces", "createAgentTask"]),
	params: z.unknown().optional(),
});

const resolveWorkspaceSchema = z.object({
	workspaceId: z.string().nullable().optional(),
});

const allowedOrigins = (process.env.AGENT_BRIDGE_ALLOWED_ORIGINS || "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

const isDev = process.env.NODE_ENV !== "production";

const allowedMethods = "POST, OPTIONS";
const allowedHeaders = "Content-Type, Authorization";

function isOriginAllowed(origin: string | null) {
	if (!origin) {
		return true;
	}

	if (allowedOrigins.length === 0) {
		return isDev;
	}

	return allowedOrigins.includes(origin);
}

function applyCorsHeaders(response: NextResponse, origin: string | null) {
	response.headers.set("Access-Control-Allow-Methods", allowedMethods);
	response.headers.set("Access-Control-Allow-Headers", allowedHeaders);

	if (origin && isOriginAllowed(origin)) {
		response.headers.set("Access-Control-Allow-Origin", origin);
		response.headers.set("Access-Control-Allow-Credentials", "true");
	}

	return response;
}

function buildErrorResponse(origin: string | null, message: string, status = 400) {
	const response = NextResponse.json({ error: message }, { status });
	return applyCorsHeaders(response, origin);
}

async function requireSessionUserId(request: Request) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	return session.user.id;
}

export async function OPTIONS(request: Request) {
	const origin = request.headers.get("origin");

	if (!isOriginAllowed(origin)) {
		return buildErrorResponse(origin, "Origin not allowed", 403);
	}

	const response = new NextResponse(null, { status: 204 });
	return applyCorsHeaders(response, origin);
}

export async function POST(request: Request) {
	const origin = request.headers.get("origin");

	if (!isOriginAllowed(origin)) {
		return buildErrorResponse(origin, "Origin not allowed", 403);
	}

	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return buildErrorResponse(origin, "Invalid JSON payload");
	}

	const parsedRequest = requestSchema.safeParse(payload);

	if (!parsedRequest.success) {
		return buildErrorResponse(origin, "Invalid request format");
	}

	const { method, params } = parsedRequest.data;

	try {
		switch (method) {
			case "resolveWorkspaceContext": {
				const parsedParams = resolveWorkspaceSchema.parse(params ?? {});
				const context = await agentBridge.resolveWorkspaceContext({
					workspaceId: parsedParams.workspaceId ?? null,
				});
				const response = NextResponse.json({ result: context });
				return applyCorsHeaders(response, origin);
			}
			case "listWorkspaces": {
				const userId = await requireSessionUserId(request);
				const workspaces = await agentBridge.listWorkspaces(userId);
				const response = NextResponse.json({ result: workspaces });
				return applyCorsHeaders(response, origin);
			}
			case "createAgentTask": {
				const parsedParams = agentTaskInputSchema.safeParse(params ?? {});

				if (!parsedParams.success) {
					return buildErrorResponse(origin, "Invalid agent task input");
				}

				const taskInput = parsedParams.data;
				const context = await agentBridge.resolveWorkspaceContext({
					workspaceId: taskInput.workspaceId ?? null,
				});
				const result = await agentBridge.createAgentTask({
					...taskInput,
					workspaceId: context.workspaceId,
					userId: context.userId,
				});
				const response = NextResponse.json({ result });
				return applyCorsHeaders(response, origin);
			}
			default: {
				return buildErrorResponse(origin, "Unsupported bridge method", 400);
			}
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unexpected error";
		const status = message === "Unauthorized" ? 401 : error instanceof Error ? 400 : 500;
		return buildErrorResponse(origin, message, status);
	}
}
