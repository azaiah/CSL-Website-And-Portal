import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading, CheckItem, CtaBand } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import type { ServiceDetailContent } from "@/lib/service-content";

/** Shared template for the four supporting service pages. */
export function ServiceDetail({
  slug,
  name,
  icon: Icon,
  content,
}: {
  slug: string;
  name: string;
  icon: LucideIcon;
  content: ServiceDetailContent;
}) {
  return (
    <>
      <PageHeader
        eyebrow={content.eyebrow}
        title={name}
        lead={content.lead}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: name },
        ]}
      >
        <Link href="/contact" className="btn-gold">
          Get a Quote
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-deep text-gold">
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              <p className="mt-6 text-lg leading-relaxed text-ink/80">
                {content.intro}
              </p>
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {content.features.map((f) => (
                  <div key={f.title} className="card">
                    <h3 className="text-base font-semibold text-navy-deep">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">
                      {f.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <aside className="card h-fit bg-surface">
              <p className="eyebrow">What&apos;s included</p>
              <ul className="mt-5 space-y-4">
                {content.bullets.map((b) => (
                  <CheckItem key={b}>{b}</CheckItem>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-navy/10 bg-white p-5">
                <p className="text-sm font-medium text-navy-deep">
                  Part of one trusted partner
                </p>
                <p className="mt-1 text-sm text-ink/70">
                  Combine this with our{" "}
                  <Link href="/services/medical-courier" className="font-medium text-gold hover:underline">
                    medical courier
                  </Link>{" "}
                  service for end-to-end coverage.
                </p>
              </div>
            </aside>
          </Reveal>
        </div>
      </Section>

      <CtaBand
        title={content.closingTitle}
        subtitle={content.closingSubtitle}
        secondaryHref="/services"
        secondaryLabel="All Services"
      />
    </>
  );
}
