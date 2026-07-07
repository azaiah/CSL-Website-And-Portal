"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Clock } from "lucide-react";

/**
 * Full-bleed hero. Uses public/hero.mp4 (desktop) + hero-mobile.mp4 with a
 * poster fallback. If no video files exist, the poster/navy gradient shows and
 * the section still looks intentional — never broken.
 */
export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOk, setVideoOk] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/hero.mp4", { method: "HEAD" })
      .then((res) => {
        if (active && res.ok) setVideoOk(true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-navy-deep">
      {/* Media layer */}
      <div className="absolute inset-0">
        {videoOk && (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/hero-poster.jpg"
          >
            {/* Mobile-first source, desktop override via media */}
            <source src="/hero-mobile.mp4" media="(max-width: 640px)" type="video/mp4" />
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        )}
        {/* Poster fallback image (shown if video absent) */}
        {!videoOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/hero-poster.jpg"
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        {/* Navy gradient overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(14,36,64,0.72) 0%, rgba(14,36,64,0.78) 40%, rgba(14,36,64,0.92) 100%)",
          }}
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="container-page relative z-10 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-light">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            HIPAA-Compliant Medical Courier
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
            Medical delivery Richmond trusts —{" "}
            <span className="text-gold">on time, every time.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            Capital Solutions &amp; Logistics provides HIPAA-compliant transport of
            pharmacy orders, lab specimens, and medical supplies across Greater
            Richmond — with chain-of-custody, temperature control, and proof of
            delivery on every run.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="btn-gold">
              Request a Pickup
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/services" className="btn-outline">
              Our Services
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/70">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" aria-hidden />
              STAT &amp; scheduled routes
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold" aria-hidden />
              Lloyd&apos;s of London cargo coverage
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
