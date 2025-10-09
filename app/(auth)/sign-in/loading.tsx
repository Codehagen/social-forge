import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster innloggingsskjema…</span>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="ml-auto h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
