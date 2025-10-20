"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { BuilderTask } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type TaskSidebarProps = {
  tasks: BuilderTask[];
};

export function TaskSidebar({ tasks }: TaskSidebarProps) {
  const summaries = useMemo(() => {
    return tasks.map((task) => {
      let repoName: string | null = null;
      if (task.repoUrl) {
        try {
          const url = new URL(task.repoUrl);
          const parts = url.pathname.split("/").filter(Boolean);
          if (parts.length >= 2) {
            repoName = `${parts[0]}/${parts[1].replace(/\.git$/, "")}`;
          }
        } catch {
          repoName = task.repoUrl;
        }
      }
      return { ...task, repoName };
    });
  }, [tasks]);

  return (
    <aside className="hidden w-72 border-r bg-card lg:block">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Tasks</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-60px)] p-3">
        {summaries.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tasks yet. Create one from the builder form.</p>
        ) : (
          <div className="space-y-2">
            {summaries.map((task) => (
              <Link key={task.id} href={`/builder/tasks/${task.id}`} className="block">
                <div
                  className={cn(
                    "rounded-lg border px-3 py-2 transition hover:border-primary/60 hover:bg-primary/5",
                    task.status === "ERROR" && "border-destructive/60 bg-destructive/10"
                  )}
                >
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="truncate">{task.prompt}</span>
                    <Badge variant={task.status === "ERROR" ? "destructive" : "secondary"} className="text-[10px]">
                      {task.status}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{task.repoName ?? task.repoUrl}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
