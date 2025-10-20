type SandboxCredentials = {
  token: string | null
  teamId: string | null
  projectId: string | null
  oidcToken: string | null
}

function decodeOidcPayload(token: string | undefined | null): Record<string, unknown> | null {
  if (!token) {
    return null
  }

  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = Buffer.from(padded, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

const OIDC_TOKEN =
  process.env.SANDBOX_VERCEL_OIDC_TOKEN ?? process.env.VERCEL_OIDC_TOKEN ?? process.env.VERCEL_DEPLOYMENT_TOKEN ?? null

const OIDC_PAYLOAD = decodeOidcPayload(OIDC_TOKEN)

function resolveFromPayload<T = string>(key: string): T | null {
  if (!OIDC_PAYLOAD) {
    return null
  }
  const value = OIDC_PAYLOAD[key]
  return (typeof value === 'string' && value.length > 0 ? (value as unknown as T) : null)
}

const SANDBOX_TOKEN =
  process.env.SANDBOX_VERCEL_TOKEN ??
  process.env.VERCEL_AUTH_TOKEN ??
  process.env.VERCEL_TOKEN ??
  OIDC_TOKEN ??
  null

const SANDBOX_TEAM_ID =
  process.env.SANDBOX_VERCEL_TEAM_ID ??
  process.env.VERCEL_TEAM_ID ??
  resolveFromPayload<string>('owner_id') ??
  resolveFromPayload<string>('team_id') ??
  null

const SANDBOX_PROJECT_ID =
  process.env.SANDBOX_VERCEL_PROJECT_ID ??
  process.env.VERCEL_PROJECT_ID ??
  resolveFromPayload<string>('project_id') ??
  resolveFromPayload<string>('project') ??
  null

export function getSandboxCredentials(): SandboxCredentials {
  return {
    token: SANDBOX_TOKEN,
    teamId: SANDBOX_TEAM_ID,
    projectId: SANDBOX_PROJECT_ID,
    oidcToken: OIDC_TOKEN,
  }
}

const projectCache = new Map<string, Promise<string | null>>()

async function fetchProjectId(slug: string, token: string, teamId: string | null): Promise<string | null> {
  const cacheKey = `${slug}:${teamId ?? ''}`
  if (projectCache.has(cacheKey)) {
    return projectCache.get(cacheKey)!
  }

  const promise = (async () => {
    try {
      const params = new URLSearchParams()
      if (teamId) {
        params.set('teamId', teamId)
      }
      const response = await fetch(`https://api.vercel.com/v9/projects/${slug}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json().catch(() => null)
      if (data && typeof data.id === 'string' && data.id.startsWith('prj_')) {
        return data.id as string
      }
    } catch {
      // Ignore and fall through to null
    }
    return null
  })()

  projectCache.set(cacheKey, promise)
  return promise
}

export async function resolveSandboxCredentials(): Promise<SandboxCredentials> {
  const base = getSandboxCredentials()
  let projectId = base.projectId

  if (projectId && !projectId.startsWith('prj_') && base.token) {
    const resolved = await fetchProjectId(projectId, base.token, base.teamId)
    if (resolved) {
      projectId = resolved
    }
  }

  return {
    ...base,
    projectId,
  }
}
