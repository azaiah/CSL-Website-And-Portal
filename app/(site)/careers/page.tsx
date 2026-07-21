import type { Metadata } from "next";
import { Route, ShieldCheck, Clock, BadgeCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { CareersForm } from "@/components/careers-form";

export const metadata: Metadata = {
  title: "Drive for CSL — Independent-Contractor Medical Courier Drivers",
  description:
    "Drive for Capital Solutions & Logistics in Greater Richmond, VA. We're recruiting professional independent-contractor drivers for medical courier and delivery routes. Compliance onboarding provided.",
};

const perks = [
  {
    icon: Route,
    title: "Meaningful routes",
    body: "Deliver medications and specimens that matter — work with real purpose in your community.",
  },
  {
    icon: Clock,
    title: "Flexible scheduling",
    body: "Full-time, part-time, on-call STAT, or weekend availability — tell us what fits.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance onboarding",
    body: "We provide the HIPAA, OSHA, and safe-handling training you need to run medical routes.",
  },
  {
    icon: BadgeCheck,
    title: "A professional team",
    body: "Represent a credentialed, respected local courier with high standards and steady work.",
  },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers · Drive for CSL"
        title="Drive for a courier that takes the work seriously"
        lead="We're recruiting professional independent-contractor drivers across Greater Richmond. If you're reliable, safety-minded, and take pride in getting it right, we'd like to meet you."
        crumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
      />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Why drive with us"
            title="Steady, purposeful work with a credentialed team"
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <div className="card h-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl icon-tile">
                  <p.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-base font-semibold text-navy-deep">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div>
              <SectionHeading
                eyebrow="Apply"
                title="Start your application"
                lead="It takes a couple of minutes. We'll follow up about routes and the compliance onboarding you'll complete before driving."
              />
              <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6">
                <h3 className="text-sm font-semibold text-navy-deep">
                  What you&apos;ll need
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-ink/70">
                  <li>· A reliable, insured vehicle</li>
                  <li>· A clean driving record</li>
                  <li>· A smartphone for delivery confirmation</li>
                  <li>· Willingness to complete compliance training</li>
                </ul>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <CareersForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
