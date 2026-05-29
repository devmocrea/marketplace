// ─────────────────────────────────────────────────────────────
// app/(launchpad)/launchpad/page.tsx — Launchpad Discovery
// ─────────────────────────────────────────────────────────────

import { Rocket, Calendar, Zap, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LaunchpadPage() {
  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-20 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest mb-6">
          <Rocket size={14} />
          Coming Soon to Afristore
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-white via-brand-200 to-terracotta-400 bg-clip-text text-transparent">
          The Launchpad
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          The gateway for African creators to launch exclusive collections, timed drops, and generative art directly to the Stellar ecosystem.
        </p>
      </div>

      {/* Primary Features Grid */}
      <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-3 mb-24">
        {[
          {
            title: "Exclusive Drops",
            desc: "Access limited edition primary sales from top African digital artists.",
            icon: <Zap className="text-brand-400" />,
            status: "Coming Soon"
          },
          {
            title: "Artist Pipeline",
            desc: "A streamlined path from creation to instant marketplace listing.",
            icon: <Star className="text-mint-400" />,
            status: "Development"
          },
          {
            title: "Launch Metrics",
            desc: "Real-time analytics for mints, volume, and community engagement.",
            icon: <Calendar className="text-terracotta-400" />,
            status: "Planning"
          }
        ].map((feat, i) => (
          <div 
            key={i}
            className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {feat.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              {feat.desc}
            </p>
            <span className="text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full bg-white/5 border border-white/5 text-white/30">
              {feat.status}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto rounded-[3rem] bg-warm-gradient p-1 px-1">
        <div className="bg-midnight-950 rounded-[2.9rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-brand-500/5 pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Ready to launch your legacy?</h2>
          <p className="text-white/60 mb-10 max-w-xl mx-auto">
            We&apos;re currently selecting the first cohort of artists for our Genesis Launch. Join the waitlist to be notified when we go live.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 rounded-2xl bg-brand-500 text-white font-bold hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2">
              Apply as Creator <ArrowRight size={18} />
            </button>
            <Link 
              href="/"
              className="px-8 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
