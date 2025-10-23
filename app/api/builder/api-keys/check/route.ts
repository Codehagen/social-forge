import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/coding-agent/session'
import prisma from '@/lib/prisma'
import { BuilderApiProvider } from '@prisma/client'

type Provider = 'openai' | 'gemini' | 'cursor' | 'anthropic' | 'aigateway'

// Map agents to their required providers
const AGENT_PROVIDER_MAP: Record<string, Provider | null> = {
  claude: 'anthropic',
  codex: 'aigateway', // Codex uses Vercel AI Gateway
  copilot: null, // Copilot uses user's GitHub token from their account
  cursor: 'cursor',
  gemini: 'gemini',
  opencode: 'openai', // OpenCode can use OpenAI or Anthropic, but primarily OpenAI
}

// Check if a model is an Anthropic model
function isAnthropicModel(model: string): boolean {
  const anthropicPatterns = ['claude', 'sonnet', 'opus']
  const lowerModel = model.toLowerCase()
  return anthropicPatterns.some((pattern) => lowerModel.includes(pattern))
}

// Check if a model is an OpenAI model
function isOpenAIModel(model: string): boolean {
  const openaiPatterns = ['gpt', 'openai']
  const lowerModel = model.toLowerCase()
  return openaiPatterns.some((pattern) => lowerModel.includes(pattern))
}

// Check if a model is a Gemini model
function isGeminiModel(model: string): boolean {
  const geminiPatterns = ['gemini']
  const lowerModel = model.toLowerCase()
  return geminiPatterns.some((pattern) => lowerModel.includes(pattern))
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agent = searchParams.get('agent')
    const model = searchParams.get('model')

    if (!agent) {
      return NextResponse.json({ error: 'Agent parameter is required' }, { status: 400 })
    }

    let provider = AGENT_PROVIDER_MAP[agent]
    if (provider === undefined) {
      return NextResponse.json({ error: 'Invalid agent' }, { status: 400 })
    }

    // Special handling for Copilot - check if user has GitHub token
    if (agent === 'copilot') {
      const session = await getServerSession()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Check if user has GitHub account connected
      const githubAccount = await prisma.account.findFirst({
        where: {
          userId: session.user.id,
          providerId: 'github',
        },
      })

      const hasKey = !!githubAccount

      return NextResponse.json({
        success: true,
        hasKey,
        provider: 'github',
        agentName: 'Copilot',
      })
    }

    // Override provider based on model for multi-provider agents
    if (model && (agent === 'cursor' || agent === 'opencode')) {
      if (isAnthropicModel(model)) {
        provider = 'anthropic'
      } else if (isGeminiModel(model)) {
        provider = 'gemini'
      } else if (isOpenAIModel(model)) {
        // For OpenAI models, prefer AI Gateway if available, otherwise use OpenAI
        provider = 'aigateway'
      }
      // For cursor with no recognizable pattern, keep the default 'cursor' provider
    }

    if (!provider) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    // Check if API key is available (either user's or system)
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userApiKey = await prisma.builderApiKey.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: provider as BuilderApiProvider,
        },
      },
    })

    // Check for system environment variable as fallback
    const systemKey = process.env[`${provider.toUpperCase()}_API_KEY`]
    const hasKey = !!userApiKey || !!systemKey

    return NextResponse.json({
      success: true,
      hasKey,
      provider,
      agentName: agent.charAt(0).toUpperCase() + agent.slice(1),
    })
  } catch (error) {
    console.error('Error checking API key:', error)
    return NextResponse.json({ error: 'Failed to check API key' }, { status: 500 })
  }
}
