"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Coffee, ArrowRightLeft } from "lucide-react";
import { CreatorSearch } from "@/components/CreatorSearch";
import BridgeModal from "@/components/BridgeModal";

export function Navbar() {
  const [showBridgeModal, setShowBridgeModal] = useState(false);

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

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBridgeModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-linear-to-r from-primary/20 to-primary/10 border border-primary/30 hover:border-primary/50 hover:from-primary/30 hover:to-primary/20 transition-all duration-200 text-primary cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Bridge</span>
            </button>
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition"
            >
              Dashboard
            </Link>
            <ConnectButton
              showBalance={false}
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
            />
          </div>
        </div>
      </nav>

      <BridgeModal
        isOpen={showBridgeModal}
        onClose={() => setShowBridgeModal(false)}
        amount=""
      />
    </>
  );
}
