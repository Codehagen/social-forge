import { cookies } from 'next/headers'
import { getSessionFromCookie } from './server'

export const getServerSession = async () => {
  const store = await cookies()
  const cookieValue = store.get('coding-agent-session')?.value
  return getSessionFromCookie(cookieValue)
}