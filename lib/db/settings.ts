import prisma from '@/lib/prisma'
import { MAX_MESSAGES_PER_DAY, MAX_SANDBOX_DURATION } from '@/lib/coding-agent/constants'

// Temporary type definition until Prisma client is properly generated
type UserSetting = {
  id: string
  userId: string
  key: string
  value: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Get a setting value with fallback to default.
 * Returns user-specific setting if found, otherwise returns the default value.
 *
 * @param key - Setting key (e.g., 'maxMessagesPerDay', 'maxSandboxDuration')
 * @param userId - User ID for user-specific settings
 * @param defaultValue - Default value if no user setting found
 * @returns The setting value as a string, or the default value
 */
export async function getSetting(
  key: string,
  userId: string | undefined,
  defaultValue?: string,
): Promise<string | undefined> {
  if (!userId) {
    return defaultValue
  }

  const userSetting = await (prisma as any).userSetting.findFirst({
    where: {
      userId,
      key,
    },
  })

  return userSetting?.value ?? defaultValue
}

/**
 * Get a numeric setting value (useful for maxMessagesPerDay, maxSandboxDuration, etc.)
 *
 * @param key - Setting key
 * @param userId - User ID for user-specific settings
 * @param defaultValue - Default numeric value if no user setting found
 * @returns The setting value parsed as a number
 */
export async function getNumericSetting(
  key: string,
  userId: string | undefined,
  defaultValue?: number,
): Promise<number | undefined> {
  const value = await getSetting(key, userId, defaultValue?.toString())
  return value ? parseInt(value, 10) : defaultValue
}

/**
 * Get the max messages per day limit for a user.
 * Checks user-specific setting, then falls back to environment variable.
 *
 * @param userId - Optional user ID for user-specific limit
 * @returns The max messages per day limit
 */
export async function getMaxMessagesPerDay(userId?: string): Promise<number> {
  const result = await getNumericSetting('maxMessagesPerDay', userId, MAX_MESSAGES_PER_DAY)
  return result ?? MAX_MESSAGES_PER_DAY
}

/**
 * Get the max sandbox duration (in minutes) for a user.
 * Checks user-specific setting, then falls back to environment variable.
 *
 * @param userId - Optional user ID for user-specific duration
 * @returns The max sandbox duration in minutes
 */
export async function getMaxSandboxDuration(userId?: string): Promise<number> {
  const result = await getNumericSetting('maxSandboxDuration', userId, MAX_SANDBOX_DURATION)
  return result ?? MAX_SANDBOX_DURATION
}

/**
 * Set a user setting value.
 *
 * @param userId - User ID
 * @param key - Setting key
 * @param value - Setting value
 * @returns The created or updated setting
 */
export async function setSetting(
  userId: string,
  key: string,
  value: string,
): Promise<UserSetting> {
  return await (prisma as any).userSetting.upsert({
    where: {
      userId_key: {
        userId,
        key,
      },
    },
    update: {
      value,
      updatedAt: new Date(),
    },
    create: {
      userId,
      key,
      value,
    },
  })
}

/**
 * Delete a user setting.
 *
 * @param userId - User ID
 * @param key - Setting key
 * @returns True if deleted, false if not found
 */
export async function deleteSetting(userId: string, key: string): Promise<boolean> {
  try {
    await (prisma as any).userSetting.delete({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    })
    return true
  } catch {
    return false
  }
}

/**
 * Get all settings for a user.
 *
 * @param userId - User ID
 * @returns Array of user settings
 */
export async function getUserSettings(userId: string): Promise<UserSetting[]> {
  return await (prisma as any).userSetting.findMany({
    where: {
      userId,
    },
    orderBy: {
      key: 'asc',
    },
  })
}
