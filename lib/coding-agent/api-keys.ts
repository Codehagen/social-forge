"use server";

import prisma from "@/lib/prisma";
import { BuilderApiProvider } from "@prisma/client";
import { decrypt } from "@/lib/coding-agent/crypto";
import { getServerSession } from "@/lib/coding-agent/session";

const ENV_PROVIDER_MAP: Record<BuilderApiProvider, string> = {
  [BuilderApiProvider.ANTHROPIC]: "ANTHROPIC_API_KEY",
  [BuilderApiProvider.OPENAI]: "OPENAI_API_KEY",
  [BuilderApiProvider.CURSOR]: "CURSOR_API_KEY",
  [BuilderApiProvider.GEMINI]: "GEMINI_API_KEY",
  [BuilderApiProvider.AIGATEWAY]: "AI_GATEWAY_API_KEY",
};

export async function getUserApiKeys(passedUserId?: string): Promise<{
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  CURSOR_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  AI_GATEWAY_API_KEY?: string;
}> {
  const session = passedUserId ? null : await getServerSession();
  const defaults = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    CURSOR_API_KEY: process.env.CURSOR_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
  };

  const userId = passedUserId ?? session?.user?.id;
  if (!userId) {
    return defaults;
  }

  try {
    const keys = await prisma.builderApiKey.findMany({
      where: { userId },
    });

    for (const key of keys) {
      const envName = ENV_PROVIDER_MAP[key.provider];
      try {
        const decrypted = decrypt(key.value);
        (defaults as Record<string, string | undefined>)[envName] = decrypted;
      } catch (error) {
        console.error("Failed to decrypt API key", key.provider, error);
      }
    }
  } catch (error) {
    console.error("Error fetching user API keys:", error);
  }

  return defaults;
}

export async function getUserApiKey(provider: BuilderApiProvider, passedUserId?: string): Promise<string | undefined> {
  const session = passedUserId ? null : await getServerSession();
  const envName = ENV_PROVIDER_MAP[provider];
  const systemDefault = process.env[envName];

  const userId = passedUserId ?? session?.user?.id;
  if (!userId) {
    return systemDefault;
  }

  try {
    const key = await prisma.builderApiKey.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
      select: {
        value: true,
      },
    });

    if (key?.value) {
      try {
        return decrypt(key.value);
      } catch (error) {
        console.error("Failed to decrypt API key", provider, error);
      }
    }
  } catch (error) {
    console.error("Error fetching user API key:", error);
  }

  return systemDefault;
}
