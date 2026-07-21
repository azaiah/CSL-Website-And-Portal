import type { Metadata } from "next";
import Link from "next/link";
import { Target, Compass, HeartHandshake, MapPin, Phone, Mail } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading, CtaBand, Stat } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { Logo } from "@/components/logo";
import { company } from "@/lib/company-brain";

export const metadata: Metadata = {
  title: "About CSL — Richmond's Compliance-First Medical Courier",
  description:
    "Founded in 2023, Capital Solutions & Logistics is a Richmond, VA medical & pharmaceutical courier built on compliance, reliability, and service integrity. Led by Darren Lewis, Managing Member & Director of Operations.",
};

const values = [
  {
    icon: Target,
    title: "Service integrity",
    body: "We do what we say — every pickup, every delivery, every time. Reliability isn't a feature; it's the whole promise.",
  },
  {
    icon: Compass,
    title: "Compliance-first",
    body: "HIPAA, OSHA, and DOT standards are built into how we operate, not bolted on after the fact.",
  },
  {
    icon: HeartHandshake,
    title: "A genuine partnership",
    body: "We act as an extension of your team — professional, communicative, and invested in your outcomes.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About CSL"
        title="Built in Richmond to move healthcare with integrity"
        lead="Capital Solutions & Logistics exists to make medical delivery something clinical teams never have to worry about — compliant, dependable, and professional to the core."
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      {/* Story */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <div>
              <p className="eyebrow">Our story</p>
              <h2 className="mt-3 text-3xl font-semibold text-navy-deep sm:text-4xl">
                Founded in 2023 on a simple standard: on-time, every time
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink/75">
                <p>
                  Capital Solutions &amp; Logistics was founded in 2023 to bring a
                  higher standard of reliability and compliance to medical and
                  pharmaceutical delivery in Greater Richmond. We saw how much rides
                  on a single specimen or medication arriving on time — and how often
                  that trust was treated casually.
                </p>
                <p>
                  So we built CSL differently: credentialed from the start, trained to
                  federal safety standards, and insured through Lloyd&apos;s of London.
                  Around our flagship medical-courier service we added freight,
                  facilities, workforce, and secure storage — so healthcare and
                  business clients can rely on one accountable partner.
                </p>
                <p>
                  Today we operate across a roughly {company.serviceArea.radiusMiles}-mile radius around Richmond,
                  built to expand as our clients grow — carrying the same
                  compliance-first culture into every mile.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card h-fit bg-surface">
              <p className="eyebrow">Mission</p>
              <p className="mt-3 text-xl font-semibold leading-snug text-navy-deep">
                &ldquo;{company.tagline}&rdquo;
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink/70">
                To be the medical courier and logistics partner Richmond&apos;s
                healthcare community trusts completely — reliable, compliant, and
                professional in everything we carry.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-navy/10 pt-6">
                <Stat value="2023" label="Founded" />
                <Stat value={`~${company.serviceArea.radiusMiles} mi`} label="Service radius" />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Values */}
      <Section tone="surface">
        <Reveal>
          <SectionHeading
            eyebrow="What we stand for"
            title="The standards behind every delivery"
            align="center"
          />
        </Reveal>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.05}>
              <div className="card h-full text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl icon-tile">
                  <v.icon className="h-7 w-7" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-navy-deep">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Leadership */}
      <Section tone="navy">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="eyebrow">Leadership</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                {company.contact.name}
              </h2>
              <p className="mt-2 text-lg font-medium text-gold-light">
                {company.contact.title}
              </p>
              <p className="mt-5 text-lg leading-relaxed text-white/75">
                Darren leads CSL&apos;s operations with a hands-on commitment to
                service integrity — setting the compliance standards, building the
                routes, and holding the team to the &ldquo;on-time, every time&rdquo;
                promise that defines the company.
              </p>
              <div className="mt-8 flex flex-col gap-3 text-sm text-white/80 sm:flex-row sm:gap-8">
                <a href={company.contact.phoneHref} className="inline-flex items-center gap-2 hover:text-gold-light">
                  <Phone className="h-4 w-4 text-gold" aria-hidden />
                  {company.contact.phone}
                </a>
                <a href={company.contact.emailHref} className="inline-flex items-center gap-2 break-all hover:text-gold-light">
                  <Mail className="h-4 w-4 text-gold" aria-hidden />
                  {company.contact.email}
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-col items-start gap-6 rounded-2xl border border-white/10 bg-white/5 p-8">
              <Logo knockout href={null} size={56} />
              <div className="flex items-center gap-3 text-white/80">
                <MapPin className="h-5 w-5 shrink-0 text-gold" aria-hidden />
                <span>
                  Serving {company.serviceArea.label} — Richmond, Henrico,
                  Chesterfield, Hanover &amp; surrounding areas.
                </span>
              </div>
              <Link href="/compliance" className="btn-gold">
                See our credentials
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>

      <CtaBand
        title="Let's work together to deliver better care"
        subtitle="Reach out to Darren and the CSL team to set up service."
      />
    </>
  );
}
