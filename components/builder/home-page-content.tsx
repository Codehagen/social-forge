'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTasks } from '@/components/builder/app-layout'
import { BuilderHomeHeader } from '@/components/builder/home-page-header'
import { BuilderHomeMobileFooter } from '@/components/builder/home-page-mobile-footer'
import { TaskForm } from '@/components/builder/task-form'
import {
  setSelectedOwner,
  setSelectedRepo,
} from '@/lib/utils/cookies'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GitHubIcon } from '@/components/icons/github-icon'
import { useSetAtom } from 'jotai'
import { taskPromptAtom } from '@/lib/atoms/task'
import { signIn } from '@/lib/auth-client'

interface HomePageContentProps {
  initialSelectedOwner?: string
  initialSelectedRepo?: string
  initialInstallDependencies?: boolean
  initialMaxDuration?: number
  initialKeepAlive?: boolean
  maxSandboxDuration?: number
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  initialStars?: number
}

export function HomePageContent({
  initialSelectedOwner = '',
  initialSelectedRepo = '',
  initialInstallDependencies = false,
  initialMaxDuration = 60,
  initialKeepAlive = false,
  maxSandboxDuration = 300,
  user = null,
  initialStars = 1056,
}: HomePageContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOwner, setSelectedOwnerState] = useState(initialSelectedOwner)
  const [selectedRepo, setSelectedRepoState] = useState(initialSelectedRepo)
  const [showSignInDialog, setShowSignInDialog] = useState(false)
  const [loadingVercel, setLoadingVercel] = useState(false)
  const [loadingGitHub, setLoadingGitHub] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshTasks, addTaskOptimistically } = useTasks()
  const setTaskPrompt = useSetAtom(taskPromptAtom)

  // Check which auth providers are enabled
  const hasGitHub = true
  const hasVercel = false

  // Show toast if GitHub was connected (user was already logged in)
  useEffect(() => {
    if (searchParams.get('github_connected') === 'true') {
      toast.success('GitHub account connected successfully!')
      // Remove the query parameter from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('github_connected')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

  // Wrapper functions to update both state and cookies
  const handleOwnerChange = (owner: string) => {
    setSelectedOwnerState(owner)
    setSelectedOwner(owner)
    // Clear repo when owner changes
    if (selectedRepo) {
      setSelectedRepoState('')
      setSelectedRepo('')
    }
  }

  const handleRepoChange = (repo: string) => {
    setSelectedRepoState(repo)
    setSelectedRepo(repo)
  }

  const handleTaskSubmit = async (data: {
    prompt: string
    repoUrl: string
    selectedAgent: string
    selectedModel: string
    installDependencies: boolean
    maxDuration: number
    keepAlive: boolean
  }) => {
    // Check if user is authenticated
    if (!user) {
      setShowSignInDialog(true)
      return
    }

    // Check if user has selected a repository
    if (!data.repoUrl) {
      toast.error('Please select a repository', {
        description: 'Choose a GitHub repository from the header.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const taskPayload = {
        prompt: data.prompt,
        repoUrl: data.repoUrl,
        selectedAgent: data.selectedAgent,
        selectedModel: data.selectedModel,
        installDependencies: data.installDependencies,
        maxDuration: data.maxDuration,
        keepAlive: data.keepAlive,
      }

      const response = await fetch('/api/builder/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskPayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create task')
      }

      const { task } = await response.json()

      addTaskOptimistically(task)
      refreshTasks()

      // Navigate to task page
      router.push(`/builder/tasks/${task.id}`)
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b px-3 py-3">
        <BuilderHomeHeader
          selectedOwner={selectedOwner}
          selectedRepo={selectedRepo}
          onOwnerChange={handleOwnerChange}
          onRepoChange={handleRepoChange}
          user={user}
          authProvider={null}
          initialStars={initialStars}
        />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-24 pt-6 md:pb-12">
        <TaskForm
          onSubmit={handleTaskSubmit}
          isSubmitting={isSubmitting}
          selectedOwner={selectedOwner}
          selectedRepo={selectedRepo}
          initialInstallDependencies={initialInstallDependencies}
          initialMaxDuration={initialMaxDuration}
          initialKeepAlive={initialKeepAlive}
          maxSandboxDuration={maxSandboxDuration}
        />
      </div>

      <BuilderHomeMobileFooter initialStars={initialStars} />

      <Dialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign in to continue</DialogTitle>
            <DialogDescription>
              You need to sign in to create tasks with AI agents.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Button
              onClick={async () => {
                try {
                  await signIn.social({
                    provider: 'github',
                    scopes: ['read:user', 'user:email', 'repo'],
                  })
                } catch (error) {
                  console.error('GitHub sign-in failed', error)
                  toast.error('GitHub sign-in failed')
                }
              }}
              className="w-full"
            >
              <GitHubIcon className="mr-2 h-4 w-4" />
              Sign in with GitHub
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
