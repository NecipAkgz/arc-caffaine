"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Coffee, ArrowRightLeft, Menu, X, ArrowRight } from "lucide-react";
import { CreatorSearch } from "@/components/CreatorSearch";
import BridgeModal from "@/components/BridgeModal";
import { useArcCaffeine } from "@/hooks/useArcCaffeine";

export function Navbar() {
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isRegistered } = useArcCaffeine();

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleBridgeClick = () => {
    setIsMobileMenuOpen(false);
    setShowBridgeModal(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-white/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Logo Section */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 hover:opacity-100 transition-all active:scale-95 shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-colors">
              <Coffee className="w-5.5 h-5.5 text-primary drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            </div>
            <span className="text-xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
              ArcCaffeine
            </span>
          </Link>

          {/* Middle: Search - Simplified for Navbar */}
          <div className="hidden lg:block flex-1 max-w-md">
            <CreatorSearch variant="navbar" placeholder="Quick search..." />
          </div>

          {/* Right Section: Navigation & Wallet */}
          <div className="flex items-center gap-3">
            {/* Desktop Navigation Group */}
            <div className="hidden md:flex items-center gap-3 mr-2">
              <button
                onClick={() => setShowBridgeModal(true)}
                className="group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-300 hover:border-primary/50 hover:bg-white/8 cursor-pointer shadow-lg hover:shadow-primary/10"
              >
                {/* Animated Inner Glow */}
                <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <ArrowRightLeft className="w-4 h-4 text-primary transition-transform group-hover:rotate-180 duration-700" />
                <span className="text-xs font-black uppercase tracking-widest text-foreground/90 group-hover:text-primary transition-colors">
                  Bridge
                </span>

                {/* Subtle Shimmer effect */}
                <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>

              {isRegistered && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-all"
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Wallet & Mobile Toggle */}
            <div className="flex items-center gap-2">
              <ConnectButton
                showBalance={false}
                accountStatus={{
                  smallScreen: "avatar",
                  largeScreen: "full",
                }}
              />

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to push content down below fixed nav */}
      <div className="h-20" />

      {/* Modern Mobile Menu Panel */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          isMobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop with extreme blur */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sliding Panel */}
        <div
          className={`absolute top-0 right-0 w-[85%] max-w-sm h-full bg-background/95 backdrop-blur-2xl border-l border-white/5 shadow-[-10px_0_40px_-10px_rgba(0,0,0,0.5)] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full pt-24 px-6 pb-8">
            <div className="space-y-8">
              {/* Mobile Search */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
                  Search
                </span>
                <div className="mt-4 [&>div]:w-full">
                  <CreatorSearch
                    variant="navbar"
                    placeholder="Search creators..."
                    onNavigate={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </div>

              {/* Navigation Group */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
                  Actions
                </span>

                <button
                  onClick={handleBridgeClick}
                  className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-primary/5 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ArrowRightLeft className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground">Bridge</p>
                      <p className="text-xs text-muted-foreground">
                        Transfer to Arc
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                {isRegistered && (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-primary/5 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">Dashboard</p>
                        <p className="text-xs text-muted-foreground">
                          Manage profile
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                )}
              </div>
            </div>

            {/* Footer-like Branding at bottom of menu */}
            <div className="mt-auto pt-8 border-t border-white/5 text-center">
              <div className="flex items-center justify-center gap-2 opacity-20 grayscale">
                <Coffee className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">
                  ArcCaffeine v1.1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BridgeModal
        isOpen={showBridgeModal}
        onClose={() => setShowBridgeModal(false)}
        amount=""
      />
    </>
  );
}
