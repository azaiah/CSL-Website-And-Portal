"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Clock, MapPin } from "lucide-react";
import { company } from "@/lib/company-brain";

/**
 * Full-bleed cinematic hero. Uses public/hero.mp4 (desktop) + hero-mobile.mp4
 * with a poster fallback. If no video files exist, a layered navy + gold-glow +
 * grid + grain treatment stands on its own — the section never looks broken.
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
    // `svh` (small viewport height) instead of `vh`: on phones the address bar
    // hides and shows while you scroll, which changes `vh` and makes the whole
    // hero resize mid-scroll. `svh` stays fixed, so nothing jumps.
    <section className="grain relative flex min-h-[92svh] items-center overflow-hidden bg-navy-deep">
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
            <source src="/hero-mobile.mp4" media="(max-width: 640px)" type="video/mp4" />
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        )}
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
      </div>

      {/* Decorative background layers */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,36,64,0.74) 0%, rgba(14,36,64,0.80) 45%, rgba(14,36,64,0.94) 100%)",
        }}
        aria-hidden
      />
      <div className="bg-grid-dark mask-fade absolute inset-0 opacity-70" aria-hidden />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 55% at 82% 8%, rgba(193,154,62,0.28), transparent 60%), radial-gradient(40% 50% at 5% 90%, rgba(22,54,92,0.7), transparent 60%)",
        }}
        aria-hidden
      />
      {/* Floating soft orbs */}
      <div
        className="absolute right-[12%] top-[18%] h-56 w-56 rounded-full bg-gold/20 blur-3xl animate-float"
        aria-hidden
      />
      <div
        className="absolute left-[8%] bottom-[14%] h-64 w-64 rounded-full bg-navy/40 blur-3xl animate-float-slow"
        aria-hidden
      />

      {/* Content */}
      <div className="container-page relative z-10 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-light backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            HIPAA-Compliant Medical Courier · Richmond, VA
          </motion.span>

          <h1 className="mt-7 text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-[3.75rem]">
            When Every Second Counts —{" "}
            <span className="text-gradient-gold">
              Virginia&apos;s Most Reliable Delivery and Medical Courier. On
              Time, Every Time.
            </span>
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

          {/* Trust chips */}
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
            {[
              { icon: Clock, label: "STAT & scheduled routes" },
              { icon: ShieldCheck, label: "Lloyd's of London cargo coverage" },
              { icon: MapPin, label: `~${company.serviceArea.radiusMiles}-mile Richmond radius` },
            ].map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-white/75 backdrop-blur-sm"
              >
                <item.icon className="h-4 w-4 text-gold" aria-hidden />
                {item.label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom fade into next section */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white/0"
        aria-hidden
      />
    </section>
  );
}
