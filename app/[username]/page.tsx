'use client'

import { useArcCaffeine } from '@/hooks/useArcCaffeine'
import { useEffect, useState } from 'react'
import { ARC_CAFFEINE_ABI, CONTRACT_ADDRESS } from '@/lib/abi'
import { Loader2, Coffee, MessageSquare, Heart, Zap, Wallet, ArrowRight, Sparkles } from 'lucide-react'
import { useParams } from 'next/navigation'
import { createPublicClient, http, formatEther, formatUnits } from 'viem'
import { arcTestnet } from '@/lib/chain'
import { toast } from 'sonner'
import { useAccount, useReadContract } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import BridgeModal from '@/components/BridgeModal'
import { ARC_TESTNET } from '@/lib/bridge-kit/chains'
import { cn } from '@/lib/utils'

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const

export default function PublicProfile() {
  const params = useParams()
  const username = params.username as string
  const { isConnected, address } = useAccount()
  const { buyCoffee, loading: actionLoading } = useArcCaffeine()

  const [recipientAddress, setRecipientAddress] = useState<`0x${string}` | null>(null)
  const [memos, setMemos] = useState<any[]>([])
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [amount, setAmount] = useState('5')
  const [newMemoKey, setNewMemoKey] = useState(0)
  const [showBridgeModal, setShowBridgeModal] = useState(false)

  // Fetch Balance
  const { data: arcUsdcBalance } = useReadContract({
    address: ARC_TESTNET.usdcAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET.id,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    }
  })

  const formattedBalance = arcUsdcBalance ? formatUnits(arcUsdcBalance as bigint, 6) : '0.00'

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

            const bioData = await client.readContract({
                address: CONTRACT_ADDRESS,
                abi: ARC_CAFFEINE_ABI,
                functionName: 'bios',
                args: [addr]
            })
            setBio(bioData || '')

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

  const handleSupport = async (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!recipientAddress) return

      const promise = buyCoffee(username, name, message, amount)
          .then(async () => {
              const client = createPublicClient({
                  chain: arcTestnet,
                  transport: http()
              })
              await new Promise(resolve => setTimeout(resolve, 1500))
              const data = await client.readContract({
                  address: CONTRACT_ADDRESS,
                  abi: ARC_CAFFEINE_ABI,
                  functionName: 'getMemos',
                  args: [recipientAddress]
              })
              const sorted = [...data].sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp))
              setNewMemoKey(prev => prev + 1)
              setMemos(sorted)
              setName('')
              setMessage('')
              setAmount('5')
          })
          .catch((error) => {
              console.error('Transaction failed:', error)
              throw error
          })

      toast.promise(promise, {
          loading: 'Brewing coffee... ☕',
          success: 'Coffee bought successfully! Thank you for your support! 🎉',
          error: 'Transaction failed. Please try again.'
      })
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    </div>
  )

  if (!recipientAddress) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
            <Coffee className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-muted-foreground">The user @{username} does not exist or has not set up their profile yet.</p>
        </div>
      )
  }

  return (
    <div className="bg-[#0c0a09] text-foreground selection:bg-primary/20">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-[#0c0a09] to-[#0c0a09] pointer-events-none -z-10" />

      <div className="relative max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT COLUMN: Profile & Donation (Sticky on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">

            {/* Profile Card */}
            <div className="bg-[#1c1917]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="w-28 h-28 bg-linear-to-br from-primary/20 to-primary/5 rounded-full mx-auto flex items-center justify-center mb-6 ring-4 ring-[#0c0a09] shadow-xl">
                  <Coffee className="w-14 h-14 text-primary drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">@{username}</h1>
                {bio && <p className="text-zinc-400 mt-3 leading-relaxed">{bio}</p>}
              </div>
            </div>

            {/* Donation Card */}
            <div className="bg-[#1c1917]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Support
                </h2>
                {isConnected && (
                   <div className="flex items-center gap-2 text-xs font-medium bg-black/40 px-3 py-1.5 rounded-full border border-white/5 text-zinc-400">
                      <Wallet className="w-3 h-3" />
                      <span>{Number(formattedBalance).toFixed(2)} USDC</span>
                   </div>
                )}
              </div>

              <form onSubmit={handleSupport} className="space-y-5">
                {/* Presets */}
                <div className="grid grid-cols-3 gap-3">
                    {['1', '3', '5'].map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={cn(
                              "relative py-3 rounded-xl border transition-all duration-200 font-medium overflow-hidden group",
                              amount === val
                                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10 text-zinc-400"
                            )}
                        >
                            <span className="relative z-10">{val} USDC</span>
                            {amount === val && <div className="absolute inset-0 bg-linear-90-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />}
                        </button>
                    ))}
                </div>

                {/* Custom Amount */}
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors">
                      $
                    </div>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-4 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-lg font-medium placeholder:text-zinc-600"
                        placeholder="Custom amount"
                        required
                        min="0.1"
                        step="0.1"
                    />
                </div>

                {/* Name & Message */}
                <div className="space-y-3">
                  <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder:text-zinc-600"
                      placeholder="Name or @twitter (optional)"
                  />
                  <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all min-h-[100px] resize-none placeholder:text-zinc-600"
                      placeholder="Say something nice..."
                  />
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  {isConnected ? (
                      <>
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full bg-linear-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-primary-foreground py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
                        >
                            {actionLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                Support {amount} USDC
                                <Heart className="w-4 h-4 group-hover:scale-110 transition-transform fill-current" />
                              </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowBridgeModal(true)}
                            className="w-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Zap className="w-4 h-4" />
                            Need USDC? Bridge Funds
                        </button>
                      </>
                  ) : (
                      <ConnectButton.Custom>
                          {({ openConnectModal, mounted }) => (
                              <button
                                  type="button"
                                  onClick={openConnectModal}
                                  disabled={!mounted}
                                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                              >
                                  Connect Wallet to Support
                              </button>
                          )}
                      </ConnectButton.Custom>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Feed */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Recent Messages
              </h3>
              <span className="text-sm text-zinc-500">{memos.length} supporters</span>
            </div>

            <div className="space-y-4 lg:max-h-[calc(100vh-30rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 transition-colors">
                {memos.length === 0 ? (
                    <div className="bg-[#1c1917]/30 border border-white/5 rounded-3xl p-12 text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-zinc-600" />
                      </div>
                      <p className="text-zinc-400 text-lg">No messages yet.</p>
                      <p className="text-zinc-600 text-sm mt-1">Be the first to support @{username}!</p>
                    </div>
                ) : (
                    memos.map((memo, i) => (
                        <div
                            key={`${memo.timestamp}-${memo.from}`}
                            className={cn(
                              "bg-[#1c1917]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 transition-all hover:bg-[#1c1917]/60 hover:border-white/10 group",
                              i === 0 && newMemoKey > 0 && "animate-in slide-in-from-top-4 duration-500"
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-linear-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center border border-white/5">
                                    <span className="font-bold text-zinc-400 text-sm">
                                      {(memo.name?.trim() || 'A')[0].toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-bold text-zinc-200">{memo.name?.trim() || 'Anonymous'}</p>
                                    <p className="text-xs text-zinc-500">{new Date(Number(memo.timestamp) * 1000).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                                  +{formatEther(memo.amount)} USDC
                                </div>
                            </div>
                            <p className="text-zinc-300 leading-relaxed pl-[52px]">
                              {memo.message?.trim() || <span className="text-zinc-600 italic">No message</span>}
                            </p>
                        </div>
                    ))
                )}
            </div>
          </div>

        </div>
      </div>

      <BridgeModal
          isOpen={showBridgeModal}
          onClose={() => setShowBridgeModal(false)}
          amount={amount}
      />
    </div>
  )
}
