import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { GitHub } from 'arctic'
import { db } from '@/lib/db/client'
import { users, accounts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { setCodingAgentSession } from '@/lib/auth'
import { encrypt } from '@/lib/crypto'

export async function GET(req: NextRequest): Promise<Response> {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const cookieStore = await cookies()

  const storedState = cookieStore.get('coding_agent_github_state')?.value
  const storedRedirectTo = cookieStore.get('coding_agent_github_redirect')?.value ?? '/builder'

  if (code === null || state === null || storedState !== state) {
    return new Response('Invalid OAuth state', {
      status: 400,
    })
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return Response.redirect(new URL('/builder?error=github_not_configured', req.url))
  }

  const github = new GitHub(clientId, clientSecret)

  try {
    const tokens = await github.validateAuthorizationCode(code)
    const githubUserResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    })

    if (!githubUserResponse.ok) {
      return Response.redirect(new URL('/builder?error=github_api_error', req.url))
    }

    const githubUser: any = await githubUserResponse.json()

    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    })

    let primaryEmail = githubUser.email
    if (emailsResponse.ok) {
      const emails: any[] = await emailsResponse.json()
      const primary = emails.find((email) => email.primary && email.verified)
      if (primary) {
        primaryEmail = primary.email
      }
    }

    // Check if user already exists
    let existingUser = await db
      .select()
      .from(users)
      .where(eq(users.externalId, githubUser.id.toString()))
      .limit(1)

    let userId: string

    if (existingUser.length > 0) {
      userId = existingUser[0].id
      // Update user info
      await db
        .update(users)
        .set({
          username: githubUser.login,
          email: primaryEmail,
          name: githubUser.name,
          avatarUrl: githubUser.avatar_url,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    } else {
      // Create new user
      userId = nanoid()
      await db.insert(users).values({
        id: userId,
        provider: 'github',
        externalId: githubUser.id.toString(),
        username: githubUser.login,
        email: primaryEmail,
        name: githubUser.name,
        avatarUrl: githubUser.avatar_url,
        accessToken: await encrypt(tokens.accessToken),
        refreshToken: tokens.refreshToken ? await encrypt(tokens.refreshToken) : null,
        scope: 'repo,read:user,user:email',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      })

      // Create account record
      await db.insert(accounts).values({
        id: nanoid(),
        userId: userId,
        provider: 'github',
        providerAccountId: githubUser.id.toString(),
        accessToken: await encrypt(tokens.accessToken),
        refreshToken: tokens.refreshToken ? await encrypt(tokens.refreshToken) : null,
        scope: 'repo,read:user,user:email',
        createdAt: new Date(),
      })
    }

    // Create coding agent session
    const session = {
      userId,
      provider: 'github' as const,
      username: githubUser.login,
      email: primaryEmail,
      avatarUrl: githubUser.avatar_url,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }

    await setCodingAgentSession(session)

    // Clean up cookies
    cookieStore.delete('coding_agent_github_state')
    cookieStore.delete('coding_agent_github_redirect')

    // Redirect to the intended page
    return Response.redirect(new URL(storedRedirectTo, req.nextUrl.origin))
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return Response.redirect(new URL('/builder?error=github_oauth_error', req.url))
  }
}
