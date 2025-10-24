"use server";

import prisma from "@/lib/prisma";
import { BuilderTaskMessageRole } from "@prisma/client";

export async function createTaskMessage(
  taskId: string,
  role: BuilderTaskMessageRole,
  content: string,
  id?: string
) {
  return prisma.builderTaskMessage.create({
    data: {
      id,
      taskId,
      role,
      content,
    },
  });
}

export async function addTaskMessage(taskId: string, role: BuilderTaskMessageRole, content: string) {
  return createTaskMessage(taskId, role, content);
}

export async function listTaskMessages(taskId: string) {
  return prisma.builderTaskMessage.findMany({
    where: { taskId },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function updateTaskMessageContent(id: string, content: string) {
  return prisma.builderTaskMessage.update({
    where: { id },
    data: { content },
  });
}
