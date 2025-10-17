import { db } from '@/lib/db/client'

export async function getMaxSandboxDuration(userId?: string): Promise<number> {
  if (!userId) {
    return parseInt(process.env.MAX_SANDBOX_DURATION || '300', 10)
  }

  try {
    const setting = await db.codingSetting.findFirst({
      where: {
        userId,
        key: 'maxSandboxDuration'
      }
    })

    if (setting) {
      return parseInt(setting.value, 10)
    }
  } catch (error) {
    console.error('Error fetching max sandbox duration:', error)
  }

  return parseInt(process.env.MAX_SANDBOX_DURATION || '300', 10)
}

export async function getMaxMessagesPerDay(userId?: string): Promise<number> {
  if (!userId) {
    return parseInt(process.env.MAX_MESSAGES_PER_DAY || '100', 10)
  }

  try {
    const setting = await db.codingSetting.findFirst({
      where: {
        userId,
        key: 'maxMessagesPerDay'
      }
    })

    if (setting) {
      return parseInt(setting.value, 10)
    }
  } catch (error) {
    console.error('Error fetching max messages per day:', error)
  }

  return parseInt(process.env.MAX_MESSAGES_PER_DAY || '100', 10)
}