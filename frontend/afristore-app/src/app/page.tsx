// ─────────────────────────────────────────────────────────────
// app/page.tsx — Afristore Landing Page (Redesigned)
// Immersive African culture-themed homepage
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWalletContext } from "@/context/WalletContext";
import { FeaturedListings } from "@/components/FeaturedListings";
import {
  ArrowRight,
  Wallet,
  Shield,
  Globe,
  Palette,
  Sparkles,
  Users,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

// ── Hero background images from Unsplash ─────────────────────
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=1920&q=80",
  "https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=1920&q=80",
  "https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=1920&q=80",
];

// ── Stats Counter Animation Hook ─────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Intersection Observer Hook ───────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function HomePage() {
  const router = useRouter();
  const { isConnected, connect, isConnecting } = useWalletContext();
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const statsView = useInView(0.3);

  // Auto-rotate hero images
  useEffect(() => {
    setHeroLoaded(true);
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const artists = useCountUp(120, 2200, statsView.inView);
  const artworks = useCountUp(850, 2400, statsView.inView);
  const volume = useCountUp(45000, 2600, statsView.inView);

  return (
    <div className="min-h-screen bg-brand-50">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Full-screen immersive
      ═══════════════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[700px] max-h-[1000px] overflow-hidden">
        {/* Background images with crossfade */}
        {HERO_IMAGES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
            style={{ opacity: heroIdx === i ? 1 : 0 }}
          >
            <Image
              src={src}
              alt="African art"
              fill
              className="object-cover"
              priority={i === 0}
              unoptimized
            />
          </div>
        ))}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-hero-gradient" />

        {/* Animated pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="kente-border w-full h-full" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 text-center">
          {/* Tagline badge */}


          {/* Main Heading */}
          <h1
            className={`max-w-4xl font-display font-bold leading-[1.08] tracking-tight transition-all duration-1000 delay-200 ${heroLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
              }`}
          >
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white">
              Where African Art
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-2 shimmer-text">
              Meets the Blockchain
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-white/70 leading-relaxed font-light transition-all duration-1000 delay-500 ${heroLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
              }`}
          >
            Discover, collect, and trade authentic African masterpieces.
            Every piece is verified on-chain, ensuring provenance and empowering
            artists across the continent.
          </p>


          {/* CTA Buttons */}
          <div
            className={`mt-10 flex flex-col sm:flex-row items-center gap-4 transition-all duration-1000 delay-700 ${heroLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
              }`}
          >
            <button
              onClick={() => {
                if (!isConnected) connect();
                else router.push('/explore');
              }}
              disabled={isConnecting}
              className="group relative flex items-center gap-3 rounded-xl bg-brand-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/40 disabled:opacity-60 transition-all duration-300 animate-pulse-glow"
            >
              <Wallet size={20} />
              {isConnected
                ? "Explore Marketplace"
                : isConnecting
                  ? "Connecting…"
                  : "Get Started"}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <Link
              href="#featured"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-medium text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              <Palette size={20} />
              Browse Art
            </Link>
          </div>

          {/* Hero image indicators */}
          <div className="mt-12 flex items-center gap-2">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${heroIdx === i
                  ? "w-8 bg-brand-400"
                  : "w-3 bg-white/30 hover:bg-white/50"
                  }`}
              />
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <ChevronDown size={18} className="animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRIBAL STRIP DIVIDER
      ═══════════════════════════════════════════════════════ */}
      <div className="tribal-strip" />

      {/* ═══════════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════════ */}
      <section
        ref={statsView.ref}
        className="relative bg-midnight-900 py-16 overflow-hidden"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 mudcloth-bg opacity-50" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                value: artists,
                suffix: "+",
                label: "African Artists",
                icon: Users,
              },
              {
                value: artworks,
                suffix: "+",
                label: "Artworks Listed",
                icon: Palette,
              },
              {
                value: volume,
                suffix: " XLM",
                label: "Trading Volume",
                icon: TrendingUp,
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`glass-card rounded-2xl p-8 transition-all duration-700 ${statsView.inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
                  }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <stat.icon
                  size={28}
                  className="mx-auto mb-3 text-brand-400"
                />
                <p className="text-3xl sm:text-4xl font-display font-bold text-white">
                  {stat.value.toLocaleString()}
                  <span className="text-brand-400">{stat.suffix}</span>
                </p>
                <p className="mt-2 text-sm text-white/50 tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          AFRICAN PATTERN DIVIDER
      ═══════════════════════════════════════════════════════ */}
      <div className="african-divider bg-brand-50" />

      {/* ═══════════════════════════════════════════════════════
          FEATURED LISTINGS
      ═══════════════════════════════════════════════════════ */}
      <div id="featured" className="bg-brand-50">
        <FeaturedListings />
      </div>

      {/* ═══════════════════════════════════════════════════════
          AFRICAN PATTERN DIVIDER
      ═══════════════════════════════════════════════════════ */}
      <div className="african-divider bg-brand-50" />

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════ */}
      <HowItWorksSection />

      {/* ═══════════════════════════════════════════════════════
          CULTURAL MISSION
      ═══════════════════════════════════════════════════════ */}
      <CulturalMissionSection />

      {/* ═══════════════════════════════════════════════════════
          NEWSLETTER / CTA
      ═══════════════════════════════════════════════════════ */}
      <FinalCTASection
        isConnected={isConnected}
        connect={connect}
        isConnecting={isConnecting}
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// HOW IT WORKS
// ═════════════════════════════════════════════════════════════
function HowItWorksSection() {
  const sectionView = useInView(0.2);

  const steps = [
    {
      icon: Wallet,
      title: "Connect Wallet",
      desc: "Link your Freighter wallet to the Stellar network in one click. Secure, decentralized, and yours.",
      color: "from-brand-500 to-terracotta-500",
      num: "01",
    },
    {
      icon: Palette,
      title: "Discover & Collect",
      desc: "Browse curated African artworks — from Ndebele patterns to Maasai beadwork, every piece has a story.",
      color: "from-terracotta-500 to-terracotta-600",
      num: "02",
    },
    {
      icon: Shield,
      title: "Verified Provenance",
      desc: "Every transaction is recorded on Stellar's blockchain, ensuring authenticity and transparent ownership.",
      color: "from-mint-500 to-mint-600",
      num: "03",
    },
    {
      icon: Globe,
      title: "Empower Artists",
      desc: "Support creators directly. Artists receive payments instantly with minimal fees on the Stellar network.",
      color: "from-earth-light to-earth-dark",
      num: "04",
    },
  ];

  return (
    <section ref={sectionView.ref} className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-brand-500 font-semibold text-sm tracking-widest uppercase mb-3">
            ✦ Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-midnight-900">
            How <span className="text-brand-500">Afristore</span> Works
          </h2>
          <p className="mt-4 text-gray-500 text-base leading-relaxed">
            From wallet connection to owning a piece of African heritage — the
            journey is seamless, secure, and powered by Stellar.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`group relative rounded-2xl bg-gray-50 p-7 hover:bg-white hover:shadow-xl hover:shadow-brand-100/50 transition-all duration-500 border border-transparent hover:border-brand-100 ${sectionView.inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
                }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Step number */}
              <span className="absolute top-5 right-5 text-5xl font-display font-bold text-brand-100 group-hover:text-brand-200 transition-colors">
                {step.num}
              </span>

              {/* Icon */}
              <div
                className={`mb-5 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} text-white shadow-lg`}
              >
                <step.icon size={24} />
              </div>

              <h3 className="text-lg font-display font-bold text-midnight-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════
