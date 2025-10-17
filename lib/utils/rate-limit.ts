import { db } from '@/lib/db/client'
import { getMaxMessagesPerDay } from '@/lib/db/settings'

export async function checkRateLimit(
  userId: string,
): Promise<{ allowed: boolean; remaining: number; total: number; resetAt: Date }> {
  // Get max messages per day for this user (user-specific > global > env var)
  const maxMessagesPerDay = await getMaxMessagesPerDay(userId)

  // Get start of today (UTC)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // Get end of today (UTC)
  const tomorrow = new Date(today)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

  const todayStr = today.toISOString()

  try {
    // Count tasks created by this user today (excluding soft-deleted tasks)
    const tasksToday = await db.codingTask.findMany({
      where: {
        userId,
        createdAt: {
          gte: today
        },
        deletedAt: null
      },
      take: 1000
    })

    // Count user messages sent today across all tasks
    const userMessagesToday = await db.codingTaskMessage.findMany({
      where: {
        userId,
        role: 'user',
        createdAt: {
          gte: today
        }
      },
      take: 1000
    })

    // Total count includes both new tasks and follow-up messages
    const count = tasksToday.length + userMessagesToday.length
    const remaining = Math.max(0, maxMessagesPerDay - count)
    const allowed = count < maxMessagesPerDay

    return {
      allowed,
      remaining,
      total: maxMessagesPerDay,
      resetAt: tomorrow,
    }
  } catch (error) {
    console.error('Error in rate limit check:', error)
    // On error, allow the request but with low limits
    return {
      allowed: true,
      remaining: 10,
      total: 10,
      resetAt: tomorrow,
    }
  }
}
