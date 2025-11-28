'use client'


import { useArcCaffeine } from '@/hooks/useArcCaffeine'
import { useEffect, useState } from 'react'
import { ARC_CAFFEINE_ABI, CONTRACT_ADDRESS } from '@/lib/abi'
import { Loader2, Coffee, MessageSquare, Heart } from 'lucide-react'
import { useParams } from 'next/navigation'
import { createPublicClient, http } from 'viem'
import { arcTestnet } from '@/lib/chain'
import { toast } from 'sonner'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function PublicProfile() {
  const params = useParams()
  const username = params.username as string
  const { isConnected } = useAccount()
  const { buyCoffee, loading: actionLoading } = useArcCaffeine()

  const [recipientAddress, setRecipientAddress] = useState<string | null>(null)
  const [memos, setMemos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [amount, setAmount] = useState('5') // Default 5 USDC

  useEffect(() => {
    const fetchData = async () => {
      const client = createPublicClient({
          chain: arcTestnet,
          transport: http()
      })

      try {
        const addr = await client.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARC_CAFFEINE_ABI,
            functionName: 'addresses',
            args: [username]
        })

        if (addr && addr !== '0x0000000000000000000000000000000000000000') {
            setRecipientAddress(addr)

            const data = await client.readContract({
                address: CONTRACT_ADDRESS,
                abi: ARC_CAFFEINE_ABI,
                functionName: 'getMemos',
                args: [addr]
            })
            const sorted = [...data].sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp))
            setMemos(sorted)
        } else {
            setRecipientAddress(null)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [username])

  const handleSupport = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!recipientAddress) return
      try {
          await buyCoffee(username, name, message, amount)
          // Refresh memos
          toast.success("Coffee bought successfully!")
          window.location.reload()
      } catch (e) {
          toast.error("Transaction failed")
      }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  if (!recipientAddress) {
      return <div className="text-center p-10 text-xl">User @{username} not found.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Profile & Donate */}
        <div className="space-y-6">
            <div className="bg-secondary/30 border border-border rounded-2xl p-8 text-center space-y-4">
                <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                    <Coffee className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">@{username}</h1>
                <p className="text-muted-foreground">Creating on Arc Testnet</p>
            </div>

            <div className="bg-secondary/50 border border-border rounded-2xl p-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-red-500" /> Buy me a coffee</h2>
                <form onSubmit={handleSupport} className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {['1', '3', '5'].map((val) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setAmount(val)}
                                className={`py-2 rounded-lg border transition ${amount === val ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-secondary'}`}
                            >
                                {val} USDC
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-background border border-input rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Amount"
                            required
                            min="0.1"
                            step="0.1"
                        />
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background border border-input rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Name or @twitter (optional)"
                    />
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-background border border-input rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                        placeholder="Say something nice..."
                    />

                    {isConnected ? (
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Support ${amount} USDC`}
                        </button>
                    ) : (
                        <ConnectButton.Custom>
                            {({
                                openConnectModal,
                                mounted,
                            }) => {
                                const ready = mounted;
                                return (
                                    <button
                                        type="button"
                                        onClick={openConnectModal}
                                        disabled={!ready}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        Connect Wallet to Support
                                    </button>
                                );
                            }}
                        </ConnectButton.Custom>
                    )}
                </form>
            </div>
        </div>

        {/* Right: Feed */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Recent Messages</h3>
            <div className="space-y-4">
                {memos.length === 0 ? (
                    <p className="text-muted-foreground italic">No messages yet. Be the first to support!</p>
                ) : (
                    memos.map((memo, i) => (
                        <div key={i} className="bg-secondary/20 border border-border rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-primary">{memo.name || 'Anonymous'}</span>
                                <span className="text-xs text-muted-foreground">{new Date(Number(memo.timestamp) * 1000).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm">{memo.message}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  )
}
