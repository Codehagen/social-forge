import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from '@/lib/coding-agent/session'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ owner: string; repo: string; pr_number: string }> },
) {
  try {
    // Get user session
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { owner, repo, pr_number } = await context.params
    const prNumber = parseInt(pr_number, 10)

    if (isNaN(prNumber)) {
      return NextResponse.json({ error: 'Invalid PR number' }, { status: 400 })
    }

    const repoUrl = `https://github.com/${owner}/${repo}`

    // Check if a task already exists for this PR and user
    const existingTask = await prisma.builderTask.findFirst({
      where: {
        userId: session.user.id,
        prNumber: prNumber,
        repoUrl: repoUrl,
        deletedAt: null,
      },
    })

    return NextResponse.json({
      hasTask: !!existingTask,
      taskId: existingTask?.id || null,
    })
  } catch (error) {
    console.error('Error checking for existing task:', error)
    return NextResponse.json({ error: 'Failed to check for existing task' }, { status: 500 })
  }
}
