'use client'

import { PageHeader } from '@/components/builder/page-header'
import { GitHubStarsButton } from '@/components/github-stars-button'
import { Button } from '@/components/ui/button'
import { VERCEL_DEPLOY_URL } from '@/lib/coding-agent/constants'
import { User } from '@/components/auth/user'
import { useBuilderTasks } from '@/components/builder/app-layout-context'

type BuilderHomeHeaderProps = {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  authProvider?: string | null
  initialStars?: number
}

export function BuilderHomeHeader({ user = null, authProvider = null, initialStars = 1056 }: BuilderHomeHeaderProps) {
  const { toggleSidebar } = useBuilderTasks()

  const leftActions = (
    <div className="flex min-w-0 flex-col">
      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Coding Agent</span>
      <span className="truncate text-lg font-semibold text-foreground">Launch a new workspace task</span>
    </div>
  )

  const actions = (
    <div className="flex items-center gap-2">
      <GitHubStarsButton initialStars={initialStars} />
      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-8 px-3 bg-black text-white border-black hover:bg-black/90 dark:bg-white dark:text-black dark:border-white dark:hover:bg-white/90"
      >
        <a href={VERCEL_DEPLOY_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
          <svg viewBox="0 0 76 65" className="h-3 w-3" fill="currentColor" aria-hidden="true">
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
          </svg>
          <span>Deploy Your Own</span>
        </a>
      </Button>
      <User user={user ?? undefined} authProvider={authProvider ?? undefined} />
    </div>
  )

  return <PageHeader showMobileMenu onToggleMobileMenu={toggleSidebar} leftActions={leftActions} actions={actions} />
}
