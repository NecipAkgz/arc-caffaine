'use client'

import { CheckCircle2, ExternalLink } from 'lucide-react'
import { getChainByWagmiId } from '@/lib/bridge-kit/chains'

interface BridgeCompleteProps {
  txHash?: string
  sourceChainId?: number
  onClose: () => void
}

/**
 * Bridge Complete Component
 *
 * Displays success message and transaction details after a successful bridge.
 */
export function BridgeComplete({ txHash, sourceChainId, onClose }: BridgeCompleteProps) {
  // Get the source chain's explorer URL
  const sourceChain = sourceChainId ? getChainByWagmiId(sourceChainId) : null
  const explorerUrl = sourceChain?.explorerUrl || 'https://testnet.arcscan.app'

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Bridge Complete!</h3>
      <p className="text-zinc-400 mb-8">
        Your funds have been successfully bridged to Arc Testnet.
      </p>

      <div className="space-y-3">
        {txHash && (
          <a
            href={`${explorerUrl}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition-colors font-medium"
          >
            View on Explorer <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={onClose}
          className="w-full bg-white text-black hover:bg-zinc-200 py-3 rounded-xl transition-colors font-bold"
        >
          Close
        </button>
      </div>
    </div>
  )
}
