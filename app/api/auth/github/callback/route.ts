import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { createGitHubSession, saveSession } from '@/lib/session/create-github'
import { encrypt } from '@/lib/crypto'

export async function GET(req: NextRequest): Promise<Response> {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const cookieStore = await cookies()

  // Check if this is a sign-in flow or connect flow
  const authMode = cookieStore.get(`github_auth_mode`)?.value ?? null
  const isSignInFlow = authMode === 'signin'
  const isConnectFlow = authMode === 'connect'

  // Try both cookie patterns (new unified flow vs legacy oauth flow)
  const storedState = cookieStore.get(authMode ? `github_auth_state` : `github_oauth_state`)?.value ?? null
  const storedRedirectTo =
    cookieStore.get(authMode ? `github_auth_redirect_to` : `github_oauth_redirect_to`)?.value ?? null
  const storedUserId = cookieStore.get(`github_oauth_user_id`)?.value ?? null // Required for connect flow

  // For sign-in flow, we don't need storedUserId
  if (isSignInFlow) {
    if (code === null || state === null || storedState !== state || storedRedirectTo === null) {
      return new Response('Invalid OAuth state', {
        status: 400,
      })
    }
  } else {
    // For connect flow (including legacy oauth flow), we need storedUserId
    if (
      code === null ||
      state === null ||
      storedState !== state ||
      storedRedirectTo === null ||
      storedUserId === null
    ) {
      return new Response('Invalid OAuth state', {
        status: 400,
      })
    }
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return new Response('GitHub OAuth not configured', {
      status: 500,
    })
  }

  try {
    console.log('[GitHub Callback] Starting OAuth flow, mode:', authMode)

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('[GitHub Callback] Token exchange failed with status:', tokenResponse.status)
      const errorText = await tokenResponse.text()
      console.error('[GitHub Callback] Error response:', errorText)
      return new Response('Failed to exchange code for token', { status: 400 })
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string
      scope: string
      token_type: string
      error?: string
      error_description?: string
    }

    console.log('[GitHub Callback] Token data received, has access_token:', !!tokenData.access_token)

    if (!tokenData.access_token) {
      console.error('[GitHub Callback] Failed to get GitHub access token:', tokenData)
      return new Response(
        `Failed to authenticate with GitHub: ${tokenData.error_description || tokenData.error || 'Unknown error'}`,
        { status: 400 },
      )
    }

    // Fetch GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    const githubUser = (await userResponse.json()) as {
      login: string
      id: number
    }

    if (isSignInFlow) {
      // SIGN-IN FLOW: Create a new session for the GitHub user
      console.log('[GitHub Callback] Sign-in flow - creating GitHub session')
      const session = await createGitHubSession(tokenData.access_token, tokenData.scope)

      if (!session) {
        console.error('[GitHub Callback] Failed to create GitHub session')
        return new Response('Failed to create session', { status: 500 })
      }

      console.log('[GitHub Callback] GitHub session created for user:', session.user.id)
      // Note: Tokens are already stored in users table by upsertUser() in createGitHubSession()

      // Create response with redirect
      const response = new Response(null, {
        status: 302,
        headers: {
          Location: storedRedirectTo,
        },
      })

      // Save session to cookie
      await saveSession(response, session)

      // Clean up cookies
      cookieStore.delete(`github_auth_state`)
      cookieStore.delete(`github_auth_redirect_to`)
      cookieStore.delete(`github_auth_mode`)

      return response
    } else {
      // CONNECT FLOW: Add GitHub account to existing Vercel user
      // Encrypt the access token before storing
      const encryptedToken = encrypt(tokenData.access_token)

      // First, ensure the user exists in CodingAgentUser table
      // storedUserId might be from a different user system, so we need to create/find the coding agent user
      let codingAgentUserId = storedUserId!

      // Check if we need to create a CodingAgentUser record for this session user
      const existingCodingUser = await prisma.codingAgentUser.findUnique({
        where: { id: storedUserId! },
      })

      if (!existingCodingUser) {
        // Create a CodingAgentUser record for this user
        // We'll use their GitHub info since they're connecting GitHub
        const now = new Date()
        await prisma.codingAgentUser.create({
          data: {
            id: storedUserId!,
            provider: 'github',
            externalId: `${githubUser.id}`,
            accessToken: encryptedToken,
            scope: tokenData.scope || null,
            username: githubUser.login,
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
          },
        })
        console.log(`[GitHub Callback] Created CodingAgentUser for user ${storedUserId}`)
      }

      // Check if this GitHub account is already connected somewhere
      const existingAccount = await prisma.codingAgentAccount.findFirst({
        where: {
          provider: 'github',
          externalUserId: `${githubUser.id}`,
        },
      })

      if (existingAccount) {
        const connectedUserId = existingAccount.userId

        // If the GitHub account belongs to a different user, we need to merge accounts
        if (connectedUserId !== codingAgentUserId) {
          console.log(
            `[GitHub Callback] Merging accounts: GitHub account ${githubUser.id} belongs to user ${connectedUserId}, connecting to user ${codingAgentUserId}`,
          )

          // Transfer all tasks, connectors, accounts, and keys from old user to new user
          await prisma.codingTask.updateMany({
            where: { userId: connectedUserId },
            data: { userId: codingAgentUserId },
          })
          await prisma.codingConnector.updateMany({
            where: { userId: connectedUserId },
            data: { userId: codingAgentUserId },
          })
          await prisma.codingAgentAccount.updateMany({
            where: { userId: connectedUserId },
            data: { userId: codingAgentUserId },
          })
          await prisma.codingAgentApiKey.updateMany({
            where: { userId: connectedUserId },
            data: { userId: codingAgentUserId },
          })

          // Delete the old user record (this will cascade delete their related records)
          await prisma.codingAgentUser.delete({
            where: { id: connectedUserId },
          })

          console.log(
            `[GitHub Callback] Account merge complete. Old user ${connectedUserId} merged into ${codingAgentUserId}`,
          )

          // Update the GitHub account token
          await prisma.codingAgentAccount.update({
            where: { id: existingAccount.id },
            data: {
              userId: codingAgentUserId,
              accessToken: encryptedToken,
              scope: tokenData.scope,
              username: githubUser.login,
              updatedAt: new Date(),
            },
          })
        } else {
          // Same user, just update the token
          await prisma.codingAgentAccount.update({
            where: { id: existingAccount.id },
            data: {
              accessToken: encryptedToken,
              scope: tokenData.scope,
              username: githubUser.login,
              updatedAt: new Date(),
            },
          })
        }
      } else {
        // No existing GitHub account connection, create a new one
        await prisma.codingAgentAccount.create({
          data: {
            id: nanoid(),
            userId: codingAgentUserId,
            provider: 'github',
            externalUserId: `${githubUser.id}`, // Store GitHub numeric ID
            accessToken: encryptedToken,
            scope: tokenData.scope,
            username: githubUser.login,
          },
        })
      }

      // Clean up cookies (handle both new and legacy cookie names)
      if (authMode) {
        cookieStore.delete(`github_auth_state`)
        cookieStore.delete(`github_auth_redirect_to`)
        cookieStore.delete(`github_auth_mode`)
      } else {
        cookieStore.delete(`github_oauth_state`)
        cookieStore.delete(`github_oauth_redirect_to`)
      }
      cookieStore.delete(`github_oauth_user_id`)

      // Redirect back to app
      return Response.redirect(new URL(storedRedirectTo, req.nextUrl.origin))
    }
  } catch (error) {
    console.error('[GitHub Callback] OAuth callback error:', error)
    console.error('[GitHub Callback] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return new Response(
      `Failed to complete GitHub authentication: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 },
    )
  }
}
