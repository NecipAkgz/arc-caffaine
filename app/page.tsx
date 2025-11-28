'use client'

import { useWallet } from '@/components/WalletProvider'
import { useArcCaffeine } from '@/hooks/useArcCaffeine'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Coffee, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function Home() {
  const { isConnected, connect } = useWallet()
  const { isRegistered, register, loading, username } = useArcCaffeine()
  const [newUsername, setNewUsername] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername) return
    try {
      await register(newUsername)
      router.push('/dashboard')
    } catch (e) {
      toast.error("Registration failed. Check console.")
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-3xl space-y-8">
        <div className="space-y-4">
          <div className="inline-block p-4 rounded-full bg-primary/10 mb-4 animate-pulse">
            <Coffee className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Fuel Your Creativity
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accept support in USDC on the Arc Testnet.
            A decentralized way for creators to receive appreciation.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          {!isConnected ? (
            <button
              onClick={connect}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-bold transition shadow-lg hover:shadow-primary/25 flex items-center gap-2"
            >
              Connect Wallet <ArrowRight className="w-5 h-5" />
            </button>
          ) : isRegistered ? (
             <div className="space-y-4">
               <p className="text-lg">Welcome back, <span className="font-bold text-primary">@{username}</span>!</p>
               <Link
                 href="/dashboard"
                 className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-bold transition"
               >
                 Go to Dashboard <ArrowRight className="w-5 h-5" />
               </Link>
             </div>
          ) : (
            <form onSubmit={handleRegister} className="w-full max-w-md space-y-4 bg-secondary/50 p-8 rounded-2xl border border-border backdrop-blur-sm">
              <h2 className="text-2xl font-bold">Create your Profile</h2>
              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="username" className="text-sm font-medium text-muted-foreground">Choose a Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-background border border-input rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
