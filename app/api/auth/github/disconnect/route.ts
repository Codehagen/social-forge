import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  // Check Better Auth session first
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session?.user) {
    console.log('Disconnect GitHub: No session found')
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!session.user.id) {
    console.error('Session user.id is undefined. Session:', session)
    return Response.json({ error: 'Invalid session - user ID missing' }, { status: 400 })
  }

  console.log('Disconnecting GitHub account for user:', session.user.id)

  try {
    await prisma.codingAgentAccount.deleteMany({
      where: {
        userId: session.user.id,
        provider: 'github'
      }
    })

    console.log('GitHub account disconnected successfully for user:', session.user.id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting GitHub:', error)
    return Response.json(
      { error: 'Failed to disconnect', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
