import { getCodingAgentSession } from '@/lib/auth'
import { cache } from 'react'
import type { Session } from './types'

export const getServerSession = cache(async (): Promise<Session | null> => {
  const session = await getCodingAgentSession()
  if (!session) return null

  return {
    user: {
      id: session.userId,
      username: session.username,
      email: session.email,
      avatarUrl: session.avatarUrl,
    },
    authProvider: session.provider
  }
})