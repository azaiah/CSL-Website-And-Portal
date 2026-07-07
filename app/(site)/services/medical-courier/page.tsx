import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Thermometer,
  Timer,
  FileCheck2,
  ShieldCheck,
  Biohazard,
  PackageCheck,
  Repeat,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading, CheckItem, CtaBand } from "@/components/ui";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Medical Courier Richmond VA — HIPAA Specimen & Pharmacy Transport",
  description:
    "HIPAA-compliant medical courier in Richmond, VA. Lab specimen transport with chain-of-custody, temperature-controlled and HazMat handling, STAT & scheduled routes, and proof of delivery. On-time, every time.",
};

const capabilities = [
  {
    icon: ShieldCheck,
    title: "HIPAA-compliant handling",
    body: "Every driver is HIPAA/HITECH trained. Protected health information stays secure from pickup to signature.",
  },
  {
    icon: ClipboardCheck,
    title: "Documented chain-of-custody",
    body: "Sealed, labeled, and tracked. We log every hand-off so your specimens and medications are always accounted for.",
  },
  {
    icon: Thermometer,
    title: "Temperature-controlled transport",
    body: "Ambient, refrigerated, and frozen handling with cold-chain awareness to protect specimen and medication integrity.",
  },
  {
    icon: Biohazard,
    title: "HazMat & biohazard trained",
    body: "OSHA Bloodborne Pathogens (29 CFR 1910.1030) and DOT HazMat (49 CFR 171–180) trained for safe, compliant transport.",
  },
  {
    icon: Timer,
    title: "STAT & on-demand routes",
    body: "Urgent same-hour pickups when clinical turnaround matters — plus dependable recurring scheduled routes.",
  },
  {
    icon: FileCheck2,
    title: "Proof of delivery",
    body: "Time-stamped confirmation on every run, so your team always knows exactly where a delivery stands.",
  },
];

const useCases = [
  "Clinical lab specimen pickups and reference-lab runs",
  "Retail, hospital, and long-term-care pharmacy delivery",
  "STAT diagnostic transport with strict turnaround windows",
  "Medical supply and equipment distribution",
  "Cold-chain vaccine and biologic transport",
  "Inter-facility transfers between clinics and campuses",
];

const cargoTypes = [
  "Lab specimens (blood, tissue, cultures)",
  "Prescription medications & controlled-substance-ready workflows",
  "Vaccines & temperature-sensitive biologics",
  "Medical & surgical supplies",
  "Diagnostic samples & documents",
  "Chemotherapy & hazardous drugs (trained handling)",
];

export default function MedicalCourierPage() {
  return (
    <>
      <PageHeader
        eyebrow="Flagship service"
        title="HIPAA-compliant medical courier in Richmond, VA"
        lead="Pharmacy orders, lab specimens, and medical supplies transported with chain-of-custody, temperature control, and proof of delivery — on time, every time."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Medical Courier" },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/contact" className="btn-gold">
            Request a Pickup
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="/compliance" className="btn-outline">
            Our Compliance Wall
          </Link>
        </div>
      </PageHeader>

      {/* Capabilities grid */}
      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Capabilities"
            title="Built for clinical-grade reliability"
            lead="Medical deliveries carry real stakes. Our process is engineered so specimens stay viable, medications stay secure, and deadlines are met."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05}>
              <div className="card h-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-deep text-gold">
                  <c.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-navy-deep">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* On-time guarantee band */}
      <Section tone="navy">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="eyebrow">The on-time guarantee</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                &ldquo;On-time, every time&rdquo; isn&apos;t a slogan — it&apos;s the standard
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/75">
                A late specimen can mean a repeated draw, a delayed diagnosis, or a
                missed dose. We plan routes around clinical turnaround windows, hold
                capacity for STAT calls, and confirm every delivery — so your team
                never has to wonder.
              </p>
              <ul className="mt-8 space-y-3 text-white/80">
                <li className="flex items-start gap-3">
                  <Timer className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                  STAT and same-hour dispatch for urgent transport
                </li>
                <li className="flex items-start gap-3">
                  <Repeat className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                  Consistent drivers on recurring scheduled routes
                </li>
                <li className="flex items-start gap-3">
                  <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                  Time-stamped proof of delivery on every run
                </li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-lg font-semibold text-white">
                What we transport
              </h3>
              <ul className="mt-5 grid gap-3">
                {cargoTypes.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Use cases */}
      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <SectionHeading
                eyebrow="Who we serve"
                title="A trusted extension of your clinical team"
                lead="Pharmacies, clinical labs, hospitals, and healthcare facilities across Greater Richmond rely on CSL for the deliveries they can't afford to get wrong."
              />
              <ul className="mt-8 space-y-4">
                {useCases.map((u) => (
                  <CheckItem key={u}>{u}</CheckItem>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card h-full">
              <p className="eyebrow">How it works</p>
              <ol className="mt-5 space-y-6">
                {[
                  {
                    t: "Tell us the route",
                    d: "Share pickup, drop-off, urgency, and any handling requirements. We confirm the plan and SLA.",
                  },
                  {
                    t: "We pick up, sealed & logged",
                    d: "Credentialed drivers collect your items with chain-of-custody and the right temperature handling.",
                  },
                  {
                    t: "Compliant transport",
                    d: "Direct, monitored transport that protects specimen integrity and PHI at every step.",
                  },
                  {
                    t: "Delivered with proof",
                    d: "On-time hand-off with time-stamped confirmation back to your team.",
                  },
                ].map((step, i) => (
                  <li key={step.t} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-navy-deep">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-navy-deep">{step.t}</h4>
                      <p className="mt-1 text-sm text-ink/70">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </Section>

      <CtaBand
        title="Move your specimens and medications with confidence"
        subtitle="Set up a route or request a STAT pickup — we'll respond fast."
        secondaryHref="/compliance"
        secondaryLabel="Review Compliance"
      />
    </>
  );
}
