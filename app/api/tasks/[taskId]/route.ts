import { NextRequest, NextResponse } from 'next/server'
import { getCodingAgentSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    taskId: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCodingAgentSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params
    const task = await (prisma as any).codingTask.findFirst({
      where: {
        id: taskId,
        userId: session.userId,
        deletedAt: null,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

// PATCH method removed for MVP - keeping it simple

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCodingAgentSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params

    // Soft delete by setting deletedAt
    const result = await (prisma as any).codingTask.updateMany({
      where: {
        id: taskId,
        userId: session.userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
