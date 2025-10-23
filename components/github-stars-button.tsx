'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

interface GitHubStarsButtonProps {
  initialStars?: number
}

export function GitHubStarsButton({ initialStars = 1056 }: GitHubStarsButtonProps) {
  const [stars, setStars] = useState(initialStars)
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/github-stars')
      if (response.ok) {
        const data = await response.json()
        setStars(data.stars)
      }
    } catch (error) {
      console.error('Error fetching stars:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className="h-8 px-3 text-xs"
    >
      <Star className="h-3 w-3 mr-1" />
      {isLoading ? '...' : stars.toLocaleString()}
    </Button>
  )
}