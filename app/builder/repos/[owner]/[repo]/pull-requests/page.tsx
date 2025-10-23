import { RepoPageClient } from '@/components/builder/repo-page-client'
import { getServerSession } from '@/lib/coding-agent/session'
import { getGitHubStars } from '@/lib/github-stars'

interface RepoPullRequestsPageProps {
  params: {
    owner: string
    repo: string
  }
}

export default async function RepoPullRequestsPage({ params }: RepoPullRequestsPageProps) {
  const { owner, repo } = await params
  const session = await getServerSession()
  const stars = await getGitHubStars()

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : null

  const authProvider = (session as { lastLoginMethod?: string | null } | null)?.lastLoginMethod ?? null

  return (
    <RepoPageClient
      owner={owner}
      repo={repo}
      user={user}
      authProvider={authProvider}
      initialStars={stars}
    />
  )
}

export async function generateMetadata({ params }: RepoPullRequestsPageProps) {
  const { owner, repo } = await params

  return {
    title: `${owner}/${repo} - Pull Requests - Social Forge`,
    description: `View pull requests for ${owner}/${repo}`,
  }
}
