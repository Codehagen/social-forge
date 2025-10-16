import prisma from '@/lib/prisma'

export async function getMaxSandboxDuration(userId?: string): Promise<number> {
  if (!userId) {
    return parseInt(process.env.MAX_SANDBOX_DURATION || '300', 10)
  }

  const setting = await prisma.codingSetting.findFirst({
    where: {
      userId,
      key: 'maxSandboxDuration'
    }
  })

  if (setting) {
    return parseInt(setting.value, 10)
  }

  return parseInt(process.env.MAX_SANDBOX_DURATION || '300', 10)
}

export async function getMaxMessagesPerDay(userId?: string): Promise<number> {
  if (!userId) {
    return parseInt(process.env.MAX_MESSAGES_PER_DAY || '100', 10)
  }

  const setting = await prisma.codingSetting.findFirst({
    where: {
      userId,
      key: 'maxMessagesPerDay'
    }
  })

  if (setting) {
    return parseInt(setting.value, 10)
  }

  return parseInt(process.env.MAX_MESSAGES_PER_DAY || '100', 10)
}