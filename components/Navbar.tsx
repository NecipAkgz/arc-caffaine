'use client'

import Link from 'next/link'
import { useWallet } from './WalletProvider'
import { Coffee, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { isConnected, connect, address, disconnect } = useWallet()

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition">
          <Coffee className="w-6 h-6" />
          <span>ArcCaffeine</span>
        </Link>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition">
                Dashboard
              </Link>
              <button
                onClick={disconnect}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium transition"
              >
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </button>
            </>
          ) : (
            <button
              onClick={connect}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium transition shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
