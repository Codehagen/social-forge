"use server";

import prisma from "@/lib/prisma";
import { BuilderTaskMessageRole } from "@prisma/client";

const DEFAULT_MAX_MESSAGES = parseInt(process.env.MAX_MESSAGES_PER_DAY || "50", 10);

export async function checkRateLimit(userId: string) {
  const totalAllowed = DEFAULT_MAX_MESSAGES;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [taskCount, messageCount] = await Promise.all([
    prisma.builderTask.count({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
        },
      },
    }),
    prisma.builderTaskMessage.count({
      where: {
        task: {
          userId,
        },
        role: BuilderTaskMessageRole.USER,
        createdAt: {
          gte: startOfDay,
        },
      },
    }),
  ]);

  const total = taskCount + messageCount;
  const remaining = Math.max(totalAllowed - total, 0);

  return {
    allowed: total < totalAllowed,
    remaining,
    total: totalAllowed,
    resetAt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
  };
}
