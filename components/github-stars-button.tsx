'use client'

import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { GITHUB_REPO_URL } from '@/lib/coding-agent/constants'

interface GitHubStarsButtonProps {
  initialStars?: number
}

export function GitHubStarsButton({ initialStars = 1056 }: GitHubStarsButtonProps) {
  const formattedStars = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(initialStars)

  return (
    <Button asChild variant="ghost" size="sm" className="h-8 px-2 sm:px-3 gap-1.5">
      <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center">
        <Star className="h-3.5 w-3.5" />
        <span className="text-sm">{formattedStars}</span>
      </a>
    </Button>
  )
}
