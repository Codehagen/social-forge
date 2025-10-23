import { TaskPageClient } from '@/components/builder/task-page-client'
import { getServerSession } from '@/lib/coding-agent/session'
import { getGitHubStars } from '@/lib/github-stars'

interface TaskPageProps {
  params: {
    taskId: string
  }
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { taskId } = await params
  const session = await getServerSession()

  // Get max sandbox duration for this user (user-specific > global > env var)
  const defaultMaxDuration = Number.parseInt(process.env.MAX_SANDBOX_DURATION ?? "300", 10)
  const maxSandboxDuration = defaultMaxDuration

  const stars = await getGitHubStars()

  return (
    <TaskPageClient
      taskId={taskId}
      user={session?.user ?? null}
      authProvider={session?.authProvider ?? null}
      initialStars={stars}
      maxSandboxDuration={maxSandboxDuration}
    />
  )
}

export async function generateMetadata({ params }: TaskPageProps) {
  const { taskId } = await params

  return {
    title: `Task ${taskId} - Social Forge`,
    description: 'View task details and execution logs',
  }
}
