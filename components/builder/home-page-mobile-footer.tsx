'use client'

import { GitHubStarsButton } from '@/components/github-stars-button'
import { Button } from '@/components/ui/button'
import { VERCEL_DEPLOY_URL } from '@/lib/coding-agent/constants'

type HomePageMobileFooterProps = {
  initialStars?: number
}

export function HomePageMobileFooter({ initialStars = 1056 }: HomePageMobileFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 p-3 shadow-md backdrop-blur md:hidden">
      <div className="flex items-center justify-between">
        <GitHubStarsButton initialStars={initialStars} />
        <Button
          asChild
          size="sm"
          className="h-9 px-3 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
        >
          <a href={VERCEL_DEPLOY_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
            <svg viewBox="0 0 76 65" className="h-3 w-3" fill="currentColor" aria-hidden="true">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            <span>Deploy</span>
          </a>
        </Button>
      </div>
    </div>
  )
}
