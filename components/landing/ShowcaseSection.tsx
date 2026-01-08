"use client";

import { FadeIn, Stagger } from "@/components/animations";
import {
  Layers,
  Zap,
  Shield,
  Globe,
  MousePointer2,
  Smartphone,
  Coffee,
} from "lucide-react";

const features = [
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "Instant Settlement",
    description:
      "Transactions on Arc Testnet settle in seconds. No waiting for days to access your funds.",
  },
  {
    icon: <Shield className="w-6 h-6 text-blue-400" />,
    title: "On-Chain Registry",
    description:
      "Usernames are registered on-chain, ensuring ownership and permanence within the ecosystem.",
  },
  {
    icon: <Globe className="w-6 h-6 text-emerald-400" />,
    title: "Cross-Chain Ready",
    description:
      "Built with future expansion in mind, preparing for a multi-chain creator economy.",
  },
  {
    icon: <Smartphone className="w-6 h-6 text-purple-400" />,
    title: "Mobile Optimized",
    description:
      "A seamless experience whether you are managing your profile or supporting from your phone.",
  },
  {
    icon: <MousePointer2 className="w-6 h-6 text-amber-400" />,
    title: "One-Click Support",
    description:
      "Streamlined donation flow designed to minimize friction for your supporters.",
  },
  {
    icon: <Layers className="w-6 h-6 text-rose-400" />,
    title: "Modular Architecture",
    description:
      "Built with modern primitives like Wagmi and Viem for maximum stability and speed.",
  },
];

export function ShowcaseSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="right">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Powerful Features <br />
              <span className="text-primary">For Modern Creators</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              We've stripped away the complexity of traditional finance. No
              banks, no hidden fees, just pure support.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="shrink-0 mt-1">{feature.icon}</div>
                  <div>
                    <h4 className="font-bold text-lg">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="left" className="relative">
            {/* Mockup visual */}
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="glass-card h-full w-full flex items-center justify-center p-8 border-white/10">
                <div className="w-full h-full rounded-2xl bg-black/40 border border-white/5 flex flex-col p-6 space-y-4">
                  {/* Fake UI bits */}
                  <div className="h-12 w-1/2 bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-40 w-full bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Coffee className="w-12 h-12 text-primary opacity-50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <div className="h-4 w-4/5 bg-white/5 rounded" />
                  </div>
                  <div className="mt-auto h-12 w-full bg-primary/20 rounded-xl" />
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 glass-card px-6 py-4 border-primary/30 shadow-2xl shadow-primary/20 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Received</p>
                    <p className="font-bold text-lg">5.00 USDC</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
