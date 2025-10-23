'use client';

import { useState } from "react";
import type { BuilderTask } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/builder/page-header";
import { TaskDetails } from "@/components/builder/task-details";
import { LogsPane } from "@/components/builder/logs-pane";
import { useBuilderTask } from "@/lib/coding-agent/hooks/use-builder-task";
import { useTasks } from "@/components/builder/app-layout";
import { TaskPageHeader } from "@/components/builder/task-page-header";
import { GitHubStarsButton } from "@/components/github-stars-button";
import { User } from "@/components/auth/user";
import { VERCEL_DEPLOY_URL, DEFAULT_GITHUB_STARS } from "@/lib/coding-agent/constants";

type TaskPageClientProps = {
  taskId: string;
  maxSandboxDuration?: number;
  user?: { name?: string | null; email?: string | null; image?: string | null } | null;
  authProvider?: string | null;
  initialStars?: number;
};

export function TaskPageClient({
  taskId,
  maxSandboxDuration = 300,
  user = null,
  authProvider = null,
  initialStars = DEFAULT_GITHUB_STARS,
}: TaskPageClientProps) {
  const { task, isLoading, error } = useBuilderTask(taskId);
  const { toggleSidebar } = useTasks();
  const [logsPaneHeight, setLogsPaneHeight] = useState(40);

  const headerActions = (
    <div className="flex items-center gap-2 h-8">
      <GitHubStarsButton initialStars={initialStars} />
      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-8 sm:px-3 px-0 sm:w-auto w-8 bg-black text-white border-black hover:bg-black/90 dark:bg-white dark:text-black dark:border-white dark:hover:bg-white/90"
      >
        <a href={VERCEL_DEPLOY_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
          <svg viewBox="0 0 76 65" className="h-3 w-3" fill="currentColor">
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
          </svg>
          <span className="hidden sm:inline">Deploy Your Own</span>
        </a>
      </Button>
      <User user={user} authProvider={authProvider} />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex-1 bg-background">
        <div className="p-3">
          <PageHeader showMobileMenu onToggleMobileMenu={toggleSidebar} actions={headerActions} />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex-1 bg-background">
        <div className="p-3">
          <PageHeader showMobileMenu onToggleMobileMenu={toggleSidebar} showPlatformName={true} actions={headerActions} />
        </div>
        <div className="mx-auto p-3">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Task Not Found</h2>
              <p className="text-muted-foreground">{error ?? "The requested task could not be found."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background relative flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 p-3">
        <TaskPageHeader task={task as BuilderTask} user={user} authProvider={authProvider} initialStars={initialStars} />
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ paddingBottom: `${logsPaneHeight}px` }}>
        <TaskDetails task={task} maxSandboxDuration={maxSandboxDuration} />
      </div>
      <LogsPane task={task as BuilderTask} onHeightChange={setLogsPaneHeight} />
    </div>
  );
}
