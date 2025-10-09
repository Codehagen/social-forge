import { NextRequest, NextResponse } from 'next/server';
import { getPublishService } from '@/lib/publish/PublishService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectDir, name, workspaceId, strategy = 'vercel' } = body;

    if (!projectDir || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: projectDir and name' },
        { status: 400 }
      );
    }

    const publishService = getPublishService(strategy as any);
    const result = await publishService.publish({
      projectDir,
      name,
      workspaceId,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: result.url,
      deploymentId: result.deploymentId,
    });
  } catch (error) {
    console.error('Publish API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
