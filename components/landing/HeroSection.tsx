"use client";

import { FadeIn, Stagger, Typewriter } from "@/components/animations";
import { Sparkles, ArrowRight, Coffee, Loader2 } from "lucide-react";
import { CustomConnectButton } from "@/components/CustomConnectButton";
import { CreatorSearch } from "@/components/CreatorSearch";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useArcCaffeine } from "@/hooks/useArcCaffeine";
import { useRegisterForm } from "@/hooks/useRegisterForm";

export function HeroSection() {
  const { isConnected, address } = useAccount();
  const { isRegistered, username, checkingRegistration, checkedAddress } =
    useArcCaffeine();
  const {
    username: newUsername,
    setUsername,
    bio,
    setBio,
    loading,
    error,
    handleSubmit,
  } = useRegisterForm();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition - Typewriter */}
        <div className="mb-12 lg:mb-24">
          <Typewriter
            phrases={["Create once.", "Share everywhere.", "Earn forever."]}
          />
        </div>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <FadeIn delay={0.2}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md transition-colors hover:bg-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                  Arc Testnet Powered
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] md:leading-tight">
                Fuel Your <br />
                <span className="bg-linear-to-r from-amber-200 via-orange-400 to-amber-200 bg-clip-text text-transparent animate-gradient bg-size-[200%_auto]">
                  Creativity
                </span>
              </h1>
              <p className="mt-8 text-lg md:text-xl text-muted-foreground/90 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                Receive{" "}
                <strong className="text-foreground font-medium">USDC</strong>{" "}
                support directly to your wallet. Zero fees, fully on-chain, and
                designed for the future of creation.
              </p>
            </FadeIn>

            <Stagger
              initialDelay={0.6}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {[
                { label: "Instant Transfer", icon: "⚡" },
                { label: "Fully On-Chain", icon: "🛡️" },
                { label: "Cross-Chain", icon: "🌐" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-colors cursor-default backdrop-blur-sm"
                >
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </span>
                </div>
              ))}
            </Stagger>

            <FadeIn delay={0.8} direction="up">
              <div className="w-full max-w-lg mx-auto lg:mx-0 pt-4">
                <CreatorSearch
                  placeholder="Search for a creator... (e.g. Neco)"
                  variant="hero"
                />
              </div>
            </FadeIn>
          </div>

          <FadeIn
            delay={0.6}
            direction="left"
            className="w-full flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-lg">
              <div className="glass-card p-6 md:p-10 relative overflow-hidden backdrop-blur-2xl border border-white/10 bg-black/60 rounded-4xl shadow-2xl transition-all duration-500 hover:border-white/20">
                {!isConnected ? (
                  <div className="space-y-7 text-center flex flex-col items-center">
                    <div className="w-18 h-18 rounded-2xl bg-linear-to-tr from-primary/20 to-transparent flex items-center justify-center border border-primary/10 mb-2">
                      <Coffee className="w-9 h-9 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight mb-2">
                        Start Receiving
                      </h2>
                      <p className="text-muted-foreground max-w-xs mx-auto">
                        Connect your wallet to claim your unique creator link
                        instantly.
                      </p>
                    </div>
                    <div className="w-full max-w-[260px]">
                      <CustomConnectButton />
                    </div>
                  </div>
                ) : checkingRegistration ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-9 h-9 animate-spin text-primary/80" />
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">
                      Synced with Arc...
                    </p>
                  </div>
                ) : isRegistered ? (
                  <div className="space-y-9 text-center">
                    <div className="flex flex-col items-center gap-5">
                      {/* Avatar Circle */}
                      <div className="relative group/avatar cursor-default">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl group-hover/avatar:bg-green-500/30 transition-all duration-500" />

                        {/* Main Container */}
                        <div className="w-26 h-26 rounded-full bg-black/40 border border-white/10 flex items-center justify-center relative z-10 backdrop-blur-sm shadow-2xl">
                          <div className="w-full h-full rounded-full border-4 border-black/20 flex items-center justify-center bg-linear-to-br from-green-500/10 to-transparent">
                            <Coffee className="w-11 h-11 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                          </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="absolute bottom-1 right-1 w-7.5 h-7.5 bg-[#0a0a0a] rounded-full flex items-center justify-center z-20 border border-white/5">
                          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        </div>
                      </div>

                      <div className="space-y-3 max-w-[260px]">
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 mx-auto transition-colors hover:bg-white/10 hover:border-white/10">
                          <span className="text-2xl font-bold text-white tracking-tight">
                            @{username}
                          </span>
                          <span
                            className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-blue-500 text-[9px] text-white font-bold shadow-lg shadow-blue-500/20"
                            title="Verified"
                          >
                            ✓
                          </span>
                        </div>
                        <p className="text-muted-foreground/80 font-medium leading-relaxed">
                          Your profile is publicly visible and active on Arc
                          Testnet.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      className="group/btn relative flex items-center justify-center gap-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-4 rounded-xl text-lg font-bold transition-all hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]"
                    >
                      Go to Dashboard{" "}
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-8">
                      <h2 className="text-xl font-bold">Claim Handle</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Free registration via Arc Testnet
                      </p>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="username"
                        value={newUsername}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 font-medium text-sm"
                        required
                      />
                      <textarea
                        placeholder="Short bio..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none transition-all resize-none h-24 text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2 mt-2 text-base"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Create Profile"
                      )}
                    </button>
                    {error && (
                      <p className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded-lg">
                        {error}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Refined Scroll Indicator */}
      <FadeIn
        delay={2}
        duration={1.2}
        className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 cursor-pointer group"
        onClick={() =>
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
        }
      >
        <div className="relative w-6 h-10 rounded-full border-2 border-white/10 flex justify-center p-2 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <div className="w-1 h-1.5 bg-primary rounded-full animate-bounce" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[12px] tracking-[0.3em] font-bold uppercase text-muted-foreground/40 group-hover:text-primary transition-colors">
            Explore
          </span>
          <div className="w-px h-6 bg-linear-to-b from-primary/50 to-transparent group-hover:h-8 transition-all duration-500" />
        </div>
      </FadeIn>
    </section>
  );
}
