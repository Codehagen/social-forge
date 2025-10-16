import { decryptSession } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function getSessionFromCookie(cookieValue?: string) {
  if (!cookieValue) return null

  const session = await decryptSession(cookieValue)
  if (!session) return null

  return {
    user: {
      id: session.userId,
      username: session.username,
      email: session.email,
      avatarUrl: session.avatarUrl,
    }
  }
}

export async function getSessionFromReq(req: NextRequest) {
  const cookieValue = req.cookies.get('coding-agent-session')?.value
  return getSessionFromCookie(cookieValue)
}