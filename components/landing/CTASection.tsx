"use client";

import { FadeIn } from "@/components/animations";
import { Coffee, ArrowRight } from "lucide-react";
import { CustomConnectButton } from "@/components/CustomConnectButton";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useArcCaffeine } from "@/hooks/useArcCaffeine";

export function CTASection() {
  const { isConnected } = useAccount();
  const { isRegistered } = useArcCaffeine();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <FadeIn>
          <div className="glass-card border-primary/20 bg-black/40 backdrop-blur-xl p-12 md:p-16 rounded-[2.5rem] text-center space-y-8 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />

            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-2">
              <Coffee className="w-10 h-10 text-primary" />
            </div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Ready to brew your <br />
              <span className="bg-linear-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent animate-gradient">
                creator journey?
              </span>
            </h2>

            <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto">
              Join the decentralized community on Arc Testnet. Claim your unique
              profile and start receiving support today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              {!isConnected ? (
                <CustomConnectButton />
              ) : isRegistered ? (
                <Link
                  href="/dashboard"
                  className="group flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-5 rounded-2xl text-xl font-bold transition-all hover:scale-105 shadow-xl shadow-primary/20"
                >
                  Enter Dashboard{" "}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="group flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-5 rounded-2xl text-xl font-bold transition-all hover:scale-105 shadow-xl shadow-primary/20"
                >
                  Claim Username{" "}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
