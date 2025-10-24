import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import type { SessionUserInfo } from '@/lib/atoms/session'

export async function GET() {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList,
    })

    if (!session?.user) {
      return Response.json({ user: undefined })
    }

    // Determine auth provider - for now default to email since better-auth doesn't expose accounts in session
    const authProvider = 'email'

    const sessionInfo: SessionUserInfo = {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image || null,
      },
      authProvider,
    }

    return Response.json(sessionInfo)
  } catch (error) {
    console.error('Failed to get session info:', error)
    return Response.json({ user: undefined })
  }
}
