import { Loader2 } from 'lucide-react'

/**
 * Loading Component
 *
 * Displays a loading spinner while the page is loading.
 */
export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
