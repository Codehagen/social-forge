import 'server-only'

import { db } from './client'
import { nanoid } from 'nanoid'

type InsertUserData = {
  provider: string
  externalId: string
  accessToken: string
  refreshToken?: string
  scope?: string
  username: string
  email?: string
  name?: string
  avatarUrl?: string
}

/**
 * Find or create a user in the database
 * Returns the internal user ID (our generated ID, not the external auth provider ID)
 *
 * IMPORTANT: This checks if the externalId is already connected to an existing user via accounts
 * to prevent duplicate accounts when someone connects GitHub then later signs in with GitHub
 */
export async function upsertUser(
  userData: InsertUserData,
): Promise<string> {
  const { provider, externalId, accessToken, refreshToken, scope } = userData

  // First check: Does this exact provider + externalId combination exist as a primary account?
  const existingUser = await db.codingAgentUser.findFirst({
    where: {
      provider,
      externalId,
    },
  })

  if (existingUser) {
    // User exists - update tokens, last login, and other fields that might have changed
    await db.codingAgentUser.update({
      where: { id: existingUser.id },
      data: {
        accessToken,
        refreshToken: refreshToken || null,
        scope: scope || null,
        username: userData.username,
        email: userData.email || null,
        name: userData.name || null,
        avatarUrl: userData.avatarUrl || null,
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      },
    })

    return existingUser.id
  }

  // Second check: Is this a GitHub account already connected to an existing user via accounts table?
  // This prevents duplicate accounts when someone:
  // 1. Signs in with Vercel
  // 2. Connects GitHub
  // 3. Later signs in directly with GitHub
  if (provider === 'github') {
    const existingAccount = await db.codingAgentAccount.findFirst({
      where: {
        provider: 'github',
        externalUserId: externalId,
      },
    })

    if (existingAccount) {
      console.log(
        `[upsertUser] GitHub account (${externalId}) is already connected to user ${existingAccount.userId}. Using existing user.`,
      )

      // Update the existing user's last login
      await db.codingAgentUser.update({
        where: { id: existingAccount.userId },
        data: {
          updatedAt: new Date(),
          lastLoginAt: new Date(),
        },
      })

      return existingAccount.userId
    }
  }

  // User doesn't exist at all - create new
  const userId = nanoid()
  const now = new Date()

  await db.codingAgentUser.create({
    data: {
      id: userId,
      provider,
      externalId,
      accessToken,
      refreshToken: refreshToken || null,
      scope: scope || null,
      username: userData.username,
      email: userData.email || null,
      name: userData.name || null,
      avatarUrl: userData.avatarUrl || null,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    },
  })

  return userId
}

/**
 * Get user by internal ID
 */
export async function getUserById(userId: string) {
  return await db.codingAgentUser.findUnique({
    where: { id: userId },
  })
}

/**
 * Get user by auth provider and external ID
 */
export async function getUserByExternalId(provider: string, externalId: string) {
  return await db.codingAgentUser.findFirst({
    where: {
      provider,
      externalId,
    },
  })
}

/**
 * Find user by GitHub account connection
 * Used to check if a GitHub account is already connected to a user
 */
export async function getUserByGitHubConnection(githubExternalId: string) {
  const account = await db.codingAgentAccount.findFirst({
    where: {
      provider: 'github',
      externalUserId: githubExternalId,
    },
    include: {
      user: true,
    },
  })
  return account?.user || null
}
