import { RepoLayout } from '@/components/builder/repo-layout'
import { getServerSession } from '@/lib/coding-agent/session'
import { getGitHubStars } from '@/lib/github-stars'

interface LayoutPageProps {
  params: Promise<{
    owner: string
    repo: string
  }>
  children: React.ReactNode
}

export default async function Layout({ params, children }: LayoutPageProps) {
  const { owner, repo } = await params
  const session = await getServerSession()
  const stars = await getGitHubStars()

  return (
    <RepoLayout
      owner={owner}
      repo={repo}
      user={session?.user ?? null}
      authProvider={(session as { lastLoginMethod?: string | null } | null)?.lastLoginMethod ?? null}
      initialStars={stars}
    >
      {children}
    </RepoLayout>
  )
}

export async function generateMetadata({ params }: LayoutPageProps) {
  const { owner, repo } = await params

  return {
    title: `${owner}/${repo} - Social Forge`,
    description: 'View repository commits, issues, and pull requests',
  }
}
