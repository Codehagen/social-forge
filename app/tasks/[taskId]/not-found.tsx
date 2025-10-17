import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto p-3">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Task Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The task you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button asChild>
              <Link href="/builder">Go to Builder</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
