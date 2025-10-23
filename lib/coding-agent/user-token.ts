import prisma from '@/lib/prisma'
import { decrypt } from './crypto'

/**
 * Get the user's GitHub token from the database
 * Returns the access token or null if not found
 */
export async function getUserGitHubToken(userId?: string): Promise<string | null> {
  try {
    if (!userId) {
      return null
    }

    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: 'github',
      },
    })

    if (!account?.accessToken) {
      return null
    }

    // Return the access token directly (better-auth handles encryption)
    return account.accessToken
  } catch (error) {
    console.error('Error getting GitHub token:', error)
    return null
  }
}

/**
 * Check if the user has a GitHub token
 */
export async function hasUserGitHubToken(userId?: string): Promise<boolean> {
  const token = await getUserGitHubToken(userId)
  return !!token
}
