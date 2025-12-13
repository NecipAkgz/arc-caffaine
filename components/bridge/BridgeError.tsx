'use client'

import { AlertCircle } from 'lucide-react'

interface BridgeErrorProps {
  error?: Error | null
  onRetry: () => void
}

/**
 * Bridge Error Component
 *
 * Displays error message and retry option when bridge fails.
 */
export function BridgeError({ error, onRetry }: BridgeErrorProps) {
  const formatError = (message: string) => {
    if (!message) return 'Unknown error occurred'
    let cleanMessage = message.split('Request Arguments:')[0]
    cleanMessage = cleanMessage.split('Details:')[0]
    return cleanMessage.replace(/^Error:\s*/, '').trim()
  }

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Bridge Failed</h3>
      <p className="text-zinc-400 mb-8 text-sm px-4">
        {formatError(error?.message || 'An unexpected error occurred')}
      </p>

      <button
        onClick={onRetry}
        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition-colors font-medium"
      >
        Try Again
      </button>
    </div>
  )
}
