import type { Metadata } from "next";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { QuoteForm } from "@/components/quote-form";
import { company } from "@/lib/company-brain";

export const metadata: Metadata = {
  title: "Contact & Request Service — Medical Courier Quote, Richmond VA",
  description:
    "Request a pickup or get a quote from Capital Solutions & Logistics. STAT, same-day, and scheduled medical courier and delivery service across Greater Richmond, VA. Call (917) 627-3265.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact · Request Service"
        title="Request a pickup or get a quote"
        lead="Tell us the service, route, and urgency — STAT, same-day, or scheduled — and we'll respond fast with availability and pricing."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <QuoteForm />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-navy-deep">
                  Reach us directly
                </h3>
                <ul className="mt-5 space-y-4 text-sm">
                  <li>
                    <a
                      href={company.contact.phoneHref}
                      className="flex items-start gap-3 text-ink/80 hover:text-gold"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-deep text-gold">
                        <Phone className="h-5 w-5" aria-hidden />
                      </span>
                      <span>
                        <span className="block font-semibold text-navy-deep">
                          {company.contact.phone}
                        </span>
                        <span className="block text-xs text-ink/60">
                          {company.contact.name}, {company.contact.title}
                        </span>
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={company.contact.emailHref}
                      className="flex items-start gap-3 text-ink/80 hover:text-gold"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-deep text-gold">
                        <Mail className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block break-all font-semibold text-navy-deep">
                          {company.contact.email}
                        </span>
                        <span className="block text-xs text-ink/60">
                          Email us anytime
                        </span>
                      </span>
                    </a>
                  </li>
                  <li className="flex items-start gap-3 text-ink/80">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-deep text-gold">
                      <Clock className="h-5 w-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold text-navy-deep">
                        Hours
                      </span>
                      <span className="block text-xs text-ink/60">
                        {company.contact.hours}
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-ink/80">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-deep text-gold">
                      <MapPin className="h-5 w-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold text-navy-deep">
                        Service area
                      </span>
                      <span className="block text-xs text-ink/60">
                        {company.serviceArea.label} · ~{company.serviceArea.radiusMiles}
                        -mile radius
                      </span>
                    </span>
                  </li>
                </ul>
              </div>

              {/* Richmond map embed (no API key required) */}
              <div className="overflow-hidden rounded-2xl border border-navy/10 shadow-card">
                <iframe
                  title="CSL service area — Richmond, Virginia"
                  src="https://www.google.com/maps?q=Richmond,+Virginia&output=embed"
                  width="100%"
                  height="280"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block w-full"
                  style={{ border: 0 }}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
