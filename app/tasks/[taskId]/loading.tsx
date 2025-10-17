export default function Loading() {
  return (
    <div className="flex-1 bg-background">
      <div className="p-3">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  )
}
