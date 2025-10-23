import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/coding-agent/session'
import prisma from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { encrypt } from '@/lib/coding-agent/crypto'

type Provider = 'openai' | 'gemini' | 'cursor' | 'anthropic' | 'aigateway'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userKeys = await prisma.builderApiKey.findMany({
      where: { userId: session.user.id },
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
    const session = await getServerSession()

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

    const encryptedKey = encrypt(apiKey)

    // Upsert the API key
    await prisma.builderApiKey.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: provider as BuilderApiProvider, // Cast to match Prisma enum
        },
      },
      update: {
        value: encryptedKey,
        updatedAt: new Date(),
      },
      create: {
        id: nanoid(),
        userId: session.user.id,
        provider: provider as any, // Cast to match Prisma enum
        value: encryptedKey,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving API key:', error)
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const provider = searchParams.get('provider') as Provider

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    await prisma.builderApiKey.deleteMany({
      where: {
        userId: session.user.id,
        provider: provider as any, // Cast to match Prisma enum
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
