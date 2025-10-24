import { RepoCommits } from '@/components/builder/repo-commits'

interface CommitsPageProps {
  params: Promise<{
    owner: string
    repo: string
  }>
}

export default async function CommitsPage({ params }: CommitsPageProps) {
  const { owner, repo } = await params

  return <RepoCommits owner={owner} repo={repo} />
}
