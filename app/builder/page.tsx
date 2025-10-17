import { cookies } from 'next/headers'
import { HomePageContent } from '@/components/home-page-content'
import { getCodingAgentSession } from '@/lib/auth'

export default async function BuilderPage() {
  const cookieStore = await cookies()
  const selectedOwner = cookieStore.get('selected-owner')?.value || ''
  const selectedRepo = cookieStore.get('selected-repo')?.value || ''
  const installDependencies = cookieStore.get('install-dependencies')?.value === 'true'
  const keepAlive = cookieStore.get('keep-alive')?.value === 'true'

  const session = await getCodingAgentSession()

  // Get user settings or defaults
  let maxDuration = 300

  const maxDurationFromCookie = parseInt(cookieStore.get('max-duration')?.value || maxDuration.toString(), 10)

  return (
    <HomePageContent
      initialSelectedOwner={selectedOwner}
      initialSelectedRepo={selectedRepo}
      initialInstallDependencies={installDependencies}
      initialMaxDuration={maxDurationFromCookie}
      initialKeepAlive={keepAlive}
      maxSandboxDuration={maxDuration}
      user={session ? {
        id: session.userId,
        username: session.username,
        email: session.email,
        avatarUrl: session.avatarUrl,
      } : null}
      initialStars={0} // TODO: implement GitHub stars
    />
  )
}
