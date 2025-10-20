import "server-only";

import prisma from "@/lib/prisma";
import { BuilderTaskStatus } from "@prisma/client";
import {
  createCommandLog,
  createErrorLog,
  createInfoLog,
  createSuccessLog,
  TaskLogEntry,
  TaskLogEntryType,
} from "./logging";

const LOG_ERROR_MESSAGE = "Failed to append task log.";

async function appendLog(taskId: string, entry: TaskLogEntry, extra?: Partial<{ progress: number }>) {
  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.builderTask.findUnique({
        where: { id: taskId },
        select: { logs: true },
      });

      const existingLogs = Array.isArray(current?.logs) ? (current!.logs as TaskLogEntry[]) : [];
      const nextLogs = [...existingLogs, entry];

      await tx.builderTask.update({
        where: { id: taskId },
        data: {
          logs: nextLogs,
          ...(extra?.progress !== undefined ? { progress: extra.progress } : {}),
        },
      });
    });
  } catch (error) {
    console.error(LOG_ERROR_MESSAGE, error);
  }
}

async function updateStatusField(taskId: string, status: BuilderTaskStatus, entry?: TaskLogEntry) {
  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.builderTask.findUnique({
        where: { id: taskId },
        select: { logs: true },
      });

      const existingLogs = Array.isArray(current?.logs) ? (current!.logs as TaskLogEntry[]) : [];
      const nextLogs = entry ? [...existingLogs, entry] : existingLogs;

      await tx.builderTask.update({
        where: { id: taskId },
        data: {
          status,
          logs: nextLogs,
        },
      });
    });
  } catch (error) {
    console.error("Failed to update task status.", error);
  }
}

export class TaskLogger {
  private taskId: string;

  constructor(taskId: string) {
    this.taskId = taskId;
  }

  private create(type: TaskLogEntryType, message: string) {
    switch (type) {
      case "info":
        return createInfoLog(message);
      case "command":
        return createCommandLog(message);
      case "error":
        return createErrorLog(message);
      case "success":
        return createSuccessLog(message);
      default:
        return createInfoLog(message);
    }
  }

  async info(message: string) {
    await appendLog(this.taskId, this.create("info", message));
  }

  async command(message: string) {
    await appendLog(this.taskId, this.create("command", message));
  }

  async error(message: string) {
    await appendLog(this.taskId, this.create("error", message));
  }

  async success(message: string) {
    await appendLog(this.taskId, this.create("success", message));
  }

  async updateProgress(progress: number, message: string) {
    const entry = this.create("info", message);
    await appendLog(this.taskId, entry, { progress });
  }

  async updateStatus(status: BuilderTaskStatus, message?: string) {
    const entry = message ? this.create("info", message) : undefined;
    await updateStatusField(this.taskId, status, entry);
  }
}

export function createTaskLogger(taskId: string) {
  return new TaskLogger(taskId);
}
