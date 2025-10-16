export function getEnabledAuthProviders() {
  const providers = []

  // Check environment variables to see which providers are enabled
  if (process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID) {
    providers.push('github')
  }

  if (process.env.NEXT_PUBLIC_VERCEL_CLIENT_ID) {
    providers.push('vercel')
  }

  // Default to github if none configured
  return providers.length > 0 ? providers : ['github']
}