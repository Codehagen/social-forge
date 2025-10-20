"use server";

import prisma from "@/lib/prisma";
import type { Prisma, BuilderTask } from "@prisma/client";

export async function getBuilderTaskForUser<T extends Prisma.BuilderTaskInclude | undefined = undefined>(
  taskId: string,
  userId: string,
  include?: T
): Promise<(T extends undefined ? BuilderTask : Prisma.BuilderTaskGetPayload<{ include: T }>) | null> {
  return prisma.builderTask.findFirst({
    where: {
      id: taskId,
      userId,
      deletedAt: null,
    },
    include,
  }) as Promise<(T extends undefined ? BuilderTask : Prisma.BuilderTaskGetPayload<{ include: T }>) | null>;
}
