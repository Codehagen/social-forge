import prisma from '@/lib/prisma'
import { decrypt } from '@/lib/coding-agent/crypto'

type Provider = 'openai' | 'gemini' | 'cursor' | 'anthropic' | 'aigateway'

/**
 * Get a user's API key for a specific provider
 * Returns the decrypted API key or null if not found
 */
export async function getUserApiKey(provider: Provider, userId?: string): Promise<string | null> {
  try {
    if (!userId) {
      // Try to get from environment variables as fallback
      const envKey = process.env[`${provider.toUpperCase()}_API_KEY`]
      return envKey || null
    }

    const key = await prisma.builderApiKey.findFirst({
      where: {
        userId,
        provider,
      },
    })

    if (!key) {
      // Fallback to environment variables
      const envKey = process.env[`${provider.toUpperCase()}_API_KEY`]
      return envKey || null
    }

    // Decrypt the stored key
    return decrypt(key.value)
  } catch (error) {
    console.error(`Error getting ${provider} API key:`, error)
    return null
  }
}

/**
 * Get all user's API keys
 * Returns an array of providers that have keys configured
 */
export async function getUserApiKeys(userId: string): Promise<Provider[]> {
  try {
    const keys = await prisma.builderApiKey.findMany({
      where: {
        userId,
      },
      select: {
        provider: true,
      },
    })

    return keys.map((key) => key.provider as Provider)
  } catch (error) {
    console.error('Error getting user API keys:', error)
    return []
  }
}

/**
 * Check if a user has an API key for a specific provider
 */
export async function hasUserApiKey(provider: Provider, userId?: string): Promise<boolean> {
  const key = await getUserApiKey(provider, userId)
  return !!key
}
