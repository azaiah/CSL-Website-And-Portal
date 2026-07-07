import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, CtaBand } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { serviceIcons } from "@/components/service-icons";
import { serviceLines } from "@/lib/company-brain";

export const metadata: Metadata = {
  title: "Services — Medical Courier, Freight, Facilities, Workforce, Storage",
  description:
    "Explore CSL's five service lines: HIPAA-compliant medical courier, freight & delivery, facilities management, workforce solutions, and secure warehouse storage in Greater Richmond, VA.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="One compliant partner for medical logistics and more"
        lead="From HIPAA-compliant specimen transport to freight, facilities, workforce, and storage — CSL brings the same on-time, credentialed standard to every line."
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {serviceLines.map((s, i) => {
            const Icon = serviceIcons[s.slug];
            const flagship = s.slug === "medical-courier";
            return (
              <Reveal key={s.slug} delay={i * 0.05}>
                <Link
                  href={`/services/${s.slug}`}
                  className={`card-hover group flex h-full flex-col ${
                    flagship ? "md:col-span-2 md:flex-row md:items-center md:gap-8" : ""
                  }`}
                >
                  <span
                    className={`flex items-center justify-center rounded-xl bg-navy-deep text-gold transition-colors group-hover:bg-navy ${
                      flagship ? "h-16 w-16 shrink-0" : "h-12 w-12"
                    }`}
                  >
                    <Icon className={flagship ? "h-8 w-8" : "h-6 w-6"} aria-hidden />
                  </span>
                  <div className={flagship ? "mt-5 md:mt-0" : "mt-5"}>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-navy-deep">
                        {s.name}
                      </h2>
                      {flagship && (
                        <span className="badge-pill border-gold/30 bg-gold/10 text-gold">
                          Flagship
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">
                      {s.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                      View {s.name}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <CtaBand
        title="Not sure which service fits?"
        subtitle="Tell us what you need moved or managed — we'll point you to the right line and quote it fast."
      />
    </>
  );
}
