"use server";

import prisma from "@/lib/prisma";
import { BuilderTaskMessageRole } from "@prisma/client";
import { getMaxMessagesPerDay } from "@/lib/db/settings";

export async function checkRateLimit(userId: string) {
  const totalAllowed = await getMaxMessagesPerDay(userId);
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

  console.log('[Rate Limit]', {
    userId,
    tasks: taskCount,
    messages: messageCount,
    total,
    limit: totalAllowed,
    remaining,
    allowed: total < totalAllowed,
  });

  return {
    allowed: total < totalAllowed,
    remaining,
    total: totalAllowed,
    resetAt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
  };
}
