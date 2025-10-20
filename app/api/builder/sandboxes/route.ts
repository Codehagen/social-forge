"use server";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sandboxes = await prisma.builderTask.findMany({
      where: {
        userId: session.user.id,
        sandboxId: {
          not: null,
        },
      },
      select: {
        id: true,
        prompt: true,
        repoUrl: true,
        branchName: true,
        sandboxId: true,
        sandboxUrl: true,
        createdAt: true,
        status: true,
        keepAlive: true,
        maxDuration: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ sandboxes });
  } catch (error) {
    console.error("Failed to list sandboxes", error);
    return NextResponse.json({ error: "Failed to list sandboxes" }, { status: 500 });
  }
}
