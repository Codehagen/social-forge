import { Vercel } from '@vercel/sdk'

interface CreateProjectParams {
  name: string
  gitRepository?: {
    type: string
    repo: string
  }
  framework?: string
}

interface CreateProjectResponse {
  id: string
  name: string
  accountId: string
  createdAt: number
  updatedAt: number
  targets: Record<string, any>
  latestDeployments: any[]
  alias: string[]
  projectSettings: {
    framework: string | null
    buildCommand: string | null
    devCommand: string | null
    installCommand: string | null
    outputDirectory: string | null
  }
}

/**
 * Create a Vercel project using the official SDK
 * @param accessToken - Vercel OAuth access token
 * @param teamId - Team ID (for teams) or User ID (for personal accounts)
 * @param params - Project creation parameters
 * @returns The created project data
 */
export async function createProject(
  accessToken: string,
  teamId: string,
  params: CreateProjectParams,
): Promise<CreateProjectResponse | undefined> {
  try {
    const vercel = new Vercel({
      bearerToken: accessToken,
    })

    // Use the SDK as shown in the Vercel docs
    const requestBody: Record<string, unknown> = {
      name: params.name,
      gitRepository: params.gitRepository
        ? {
            type: params.gitRepository.type,
            repo: params.gitRepository.repo,
          }
        : undefined,
    }

    // Only add framework if it's provided
    if (params.framework) {
      requestBody.framework = params.framework
    }

    const response = await vercel.projects.createProject({
      teamId, // Pass teamId at the top level
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      requestBody: requestBody as any,
    })

    console.log('Successfully created Vercel project')
    return response as unknown as CreateProjectResponse
  } catch (error) {
    console.error('Error creating Vercel project:', error)

    // Check for permission errors
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403) {
      console.error('Permission denied - user may need proper team permissions in Vercel')
    }

    return undefined
  }
}
