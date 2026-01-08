"use client";

import { FadeIn, Stagger } from "@/components/animations";
import { Coffee, Share2, Wallet } from "lucide-react";

const steps = [
  {
    icon: <Wallet className="w-8 h-8 text-primary" />,
    title: "Connect Wallet",
    description:
      "Securely link your EOA or AA wallet. No registration fee, just gas for the Arc Testnet.",
    color: "bg-blue-500/10",
  },
  {
    icon: <Share2 className="w-8 h-8 text-amber-400" />,
    title: "Share your Link",
    description:
      "Get a unique URL like arccaffeine.xyz/yourname and share it with your community.",
    color: "bg-amber-500/10",
  },
  {
    icon: <Coffee className="w-8 h-8 text-emerald-400" />,
    title: "Receive Support",
    description:
      "Supporters can send USDC directly to your wallet. No middleman, no platform cuts.",
    color: "bg-emerald-500/10",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-linear-to-b from-transparent via-white/2 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              How it Works
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Three simple steps to start receiving support.
            </p>
          </FadeIn>
        </div>

        <Stagger className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="glass-card p-8 group hover:border-primary/50 transition-all duration-500 hover:-translate-y-2"
            >
              <div
                className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
              >
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Step counter */}
              <div className="absolute top-6 right-8 text-6xl font-black text-white/5 group-hover:text-primary/10 transition-colors">
                0{index + 1}
              </div>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
