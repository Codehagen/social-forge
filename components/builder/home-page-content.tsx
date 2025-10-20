'use client'

import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useBuilderTasks } from '@/components/builder/app-layout-context'
import { BuilderHomeHeader } from '@/components/builder/home-page-header'
import { BuilderHomeMobileFooter } from '@/components/builder/home-page-mobile-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  setInstallDependencies,
  setKeepAlive,
  setMaxDuration,
  getInstallDependencies,
  getKeepAlive,
  getMaxDuration,
  getSelectedOwner,
  getSelectedRepo,
  setSelectedOwner,
  setSelectedRepo,
} from '@/lib/utils/cookies'
import { taskPromptAtom } from '@/lib/atoms/task'

type BuilderHomeContentProps = {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  authProvider?: string | null
  initialStars?: number
  initialInstallDependencies?: boolean
  initialKeepAlive?: boolean
  initialMaxDuration?: number
  maxSandboxDuration?: number
  initialSelectedOwner?: string
  initialSelectedRepo?: string
}

const AGENT_OPTIONS = [
  { value: 'claude', label: 'Claude' },
  { value: 'codex', label: 'Codex (AI Gateway)' },
  { value: 'cursor', label: 'Cursor CLI' },
  { value: 'copilot', label: 'GitHub Copilot' },
  { value: 'gemini', label: 'Gemini CLI' },
  { value: 'opencode', label: 'OpenCode' },
]

