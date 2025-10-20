'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/builder/page-header'
import { RepoSelector } from '@/components/builder/repo-selector'
import { GitHubStarsButton } from '@/components/github-stars-button'
import { User } from '@/components/auth/user'
import { Button } from '@/components/ui/button'
import { useBuilderTasks } from '@/components/builder/app-layout-context'
import { VERCEL_DEPLOY_URL } from '@/lib/coding-agent/constants'
import { signIn } from '@/lib/auth-client'

interface BuilderHomeHeaderProps {
  selectedOwner: string
  selectedRepo: string
  onOwnerChange: (owner: string) => void
  onRepoChange: (repo: string) => void
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  authProvider?: string | null
  initialStars?: number
}

interface GitHubConnectionState {
  connected: boolean
  username?: string | null
  source?: 'account' | 'env'
  connectedAt?: string | null
}

export function BuilderHomeHeader({
  selectedOwner,
  selectedRepo,
  onOwnerChange,
  onRepoChange,
  user = null,
  authProvider = null,
  initialStars = 1056,
}: BuilderHomeHeaderProps) {
  const { toggleSidebar } = useBuilderTasks()
  const [connection, setConnection] = useState<GitHubConnectionState>({ connected: false })
  const [checkingStatus, setCheckingStatus] = useState(false)

  const fetchConnectionStatus = useCallback(async () => {
    try {
      setCheckingStatus(true)
      const response = await fetch('/api/auth/github/status', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to resolve GitHub status')
      }
      const data = (await response.json()) as GitHubConnectionState
      setConnection(data)
    } catch (error) {
      console.error(error)
      setConnection({ connected: false })
    } finally {
      setCheckingStatus(false)
    }
  }, [])

  useEffect(() => {
    fetchConnectionStatus()
    const interval = setInterval(fetchConnectionStatus, 60_000)
    const handleFocus = () => fetchConnectionStatus()
    window.addEventListener('focus', handleFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchConnectionStatus])

  const handleConnect = async () => {
    try {
      await signIn.social({
        provider: 'github',
        options: {
          scope: ['read:user', 'user:email', 'repo'],
        },
      })
    } catch (error) {
      console.error('GitHub sign-in failed', error)
      toast.error('GitHub sign-in failed')
    }
  }

  const handleDisconnect = async () => {
    if (connection.source === 'env') {
      toast.error('GitHub token is provided via environment. Remove the token to disconnect.')
      return
    }

    try {
      const response = await fetch('/api/auth/github/disconnect', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Failed to disconnect GitHub')
      }
      toast.success('Disconnected GitHub account')
      onOwnerChange('')
      onRepoChange('')
      await fetchConnectionStatus()
    } catch (error) {
      console.error(error)
      toast.error('Failed to disconnect GitHub')
    }
  }

  const leftActions = useMemo(
    () => (
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Coding Agent</span>
        <span className="truncate text-lg font-semibold text-foreground">Launch a new builder task</span>
        {connection.connected && selectedOwner && selectedRepo ? (
          <span className="truncate text-xs text-muted-foreground">
            Target repository: {selectedOwner}/{selectedRepo}
          </span>
        ) : null}
      </div>
    ),
    [connection.connected, selectedOwner, selectedRepo],
  )

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {connection.connected ? (
        <RepoSelector
          connected={connection.connected}
          selectedOwner={selectedOwner}
          selectedRepo={selectedRepo}
          onOwnerChange={onOwnerChange}
          onRepoChange={onRepoChange}
        />
      ) : (
        <Button variant="outline" size="sm" onClick={handleConnect} disabled={checkingStatus}>
          {checkingStatus ? 'Checking GitHub…' : 'Connect GitHub'}
        </Button>
      )}

      {connection.connected && connection.source === 'account' ? (
        <Button variant="ghost" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      ) : null}

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
