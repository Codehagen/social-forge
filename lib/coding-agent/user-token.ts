import prisma from '@/lib/prisma'
import { decrypt } from './crypto'

/**
 * Get the user's GitHub token from the database
 * Returns the decrypted token or null if not found
 */
export async function getUserGitHubToken(userId?: string): Promise<string | null> {
  try {
    if (!userId) {
      return null
    }

    const token = await prisma.builderApiKey.findFirst({
      where: {
        userId,
        provider: 'github',
      },
    })

    if (!token) {
      return null
    }

    // Decrypt the stored token
    return decrypt(token.value)
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
