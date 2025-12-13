import { Coffee } from 'lucide-react'
import Link from 'next/link'

/**
 * Not Found Component
 *
 * Displays a 404 error page when a route is not found.
 */
export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
          <Coffee className="w-16 h-16 text-primary opacity-50" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-primary">404</h1>
          <h2 className="text-2xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-bold transition shadow-lg hover:shadow-primary/25"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
