import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Get the server session for the coding agent
 * This is a wrapper around the main auth session
 */
export async function getServerSession() {
  return await getServerSession(authOptions)
}