export function BuilderHomeContent({
  user = null,
  authProvider = null,
  initialStars = 1056,
  initialInstallDependencies = false,
  initialKeepAlive = false,
  initialMaxDuration = 60,
  maxSandboxDuration = 300,
  initialSelectedOwner = '',
  initialSelectedRepo = '',
}: BuilderHomeContentProps) {
  const router = useRouter()
  const { addTaskOptimistically, refreshTasks } = useBuilderTasks()
  const [prompt, setPromptAtom] = useAtom(taskPromptAtom)

  const resolvedInstallDependencies =
    typeof window === 'undefined' ? initialInstallDependencies : getInstallDependencies()
  const resolvedKeepAlive = typeof window === 'undefined' ? initialKeepAlive : getKeepAlive()
  const resolvedMaxDuration =
    typeof window === 'undefined' ? initialMaxDuration : getMaxDuration()

  const resolvedOwner =
    typeof window === 'undefined'
      ? initialSelectedOwner ?? ''
      : getSelectedOwner() ?? initialSelectedOwner ?? ''
  const resolvedRepo =
    typeof window === 'undefined' ? initialSelectedRepo ?? '' : getSelectedRepo() ?? initialSelectedRepo ?? ''

  const [repoUrl, setRepoUrl] = useState(() =>
    resolvedOwner && resolvedRepo ? `https://github.com/${resolvedOwner}/${resolvedRepo}` : '',
  )
  const [selectedAgent, setSelectedAgent] = useState('claude')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedOwner, setSelectedOwnerState] = useState(resolvedOwner)
  const [selectedRepo, setSelectedRepoState] = useState(resolvedRepo)

  const clampedDuration = Math.min(
    Math.max(resolvedMaxDuration || 10, 10),
    maxSandboxDuration ?? resolvedMaxDuration ?? 300,
  )

  const [installDependencies, setInstallDependenciesState] = useState(resolvedInstallDependencies)
  const [keepAlive, setKeepAliveState] = useState(resolvedKeepAlive)
  const [maxDuration, setMaxDurationState] = useState(clampedDuration)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInstallDependenciesChange = (value: boolean) => {
    setInstallDependenciesState(value)
    setInstallDependencies(value)
  }

  const handleKeepAliveChange = (value: boolean) => {
    setKeepAliveState(value)
    setKeepAlive(value)
  }

  const handleMaxDurationChange = (value: number) => {
    setMaxDurationState(value)
    setMaxDuration(value)
  }

  const handleRepoUrlChange = (value: string) => {
    setRepoUrl(value)
    const match = value.match(/github\.com\/?([\w.-]+)\/?([\w.-]+)?/i)
    if (match && match[1] && match[2]) {
      const owner = match[1]
      const repo = match[2].replace(/\.git$/i, '')
      setSelectedOwnerState(owner)
      setSelectedOwner(owner)
      setSelectedRepoState(repo)
      setSelectedRepo(repo)
    } else {
      setSelectedOwnerState('')
      setSelectedOwner(null)
      setSelectedRepoState('')
      setSelectedRepo(null)
    }
  }

  useEffect(() => {
    if (selectedOwner && selectedRepo) {
      setRepoUrl(`https://github.com/${selectedOwner}/${selectedRepo}`)
    }
  }, [selectedOwner, selectedRepo])

  const handleOwnerChangeInternal = (owner: string) => {
    setSelectedOwnerState(owner)
    setSelectedOwner(owner || null)
    setSelectedRepoState('')
    setSelectedRepo(null)
    if (!owner) {
      setRepoUrl('')
    }
  }

  const handleRepoChangeInternal = (repo: string) => {
    setSelectedRepoState(repo)
    setSelectedRepo(repo || null)
    if (selectedOwner && repo) {
      setRepoUrl(`https://github.com/${selectedOwner}/${repo}`)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!prompt.trim()) {
      setError('Please describe the change you want the agent to make.')
      return
    }

    if (!repoUrl.trim()) {
      setError('Repository URL is required.')
      return
    }

    if (!user) {
      const message = 'Sign in required. Please sign in to create tasks.'
      setError(message)
      toast.error(message)
      return
    }

    const taskPayload = {
      prompt: prompt.trim(),
      repoUrl: repoUrl.trim(),
      selectedAgent,
      selectedModel,
      installDependencies,
      maxDuration,
      keepAlive,
    }

    setIsSubmitting(true)
    setError(null)

    const optimisticId = generateId(12)
    addTaskOptimistically(
      {
        prompt: taskPayload.prompt,
        repoUrl: taskPayload.repoUrl,
        selectedAgent: taskPayload.selectedAgent,
        selectedModel: taskPayload.selectedModel,
        installDependencies: taskPayload.installDependencies,
        maxDuration: taskPayload.maxDuration,
      },
      optimisticId,
    )

    // Persist prompt atom for next time
    setPromptAtom('')

    router.push(`/builder/tasks/${optimisticId}`)

    try {
      const response = await fetch('/api/builder/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskPayload, id: optimisticId }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to create task' }))
        throw new Error(data.error || data.message || 'Failed to create task')
      }

      const data = await response.json().catch(() => null)
      const actualId = data?.task?.id ?? optimisticId

      toast.success('Task created successfully!')
      await refreshTasks()
      if (actualId !== optimisticId) {
        router.replace(`/builder/tasks/${actualId}`)
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to create task'
      toast.error(message)
      setError(message)
      await refreshTasks()
    } finally {
      setIsSubmitting(false)
      setRepoUrl('')
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <div className="border-b px-3 py-3">
        <BuilderHomeHeader
          selectedOwner={selectedOwner}
          selectedRepo={selectedRepo}
          onOwnerChange={handleOwnerChangeInternal}
          onRepoChange={handleRepoChangeInternal}
          user={user}
          authProvider={authProvider}
          initialStars={initialStars}
        />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-24 pt-6 md:pb-12">
        <Card className="w-full max-w-3xl shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Describe the change you need</CardTitle>
            <p className="text-sm text-muted-foreground">
              Share the context, point to the repository, and we’ll spin up a sandbox to implement it.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Repository URL</label>
                <Input
                  value={repoUrl}
                  onChange={(event) => handleRepoUrlChange(event.target.value)}
                  placeholder="https://github.com/owner/repo"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Task prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(event) => setPromptAtom(event.target.value)}
                  rows={6}
                  placeholder="Explain what you want the agent to build or change…"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Agent</label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Max duration (minutes)</label>
                  <Input
                    type="number"
                    min={10}
                    max={maxSandboxDuration}
                    value={maxDuration}
                    onChange={(event) => handleMaxDurationChange(Number(event.target.value) || 10)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border px-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Install dependencies</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically run the project&apos;s install step before executing tasks.
                      </p>
                    </div>
                    <Switch checked={installDependencies} onCheckedChange={handleInstallDependenciesChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border px-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Keep sandbox alive</p>
                      <p className="text-xs text-muted-foreground">
                        Leave the sandbox running to iterate or preview changes after completion.
                      </p>
                    </div>
                    <Switch checked={keepAlive} onCheckedChange={handleKeepAliveChange} />
                  </div>
                </div>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                  {isSubmitting ? 'Creating task…' : 'Create Task'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <BuilderHomeMobileFooter initialStars={initialStars} />
    </div>
  )
}
