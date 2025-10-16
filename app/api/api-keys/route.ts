import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromReq } from '@/lib/session/server'
import prisma from '@/lib/prisma'

type Provider = 'openai' | 'gemini' | 'cursor' | 'anthropic' | 'aigateway'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userKeys = await (prisma as any).codingAgentApiKey.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        provider: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      apiKeys: userKeys,
    })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { provider, apiKey } = body as { provider: Provider; apiKey: string }

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API key are required' }, { status: 400 })
    }

    if (!['openai', 'gemini', 'cursor', 'anthropic', 'aigateway'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    // Check if key already exists
    const existing = await (prisma as any).codingAgentApiKey.findFirst({
      where: {
        userId: session.user.id,
        provider: provider,
      },
    })

    if (existing) {
      // Update existing
      await (prisma as any).codingAgentApiKey.update({
        where: {
          id: existing.id,
        },
        data: {
          value: apiKey, // Assuming encryption happens at the database layer
          updatedAt: new Date(),
        },
      })
    } else {
      // Insert new
      await (prisma as any).codingAgentApiKey.create({
        data: {
          userId: session.user.id,
          provider,
          value: apiKey, // Assuming encryption happens at the database layer
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving API key:', error)
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const provider = searchParams.get('provider') as Provider

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    await (prisma as any).codingAgentApiKey.deleteMany({
      where: {
        userId: session.user.id,
        provider: provider,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
