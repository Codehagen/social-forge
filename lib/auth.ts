import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";

// Keep existing Better Auth for backward compatibility
const prisma = new PrismaClient();
export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
});

// Coding Agent Template Auth System
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWE_SECRET = new TextEncoder().encode(
  process.env.JWE_SECRET || "default-secret-key-change-in-production"
);

// Session types for coding agent
export interface CodingAgentSession {
  userId: string;
  provider: "github" | "vercel";
  username: string;
  email?: string;
  avatarUrl?: string;
  expiresAt: Date;
}

// Encrypt session data
export async function encryptSession(session: CodingAgentSession): Promise<string> {
  const jwt = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(session.expiresAt)
    .sign(JWE_SECRET);

  return jwt;
}

// Decrypt session data
export async function decryptSession(token: string): Promise<CodingAgentSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWE_SECRET);
    return payload as CodingAgentSession;
  } catch {
    return null;
  }
}

// Get current coding agent session
export async function getCodingAgentSession(): Promise<CodingAgentSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("coding-agent-session")?.value;

  if (!sessionToken) return null;

  return await decryptSession(sessionToken);
}

// Set coding agent session
export async function setCodingAgentSession(session: CodingAgentSession): Promise<void> {
  const cookieStore = await cookies();
  const encryptedSession = await encryptSession(session);

  cookieStore.set("coding-agent-session", encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// Clear coding agent session
export async function clearCodingAgentSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("coding-agent-session");
}

export async function getCurrentUser() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  return session?.user || null;
}

// Get coding agent user from the coding agent database
export async function getCodingAgentUser() {
  const session = await getCodingAgentSession();
  if (!session) return null;

  // Get user from coding agent database
  const user = await prisma.codingAgentUser.findUnique({
    where: { id: session.userId },
  });

  return user;
}

// Create or get coding agent user from social forge user
export async function getOrCreateCodingAgentUser(socialForgeUserId: string) {
  // First get the social forge user
  const socialForgeUser = await prisma.user.findUnique({
    where: { id: socialForgeUserId },
  });

  if (!socialForgeUser) return null;

  // Check if coding agent user already exists
  let codingAgentUser = await prisma.codingAgentUser.findFirst({
    where: {
      OR: [
        { externalId: socialForgeUser.id }, // Link by social forge user ID
        { email: socialForgeUser.email },   // Link by email
      ],
    },
  });

  // Create coding agent user if doesn't exist
  if (!codingAgentUser) {
    codingAgentUser = await prisma.codingAgentUser.create({
      data: {
        provider: "social-forge",
        externalId: socialForgeUser.id,
        accessToken: "", // No OAuth token for social forge users
        username: socialForgeUser.email || socialForgeUser.name || `user_${socialForgeUser.id.slice(-8)}`,
        email: socialForgeUser.email,
        name: socialForgeUser.name,
        avatarUrl: socialForgeUser.image,
      },
    });
  }

  return codingAgentUser;
}
