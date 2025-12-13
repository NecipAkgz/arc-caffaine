'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

/**
 * Error Component
 *
 * Displays an error message when something goes wrong in the application.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-secondary/50 border border-border rounded-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold transition"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-lg font-bold transition text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
