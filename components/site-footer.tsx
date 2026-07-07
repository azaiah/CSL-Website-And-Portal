import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { Logo } from "./logo";
import { company, serviceLines, trustBadges } from "@/lib/company-brain";

const quickLinks = [
  { label: "Services", href: "/services" },
  { label: "Medical Courier", href: "/services/medical-courier" },
  { label: "Compliance & Credentials", href: "/compliance" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
  { label: "Client Portal", href: "/portal" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "HIPAA Notice", href: "/hipaa-notice" },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy-deep text-white/80">
      {/* Credentials strip */}
      <div className="border-b border-white/10">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-5 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-light">
            Credentialed &amp; Compliant
          </span>
          {trustBadges.map((b) => (
            <span key={b} className="text-xs font-medium text-white/70">
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo knockout href={null} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            {company.description}
          </p>
          <p className="mt-4 text-sm font-medium text-gold-light">
            {company.promise}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-white/70 transition-colors hover:text-gold-light"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Services
          </h3>
          <ul className="mt-4 space-y-2">
            {serviceLines.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-sm text-white/70 transition-colors hover:text-gold-light"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="font-medium text-white">{company.contact.name}</li>
            <li className="text-white/60">{company.contact.title}</li>
            <li>
              <a
                href={company.contact.phoneHref}
                className="inline-flex items-center gap-2 text-white/70 hover:text-gold-light"
              >
                <Phone className="h-4 w-4 text-gold" aria-hidden />
                {company.contact.phone}
              </a>
            </li>
            <li>
              <a
                href={company.contact.emailHref}
                className="inline-flex items-start gap-2 break-all text-white/70 hover:text-gold-light"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                {company.contact.email}
              </a>
            </li>
            <li className="inline-flex items-start gap-2 text-white/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              {company.serviceArea.label}
            </li>
          </ul>
          <Link href="/contact" className="btn-gold mt-6">
            Get a Quote
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/50 sm:flex-row">
          <p>
            &copy; {company.founded}–2026 {company.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-gold-light">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
