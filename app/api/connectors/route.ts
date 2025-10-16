import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSessionFromReq } from '@/lib/session/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          data: [],
        },
        { status: 401 },
      )
    }

    const userConnectors = await (prisma as any).codingConnector.findMany({
      where: {
        userId: session.user.id,
      },
    })

    const decryptedConnectors = userConnectors.map((connector: any) => ({
      ...connector,
      oauthClientSecret: connector.oauthClientSecret, // Already decrypted in the database layer
      env: connector.env ? JSON.parse(connector.env) : null,
    }))

    return NextResponse.json({
      success: true,
      data: decryptedConnectors,
    })
  } catch (error) {
    console.error('Error fetching connectors:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch connectors',
        data: [],
      },
      { status: 500 },
    )
  }
}
