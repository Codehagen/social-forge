"use server";

import prisma from "@/lib/prisma";
import { BuilderConnectorStatus, BuilderConnectorType } from "@prisma/client";
import { decrypt, encrypt } from "@/lib/coding-agent/crypto";
import { getServerSession } from "@/lib/coding-agent/session";

export type Connector = {
  id: string;
  name: string;
  description?: string | null;
  type: BuilderConnectorType;
  mode: "local" | "remote";
  baseUrl?: string | null;
  oauthClientId?: string | null;
  oauthClientSecret?: string | null;
  command?: string | null;
  env?: Record<string, string> | null;
  status: BuilderConnectorStatus;
};

function parseEnv(env?: string | null): Record<string, string> | null {
  if (!env) return null;
  try {
    const decrypted = decrypt(env);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Failed to parse connector env", error);
    return null;
  }
}

function decryptSecret(value?: string | null) {
  if (!value) return value;
  try {
    return decrypt(value);
  } catch (error) {
    console.error("Failed to decrypt connector secret", error);
    return null;
  }
}

export async function getUserConnectors(passedUserId?: string): Promise<Connector[]> {
  const session = passedUserId ? null : await getServerSession();
  const userId = passedUserId ?? session?.user?.id;

  if (!userId) {
    return [];
  }

  const records = await prisma.builderConnector.findMany({
    where: {
      userId,
      status: BuilderConnectorStatus.CONNECTED,
    },
    orderBy: {
      name: "asc",
    },
  });

  return records.map((connector) => ({
    id: connector.id,
    name: connector.name,
    description: connector.description,
    type: connector.type,
    mode: connector.type === BuilderConnectorType.LOCAL ? "local" : "remote",
    baseUrl: connector.baseUrl,
    oauthClientId: connector.oauthClientId,
    oauthClientSecret: decryptSecret(connector.oauthClientSecret),
    command: connector.command,
    env: parseEnv(connector.env),
    status: connector.status,
  }));
}

export async function saveConnectorEnv(connectorId: string, env: Record<string, string> | null) {
  const data = env ? encrypt(JSON.stringify(env)) : null;
  await prisma.builderConnector.update({
    where: { id: connectorId },
    data: { env: data },
  });
}
