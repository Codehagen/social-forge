'use client'

import type { BuilderTask } from '@prisma/client'
import { PageHeader } from '@/components/builder/page-header'
import { TaskActions } from '@/components/builder/task-actions'
import { useBuilderTasks } from '@/components/builder/app-layout-context'
import { Button } from '@/components/ui/button'
import { VERCEL_DEPLOY_URL } from '@/lib/coding-agent/constants'
import { GitHubStarsButton } from '@/components/github-stars-button'
import { User } from '@/components/auth/user'

interface TaskPageHeaderProps {
  task: BuilderTask
  user?: { name?: string | null; email?: string | null; image?: string | null } | null
  authProvider?: string | null
  initialStars?: number
}

export function TaskPageHeader({ task, user = null, authProvider = null, initialStars = 1056 }: TaskPageHeaderProps) {
  const { toggleSidebar } = useBuilderTasks()

  return (
    <PageHeader
      showMobileMenu={true}
      onToggleMobileMenu={toggleSidebar}
      showPlatformName={true}
      leftActions={
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">{task.prompt}</span>
          {task.repoUrl ? <span className="truncate text-xs text-muted-foreground">{task.repoUrl}</span> : null}
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <GitHubStarsButton initialStars={initialStars} />
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 px-3 bg-black text-white border-black hover:bg-black/90 dark:bg-white dark:text-black dark:border-white dark:hover:bg-white/90"
          >
            <a href={VERCEL_DEPLOY_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
              <svg viewBox="0 0 76 65" className="h-3 w-3" fill="currentColor">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              <span>Deploy Your Own</span>
            </a>
          </Button>
          <TaskActions task={task} />
          <User user={user} authProvider={authProvider} />
        </div>
      }
    />
  )
}
