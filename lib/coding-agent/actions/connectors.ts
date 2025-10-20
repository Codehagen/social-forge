'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/coding-agent/crypto';
import { getServerSession } from '@/lib/coding-agent/session';
import {
  BuilderConnectorStatus,
  BuilderConnectorType,
} from '@prisma/client';

type FormState = {
  success: boolean;
  message: string;
  errors: Record<string, string>;
};

const connectorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['local', 'remote']).default('remote'),
  baseUrl: z.string().url().optional(),
  oauthClientId: z.string().optional(),
  oauthClientSecret: z.string().optional(),
  command: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
});

function mapConnectorType(type: string | undefined) {
  return type === 'local' ? BuilderConnectorType.LOCAL : BuilderConnectorType.REMOTE;
}

function mapStatus(status: string | undefined) {
  return status === 'disconnected' ? BuilderConnectorStatus.DISCONNECTED : BuilderConnectorStatus.CONNECTED;
}

export async function createConnector(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized',
        errors: {},
      };
    }

    const parsed = connectorSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      type: formData.get('type'),
      baseUrl: formData.get('baseUrl'),
      oauthClientId: formData.get('oauthClientId'),
      oauthClientSecret: formData.get('oauthClientSecret'),
      command: formData.get('command'),
      env: formData.get('env') ? JSON.parse(String(formData.get('env'))) : undefined,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message;
        }
      }
      return {
        success: false,
        message: 'Validation failed',
        errors,
      };
    }

    const data = parsed.data;

    await prisma.builderConnector.create({
      data: {
        userId: session.user.id,
        name: data.name,
        description: data.description,
        type: mapConnectorType(data.type),
        baseUrl: data.baseUrl ?? null,
        oauthClientId: data.oauthClientId ?? null,
        oauthClientSecret: data.oauthClientSecret ? encrypt(data.oauthClientSecret) : null,
        command: data.command ?? null,
        env: data.env ? encrypt(JSON.stringify(data.env)) : null,
        status: BuilderConnectorStatus.CONNECTED,
      },
    });

    revalidatePath('/builder');

    return {
      success: true,
      message: 'Connector created successfully',
      errors: {},
    };
  } catch (error) {
    console.error('Error creating connector:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create connector',
      errors: {},
    };
  }
}

export async function updateConnector(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized',
        errors: {},
      };
    }

    const id = formData.get('id');
    if (!id || typeof id !== 'string') {
      return {
        success: false,
        message: 'Connector ID is required',
        errors: {},
      };
    }

    const parsed = connectorSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      type: formData.get('type'),
      baseUrl: formData.get('baseUrl'),
      oauthClientId: formData.get('oauthClientId'),
      oauthClientSecret: formData.get('oauthClientSecret'),
      command: formData.get('command'),
      env: formData.get('env') ? JSON.parse(String(formData.get('env'))) : undefined,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message;
        }
      }
      return {
        success: false,
        message: 'Validation failed',
        errors,
      };
    }

    const data = parsed.data;

    await prisma.builderConnector.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name: data.name,
        description: data.description,
        type: mapConnectorType(data.type),
        baseUrl: data.baseUrl ?? null,
        oauthClientId: data.oauthClientId ?? null,
        oauthClientSecret: data.oauthClientSecret ? encrypt(data.oauthClientSecret) : null,
        command: data.command ?? null,
        env: data.env ? encrypt(JSON.stringify(data.env)) : null,
        status: BuilderConnectorStatus.CONNECTED,
      },
    });

    revalidatePath('/builder');

    return {
      success: true,
      message: 'Connector updated successfully',
      errors: {},
    };
  } catch (error) {
    console.error('Error updating connector:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update connector',
      errors: {},
    };
  }
}

export async function deleteConnector(id: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized',
      };
    }

    await prisma.builderConnector.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath('/builder');

    return {
      success: true,
      message: 'Connector deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting connector:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete connector',
    };
  }
}

export async function toggleConnectorStatus(id: string, status: 'connected' | 'disconnected') {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized',
      };
    }

    await prisma.builderConnector.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        status: mapStatus(status),
      },
    });

    revalidatePath('/builder');

    return {
      success: true,
      message: `Connector ${status === 'connected' ? 'connected' : 'disconnected'} successfully`,
    };
  } catch (error) {
    console.error('Error toggling connector status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update connector status',
    };
  }
}
