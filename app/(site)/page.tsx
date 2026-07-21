import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  BadgeCheck,
  Handshake,
  MapPin,
} from "lucide-react";
import { Hero } from "@/components/hero";
import { Section, SectionHeading, CtaBand, Stat } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { serviceIcons } from "@/components/service-icons";
import { serviceLines, trustBadges, company } from "@/lib/company-brain";

const whyCsl = [
  {
    icon: Clock,
    title: "On-time, every time",
    body: "STAT, same-day, and scheduled routes built around clinical turnaround windows — with proof of delivery on every run.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & confidential",
    body: "HIPAA-compliant handling, chain-of-custody, and OSHA bloodborne-pathogen and HazMat training protect your patients and product.",
  },
  {
    icon: BadgeCheck,
    title: "Reliable & credentialed",
    body: "USDOT authority (MC in progress), TWIC, TSA PreCheck, and Lloyd's of London cargo coverage — a carrier you can stand behind.",
  },
  {
    icon: Handshake,
    title: "A professional partnership",
    body: "We operate as an extension of your team — consistent drivers, clear communication, and accountability you can rely on.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Trust badges strip */}
      <div className="border-b border-navy/10 bg-surface">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-3 gap-y-3 py-6">
          <span className="mr-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
            Credentialed &amp; Compliant
          </span>
          {trustBadges.map((b) => (
            <span
              key={b}
              className="rounded-full border border-navy/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy shadow-sm"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Services overview */}
      <Section tone="light" pattern="dots">
        <Reveal>
          <SectionHeading
            eyebrow="What we do"
            title="Five service lines, one standard of trust"
            lead="Medical courier is our flagship. Around it we run four supporting lines so healthcare and business clients can rely on a single, compliant partner."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceLines.map((s, i) => {
            const Icon = serviceIcons[s.slug];
            return (
              <Reveal key={s.slug} delay={i * 0.05}>
                <Link
                  href={`/services/${s.slug}`}
                  className="card-hover group flex h-full flex-col"
                >
                  <span className="icon-tile h-12 w-12 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-navy-deep">
                    {s.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
                    {s.short}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Why CSL */}
      <Section tone="surface">
        <Reveal>
          <SectionHeading
            eyebrow="Why CSL"
            title="A courier healthcare teams trust with what matters"
            lead="Missed deliveries have clinical consequences. We built CSL to remove that risk — compliant, dependable, and genuinely professional."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {whyCsl.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <div className="card-hover flex h-full gap-4">
                <span className="icon-tile-gold h-11 w-11 shrink-0">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-navy-deep">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    {item.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="card mt-14 grid grid-cols-2 gap-8 p-8 sm:grid-cols-4">
          <Stat value="2023" label="Founded in Richmond" />
          <Stat value={`~${company.serviceArea.radiusMiles} mi`} label="Greater Richmond radius" />
          <Stat value="24/7" label="STAT & on-demand" />
          <Stat value="100%" label="Compliance-first culture" />
        </div>
      </Section>

      {/* Service area */}
      <Section tone="navy">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="eyebrow">Service area</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Proudly serving Greater Richmond, Virginia
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/75">
                {company.serviceArea.note} We cover Richmond, Henrico,
                Chesterfield, Hanover, and the surrounding communities — with the
                infrastructure and credentials to expand as our clients grow.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact" className="btn-gold">
                  Check your route
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/compliance" className="btn-outline">
                  See our credentials
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <MapPin className="h-7 w-7" aria-hidden />
              </span>
              <div>
                <p className="text-sm uppercase tracking-wide text-gold-light">
                  Based in
                </p>
                <p className="text-xl font-semibold text-white">
                  Richmond, Virginia
                </p>
                <p className="mt-1 text-sm text-white/70">
                  ~{company.serviceArea.radiusMiles}-mile service radius, built to expand
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
