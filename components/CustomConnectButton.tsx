import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ArrowRight } from 'lucide-react'

/**
 * Custom Connect Button Component
 *
 * Wraps RainbowKit's ConnectButton with custom styling.
 */
export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-bold transition shadow-lg hover:shadow-primary/25 flex items-center gap-2 cursor-pointer"
                  >
                    Connect Wallet <ArrowRight className="w-5 h-5" />
                  </button>
                )
              }
              return null
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
