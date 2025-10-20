"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useBuilderTasks } from "@/components/builder/app-layout-context";
import { cn } from "@/lib/utils";
import { TaskSidebar } from "@/components/builder/task-sidebar";

type BuilderAppLayoutProps = {
  children: React.ReactNode;
};

export function BuilderAppLayout({ children }: BuilderAppLayoutProps) {
  const { tasks, isLoading, refreshTasks } = useBuilderTasks();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "b") {
        event.preventDefault();
        setSidebarOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen ? (
        <div className="w-72 border-r bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground">Tasks</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refreshTasks()}>
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                Hide
              </Button>
            </div>
          </div>
          {isLoading && tasks.length === 0 ? (
            <ScrollArea className="h-[calc(100vh-60px)] p-3">
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-[70px] w-full" />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <TaskSidebar tasks={tasks} />
          )}
        </div>
      ) : (
        <div className="sticky left-0 top-0 z-10 border-r bg-background px-2 py-1">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            Show Tasks
          </Button>
        </div>
      )}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
