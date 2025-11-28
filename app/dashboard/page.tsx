'use client'

import { useAccount, usePublicClient } from 'wagmi'
import { useArcCaffeine } from '@/hooks/useArcCaffeine'
import { useEffect, useState } from 'react'
import { formatEther } from 'viem'
import { ARC_CAFFEINE_ABI, CONTRACT_ADDRESS } from '@/lib/abi'
import { Loader2, Copy, ExternalLink, DollarSign, History, Coffee, User, Edit } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import BioModal from '@/components/BioModal'

export default function Dashboard() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { username, withdraw, updateBio, loading: actionLoading, getBalance, isRegistered, checkingRegistration } = useArcCaffeine()
  const router = useRouter()
  const [balance, setBalance] = useState<string>('0')
  const [memos, setMemos] = useState<any[]>([])
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isBioModalOpen, setIsBioModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!address || !publicClient) {
          setLoading(false)
          return
      }
      try {
        const bal = await getBalance()
        setBalance(formatEther(bal))

        const data = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARC_CAFFEINE_ABI,
            functionName: 'getMemos',
            args: [address]
        })
        // Sort by timestamp desc
        const sorted = [...data].sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp))
        setMemos(sorted)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [address, publicClient, getBalance])

  // Fetch bio separately and only once or when address changes
  useEffect(() => {
      const fetchBio = async () => {
          if (!address || !publicClient) return
          try {
            const bioData = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: ARC_CAFFEINE_ABI,
                functionName: 'bios',
                args: [address]
            })
            setBio(bioData || '')
          } catch (e) {
              console.error("Failed to fetch bio", e)
          }
      }
      fetchBio()
  }, [address, publicClient])

  const handleCopy = () => {
    if (username) {
        const url = `${window.location.origin}/${username}`
        navigator.clipboard.writeText(url)
        toast.success("Link copied!")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSaveBio = async (newBio: string) => {
    // BioModal handles the toast notifications
    await updateBio(newBio)
    setBio(newBio)
  }

  const handleWithdraw = async () => {
    const promise = withdraw().then(async () => {
        // Refresh balance
        const bal = await getBalance()
        setBalance(formatEther(bal))
    })

    toast.promise(promise, {
        loading: 'Withdrawing funds...',
        success: 'Withdrawal successful! 💸',
        error: 'Withdraw failed. Please try again.'
    })
  }


  useEffect(() => {
      if (!loading && !checkingRegistration && !isRegistered) {
          router.push('/')
      }
  }, [loading, checkingRegistration, isRegistered, router])

  if (loading || checkingRegistration) {
      return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  if (!isRegistered) {
      return null
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, @{username}</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg border border-border">
            <span className="text-sm text-muted-foreground px-2">Your Page:</span>
            <code className="text-sm font-mono bg-background px-2 py-1 rounded">{username ? `${window.location.origin}/${username}` : '...'}</code>
            <button onClick={handleCopy} className="p-2 hover:bg-background rounded transition cursor-pointer" title="Copy Link">
                {copied ? <span className="text-green-500 text-xs font-bold">Copied!</span> : <Copy className="w-4 h-4" />}
            </button>
            <Link href={`/${username}`} target="_blank" className="p-2 hover:bg-background rounded transition">
                <ExternalLink className="w-4 h-4" />
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-secondary/30 border border-border rounded-2xl p-6 flex flex-col justify-between h-full">
            <div>
                <h3 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-5 h-5" /> Current Balance
                </h3>
                <p className="text-4xl font-bold mt-4">{parseFloat(balance).toFixed(4)} <span className="text-lg text-muted-foreground">USDC</span></p>
            </div>
            <button
                onClick={handleWithdraw}
                disabled={actionLoading || parseFloat(balance) <= 0}
                className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Withdraw Funds'}
            </button>
        </div>

        {/* Stats Card (Placeholder) */}
        <div className="bg-secondary/30 border border-border rounded-2xl p-6">
            <h3 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                <Coffee className="w-5 h-5" /> Total Coffees
            </h3>
            <p className="text-4xl font-bold mt-4">{memos.length}</p>
            <p className="text-sm text-muted-foreground mt-2">Lifetime supporters</p>
        </div>

        {/* Profile Settings */}
        <div className="bg-secondary/30 border border-border rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-5 h-5" /> Profile Bio
                </h3>
                <button
                    onClick={() => setIsBioModalOpen(true)}
                    className="p-2 hover:bg-background rounded-lg transition text-muted-foreground hover:text-foreground"
                    title="Edit Bio"
                >
                    <Edit className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 bg-background/50 rounded-lg p-4 border border-border/50">
                {bio ? (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{bio}</p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">No bio set yet. Click edit to add one.</p>
                )}
            </div>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2"><History className="w-6 h-6" /> Recent Support</h2>
        <div className="grid gap-4">
            {memos.length === 0 ? (
                <p className="text-muted-foreground">No coffees received yet. Share your link!</p>
            ) : (
                memos.map((memo, i) => (
                    <div key={i} className="bg-secondary/20 border border-border rounded-xl p-4 flex gap-4 items-start">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Coffee className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold">{memo.name || 'Anonymous'}</h4>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-bold text-green-500">+{formatEther(memo.amount)} USDC</span>
                                    <span className="text-xs text-muted-foreground">{new Date(Number(memo.timestamp) * 1000).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{memo.message}</p>
                            <p className="text-xs text-muted-foreground mt-2 font-mono">From: {memo.from.slice(0,6)}...{memo.from.slice(-4)}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      <BioModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        initialBio={bio}
        onSave={handleSaveBio}
      />
    </div>
  )
}
