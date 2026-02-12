"use client";

import { FadeIn, Stagger, Typewriter } from "@/components/animations";
import { Sparkles, ArrowRight, Coffee, Loader2, RefreshCw } from "lucide-react";
import { CustomConnectButton } from "@/components/CustomConnectButton";
import { CreatorSearch } from "@/components/CreatorSearch";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useArcCaffeine } from "@/hooks/useArcCaffeine";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { useState, useEffect, useCallback } from "react";
import { getRandomCreators } from "@/lib/getCreators";

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

  // Discover Creators state
  const [creators, setCreators] = useState<string[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCreators = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setCreatorsLoading(true);

      try {
        // Server-side cache handles refresh - just fetch fresh data
        const randomCreators = await getRandomCreators(4);
        // Filter out current user from the list
        setCreators(randomCreators.filter((c) => c !== username));
      } catch (error) {
        console.error("Failed to fetch creators:", error);
      } finally {
        setCreatorsLoading(false);
        setRefreshing(false);
      }
    },
    [username],
  );

  useEffect(() => {
    if (isRegistered) {
      fetchCreators();
    }
  }, [isRegistered, fetchCreators]);

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
                  <div className="space-y-6">
                    {/* User Profile - Header with Quick Dashboard Access */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar Circle */}
                        <div className="relative group/avatar cursor-default shrink-0">
                          {/* Glow effect */}
                          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl group-hover/avatar:bg-green-500/30 transition-all duration-500" />

                          {/* Main Container */}
                          <div className="w-14 h-14 rounded-full bg-black/40 border border-white/10 flex items-center justify-center relative z-10 backdrop-blur-sm shadow-2xl">
                            <div className="w-full h-full rounded-full border-2 border-black/20 flex items-center justify-center bg-linear-to-br from-green-500/10 to-transparent">
                              <Coffee className="w-6 h-6 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                            </div>
                          </div>

                          {/* Status Indicator */}
                          <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-[#0a0a0a] rounded-full flex items-center justify-center z-20 border border-white/5">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                          </div>
                        </div>

                        {/* Username and Status */}
                        <div className="flex flex-col items-start gap-1">
                          <div className="inline-flex items-center gap-2">
                            <span className="text-xl font-black text-white tracking-tight">
                              @{username}
                            </span>
                            <span
                              className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-[8px] text-white font-bold shadow-lg shadow-blue-500/20"
                              title="Verified"
                            >
                              ✓
                            </span>
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/80" />
                            Live on Arc
                          </span>
                        </div>
                      </div>

                      {/* Quick Dashboard Link */}
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/8 transition-all group/dash"
                      >
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground group-hover/dash:text-foreground">
                          Dashboard
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover/dash:text-primary transition-transform group-hover/dash:translate-x-0.5" />
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/5" />

                    {/* Discover Creators List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Discover Creators
                        </h3>
                        <button
                          onClick={() => fetchCreators(true)}
                          disabled={refreshing}
                          className="p-1.5 hover:bg-white/5 rounded-lg transition text-muted-foreground hover:text-foreground disabled:opacity-50 cursor-pointer"
                          title="Refresh"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                          />
                        </button>
                      </div>

                      {creatorsLoading ? (
                        <div className="py-8 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
                        </div>
                      ) : creators.length === 0 ? (
                        <div className="py-8 text-center bg-white/2 rounded-2xl border border-white/5">
                          <p className="text-sm text-muted-foreground">
                            No other creators yet
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          {creators.slice(0, 4).map((creatorName, index) => {
                            // Generate a consistent pseudo-random color based on name
                            const colors = [
                              "from-blue-500/20 to-indigo-500/10 text-blue-400",
                              "from-purple-500/20 to-pink-500/10 text-purple-400",
                              "from-amber-500/20 to-orange-500/10 text-amber-400",
                              "from-emerald-500/20 to-teal-500/10 text-emerald-400",
                            ];
                            const colorClass =
                              colors[creatorName.length % colors.length];

                            return (
                              <Link
                                key={creatorName}
                                href={`/${creatorName}`}
                                className="group/item flex items-center gap-3 p-3 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/8 hover:border-white/12 transition-all duration-300 transform hover:-translate-y-0.5 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                <div
                                  className={`w-10 h-10 rounded-xl bg-linear-to-br ${colorClass.split(" ").slice(0, 2).join(" ")} flex items-center justify-center shrink-0 shadow-lg group-hover/item:scale-110 transition-transform duration-300`}
                                >
                                  <Coffee
                                    className={`w-4.5 h-4.5 ${colorClass.split(" ").pop()}`}
                                  />
                                </div>
                                <div className="flex-1 overflow-hidden text-left">
                                  <p className="font-semibold text-sm text-foreground/90 group-hover/item:text-primary transition-colors truncate">
                                    @{creatorName}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold opacity-60">
                                    View Profile
                                  </p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all duration-300 -translate-x-2 group-hover/item:translate-x-0">
                                  <ArrowRight className="w-4 h-4 text-primary" />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
                        aria-label="Username"
                      />
                      <textarea
                        placeholder="Short bio..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-primary focus:border-primary/50 outline-none transition-all resize-none h-24 text-sm"
                        aria-label="Bio"
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

      <FadeIn
        delay={1}
        duration={1.2}
        className="hidden md:flex absolute bottom-1 left-1/2 -translate-x-1/2 z-20"
      >
        <button
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
          }
          className="flex flex-col items-center gap-4 cursor-pointer group bg-transparent border-none p-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
          aria-label="Scroll to content"
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
        </button>
      </FadeIn>
    </section>
  );
}
