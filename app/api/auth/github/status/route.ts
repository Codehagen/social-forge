import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // Check Better Auth session first
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session?.user) {
    return Response.json({ connected: false })
  }

  if (!session.user.id) {
    console.error('GitHub status check: session.user.id is undefined')
    return Response.json({ connected: false })
  }

  try {
    // Check if user has GitHub as connected account
    const account = await prisma.codingAgentAccount.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github'
      },
      select: {
        username: true,
        createdAt: true,
      },
    })

    if (account) {
      return Response.json({
        connected: true,
        username: account.username,
        connectedAt: account.createdAt,
      })
    }

    // Check if user signed in with GitHub (primary account)
    const user = await prisma.codingAgentUser.findFirst({
      where: {
        id: session.user.id,
        provider: 'github'
      },
      select: {
        username: true,
        createdAt: true,
      },
    })

    if (user) {
      return Response.json({
        connected: true,
        username: user.username,
        connectedAt: user.createdAt,
      })
    }

    return Response.json({ connected: false })
  } catch (error) {
    console.error('Error checking GitHub connection status:', error)
    return Response.json({ connected: false, error: 'Failed to check status' }, { status: 500 })
  }
}