// CULTURAL MISSION
// ═════════════════════════════════════════════════════════════
function CulturalMissionSection() {
  const sectionView = useInView(0.2);

  return (
    <section
      ref={sectionView.ref}
      className="relative py-20 md:py-28 overflow-hidden mudcloth-bg"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <div
            className={`transition-all duration-700 ${sectionView.inView
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-8"
              }`}
          >
            <p className="text-brand-400 font-semibold text-sm tracking-widest uppercase mb-4">
              ✦ Our Mission
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
              Preserving African Heritage,{" "}
              <span className="text-brand-400">One Artwork at a Time</span>
            </h2>
            <p className="mt-6 text-white/60 text-base sm:text-lg leading-relaxed">
              Afristore was born from a deep conviction: African art deserves a
              global stage built on fairness and transparency. From the bronze
              sculptures of Benin to the vibrant Tingatinga paintings of
              Tanzania, every piece listed on our platform carries the DNA of
              centuries-old traditions.
            </p>
            <p className="mt-4 text-white/50 text-base leading-relaxed">
              By leveraging Stellar&apos;s blockchain technology, we ensure that
              every sale is transparent, every artist is fairly compensated, and
              every collector receives a verifiably authentic piece of Africa&apos;s
              rich cultural tapestry.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <div className="w-2 h-2 rounded-full bg-mint-400" />
                Artist-first economics
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <div className="w-2 h-2 rounded-full bg-brand-400" />
                On-chain provenance
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <div className="w-2 h-2 rounded-full bg-terracotta-400" />
                Cultural preservation
              </div>
            </div>
          </div>

          {/* Image grid */}
          <div
            className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-300 ${sectionView.inView
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-8"
              }`}
          >
            <div className="space-y-4">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden corner-accent">
                <Image
                  src="https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=500&h=667&fit=crop"
                  alt="African sculpture"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=500&h=500&fit=crop"
                  alt="African textile art"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=500&h=500&fit=crop"
                  alt="African beadwork"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden corner-accent">
                <Image
                  src="https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=500&h=667&fit=crop"
                  alt="African painting"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════
// FINAL CTA
// ═════════════════════════════════════════════════════════════
function FinalCTASection({
  isConnected,
  connect,
  isConnecting,
}: {
  isConnected: boolean;
  connect: () => void;
  isConnecting: boolean;
}) {
  const router = useRouter();
  const ctaView = useInView(0.3);

  return (
    <>
      <div className="tribal-strip" />
      <section
        ref={ctaView.ref}
        className="relative py-24 md:py-32 bg-midnight-900 overflow-hidden"
      >
        {/* Background accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-terracotta-500/5 blur-3xl" />

        <div
          className={`relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center transition-all duration-700 ${ctaView.inView
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
            }`}
        >
          <div className="adinkra-pattern">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
              Ready to Own a Piece of{" "}
              <span className="shimmer-text">African Heritage?</span>
            </h2>
          </div>
          <p className="mt-6 text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Join a growing community of collectors and artists celebrating
            Africa&apos;s rich cultural legacy through blockchain-powered art.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (!isConnected) connect();
                else router.push('/explore');
              }}
              disabled={isConnecting}
              className="group flex items-center gap-3 rounded-xl bg-brand-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/35 disabled:opacity-60 transition-all duration-300"
            >
              <Wallet size={20} />
              {isConnected
                ? "Go to Marketplace"
                : isConnecting
                  ? "Connecting…"
                  : "Connect Wallet & Start"}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white hover:border-white/25 transition-all duration-300"
            >
              <Palette size={20} />
              List Your Art
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-white/30">
            <div className="flex items-center gap-2">
              <Shield size={14} />
              <span>Secured by Stellar</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Globe size={14} />
              <span>IPFS Stored</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Wallet size={14} />
              <span>Freighter Compatible</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Re-export useInView for sub-components
function useInView2(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}
