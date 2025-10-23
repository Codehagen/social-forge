import { NextResponse } from 'next/server'
import { getGitHubStars } from '@/lib/github-stars'

export async function GET() {
  try {
    const stars = await getGitHubStars()
    return NextResponse.json({ stars })
  } catch (error) {
    console.error('Error fetching GitHub stars:', error)
    return NextResponse.json({ stars: 1056 }) // Fallback
  }
}
