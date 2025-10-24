import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/coding-agent/session'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all tasks with active sandboxes (sandboxId is not null) for this user
    const runningSandboxes = await prisma.builderTask.findMany({
      where: {
        userId: session.user.id,
        sandboxId: {
          not: null,
        },
      },
      select: {
        id: true,
        prompt: true,
        repoUrl: true,
        branchName: true,
        sandboxId: true,
        sandboxUrl: true,
        createdAt: true,
        status: true,
        keepAlive: true,
        maxDuration: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Transform the data to match the expected format
    const sandboxes = runningSandboxes.map((task) => ({
      id: task.id,
      taskId: task.id,
      prompt: task.prompt,
      repoUrl: task.repoUrl,
      branchName: task.branchName,
      sandboxId: task.sandboxId,
      sandboxUrl: task.sandboxUrl,
      createdAt: task.createdAt,
      status: task.status,
      keepAlive: task.keepAlive,
      maxDuration: task.maxDuration,
    }))

    return NextResponse.json({
      sandboxes,
    })
  } catch (error) {
    console.error('Error fetching sandboxes:', error)
    return NextResponse.json({ error: 'Failed to fetch sandboxes' }, { status: 500 })
  }
}