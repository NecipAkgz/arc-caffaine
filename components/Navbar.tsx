"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Coffee, ArrowRightLeft, Menu, X } from "lucide-react";
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
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition"
          >
            <Coffee className="w-6 h-6" />
            <span>ArcCaffeine</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block">
            <CreatorSearch variant="navbar" placeholder="Search creator..." />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setShowBridgeModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-linear-to-r from-primary/20 to-primary/10 border border-primary/30 hover:border-primary/50 hover:from-primary/30 hover:to-primary/20 transition-all duration-200 text-primary cursor-pointer btn-interactive"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Bridge</span>
            </button>
            {isRegistered && (
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition link-hover"
              >
                Dashboard
              </Link>
            )}
            <ConnectButton
              showBalance={false}
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
            />
          </div>

          {/* Mobile: Connect Button + Hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <ConnectButton
              showBalance={false}
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "avatar",
              }}
            />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors icon-btn"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-16 right-0 w-full max-w-sm h-[calc(100vh-4rem)] bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 space-y-6">
            {/* Mobile Search */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Search
              </p>
              <div className="[&>div]:w-full mb-14">
                <CreatorSearch
                  variant="navbar"
                  placeholder="Search creator..."
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Navigation
              </p>

              <button
                onClick={handleBridgeClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors text-left btn-interactive"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Bridge</p>
                  <p className="text-xs text-muted-foreground">
                    Transfer USDC to Arc
                  </p>
                </div>
              </button>

              {isRegistered && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors btn-interactive"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Coffee className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Dashboard</p>
                    <p className="text-xs text-muted-foreground">
                      Manage your profile
                    </p>
                  </div>
                </Link>
              )}
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
