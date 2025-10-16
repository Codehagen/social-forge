import { getCodingAgentSession } from '@/lib/auth'
import { cache } from 'react'

export const getServerSession = cache(async () => {
  const session = await getCodingAgentSession()
  if (!session) return null

  return {
    user: {
      id: session.userId,
      username: session.username,
      email: session.email,
      avatarUrl: session.avatarUrl,
    }
  }
})