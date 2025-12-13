'use client'

import { useAccount } from 'wagmi'
import { useArcCaffeine } from '@/hooks/useArcCaffeine'
import { useRegisterForm } from '@/hooks/useRegisterForm'
import { Coffee, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { CustomConnectButton } from '@/components/CustomConnectButton'

/**
 * Landing Page Component
 *
 * Premium full-screen homepage with no-scroll design.
 * Features animated gradient background and glassmorphism UI elements.
 */
export default function Home() {
  const { isConnected, address } = useAccount()
  const { isRegistered, username, checkingRegistration, checkedAddress } = useArcCaffeine()
  const {
    username: newUsername,
    setUsername,
    bio,
    setBio,
    loading,
    handleSubmit,
  } = useRegisterForm()

  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-mesh">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_50%)] animate-pulse-slow" />
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by Arc Testnet</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
                <span className="block text-foreground">Fuel Your</span>
                <span className="block bg-linear-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent animate-gradient">
                  Creativity
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
                Accept support in <span className="text-primary font-semibold">USDC</span> on the Arc Testnet.
                <br />
                <span className="text-foreground/80">A decentralized way for creators to receive appreciation.</span>
              </p>
            </div>

            {/* Highlights */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <span className="text-sm font-medium text-foreground">⚡ Instant Transfers</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <span className="text-sm font-medium text-foreground">🔒 Secure & Private</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <span className="text-sm font-medium text-foreground">🌐 Cross-Chain</span>
              </div>
            </div>
            {/* Features */}

          </div>

          {/* Right Side - Action Card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {!isConnected ? (
                <div className="glass-card p-8 space-y-6">
                  <div className="text-center space-y-4">
                    <div className="inline-flex p-4 rounded-2xl bg-primary/10 backdrop-blur-sm">
                      <Coffee className="w-12 h-12 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Get Started</h2>
                      <p className="text-muted-foreground">Connect your wallet to begin your creator journey</p>
                    </div>
                  </div>
                  <CustomConnectButton />
                </div>
              ) : checkingRegistration || (isConnected && (!address || address !== checkedAddress)) ? (
                <div className="glass-card p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Checking your profile...</p>
                  </div>
                </div>
              ) : isRegistered ? (
                <div className="glass-card p-8 space-y-6">
                  <div className="text-center space-y-4">
                    <div className="inline-flex p-4 rounded-2xl bg-green-500/10 backdrop-blur-sm">
                      <Coffee className="w-12 h-12 text-green-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
                      <p className="text-lg">
                        <span className="text-muted-foreground">Hey there, </span>
                        <span className="font-bold text-primary">@{username}</span>
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                  >
                    Go to Dashboard <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Create Your Profile</h2>
                    <p className="text-sm text-muted-foreground">Join the creator economy on Arc</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium text-foreground">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        placeholder="yourcreatorname"
                        value={newUsername}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium text-foreground">
                        Bio <span className="text-muted-foreground">(Optional)</span>
                      </label>
                      <textarea
                        id="bio"
                        placeholder="Tell the world about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none h-24"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-xl font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Profile
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
