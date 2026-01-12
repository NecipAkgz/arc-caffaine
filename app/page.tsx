"use client";

import { FloatingParticles } from "@/components/animations";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ShowcaseSection } from "@/components/landing/ShowcaseSection";
import { CTASection } from "@/components/landing/CTASection";

/**
 * Landing Page Component
 *
 * Premium scrolling landing page.
 * Replaces the previous single-screen architecture with a rich, multi-section
 * experience exploring the dApp value proposition.
 */
export default function Home() {
  return (
    <>
      {/* Global Background Elements - Fixed but below footer */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.05),transparent_70%)]" />
      </div>

      {/* Floating Elements (Persistent) */}
      <FloatingParticles />
      <LiveActivityFeed />

      {/* Page Content - Ordered Sections */}
      <div className="relative bg-transparent">
        <HeroSection />

        <div className="space-y-32 pb-32">
          <HowItWorksSection />
          <ShowcaseSection />
          <CTASection />
        </div>
      </div>
    </>
  );
}
