import type { Metadata } from "next";
import {
  ShieldCheck,
  Award,
  FileCheck2,
  Umbrella,
  Hash,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading, CtaBand } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import {
  credentials,
  certifications,
  codes,
  company,
  helpers,
  type CredentialStatus,
} from "@/lib/company-brain";

export const metadata: Metadata = {
  title: "Compliance & Credentials — HIPAA, OSHA, DOT HazMat, SAM/CAGE",
  description:
    "CSL's credential wall: HIPAA/HITECH, OSHA Bloodborne Pathogens, DOT HazMat, USDOT authority (MC in progress), TWIC, TSA PreCheck, SAM/CAGE, eVA, SWaM, plus Lloyd's of London cargo coverage. Compliance you can verify.",
};

const statusStyles: Record<CredentialStatus, string> = {
  active: "border-success/30 bg-success/10 text-success",
  registered: "border-navy/20 bg-navy/5 text-navy",
  "in-progress": "border-gold/40 bg-gold/10 text-[#8a6c1f]",
};

function StatusBadge({ status }: { status: CredentialStatus }) {
  const Icon = status === "in-progress" ? Clock3 : CheckCircle2;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status]}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {helpers.statusLabel(status)}
    </span>
  );
}

export default function CompliancePage() {
  return (
    <>
      <PageHeader
        eyebrow="Compliance & Credentials"
        title="Compliance you can verify — not just claim"
        lead="Medical logistics runs on trust, and trust runs on credentials. Here is the full picture of CSL's registrations, training, insurance, and procurement codes."
        crumbs={[{ label: "Home", href: "/" }, { label: "Compliance" }]}
      >
        <div className="flex flex-wrap gap-3 text-sm text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> Active
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-gold" aria-hidden /> Registered
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4 text-gold-light" aria-hidden /> In progress
          </span>
        </div>
      </PageHeader>

      {/* Registrations & designations */}
      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Registrations & designations"
            title="Registered where it counts"
            lead="Federal, state, and local registrations that let CSL work with government and healthcare buyers — with each status labeled honestly."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map((c, i) => (
            <Reveal key={c.label} delay={(i % 3) * 0.05}>
              <div className="card h-full">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl icon-tile">
                    <ShieldCheck className="h-5 w-5" aria-hidden />
                  </span>
                  <StatusBadge status={c.status} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-navy-deep">
                  {c.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {c.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm text-ink/60">
          Designations marked &ldquo;in progress&rdquo; are actively being pursued and are
          not yet certified. CSL represents each credential honestly and can
          provide documentation for active registrations on request.
        </p>
      </Section>

      {/* Certifications & training */}
      <Section tone="surface">
        <Reveal>
          <SectionHeading
            eyebrow="Certifications & training"
            title="Trained for what medical transport demands"
            lead="Every CSL driver operates under safety and handling training aligned to federal standards."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {certifications.map((c, i) => (
            <Reveal key={c.label} delay={(i % 2) * 0.05}>
              <div className="card flex h-full gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Award className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-base font-semibold text-navy-deep">
                      {c.label}
                    </h3>
                    {c.reference && (
                      <span className="text-xs font-medium text-ink/50">
                        {c.reference}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    {c.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Insurance + codes */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="card h-full">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl icon-tile">
                <Umbrella className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-navy-deep">
                Insurance coverage
              </h3>
              <p className="mt-3 leading-relaxed text-ink/70">
                {company.insurance}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-ink/80">
                <li className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-gold" aria-hidden />
                  Commercial auto liability
                </li>
                <li className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-gold" aria-hidden />
                  Cargo coverage (Lloyd&apos;s of London)
                </li>
                <li className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-gold" aria-hidden />
                  Certificates available on request
                </li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card h-full">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl icon-tile">
                <Hash className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-navy-deep">
                Procurement codes
              </h3>
              <p className="mt-3 leading-relaxed text-ink/70">
                The NAICS and NIGP codes buyers use to find and contract CSL.
              </p>
              <div className="mt-5 overflow-hidden rounded-xl border border-navy/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface text-xs uppercase tracking-wide text-ink/60">
                    <tr>
                      <th className="px-4 py-2 font-semibold">System</th>
                      <th className="px-4 py-2 font-semibold">Code</th>
                      <th className="px-4 py-2 font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5">
                    {codes.map((c) => (
                      <tr key={`${c.system}-${c.code}`}>
                        <td className="px-4 py-2.5 font-semibold text-navy">
                          {c.system}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-navy-deep">
                          {c.code}
                        </td>
                        <td className="px-4 py-2.5 text-ink/70">{c.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <CtaBand
        title="Compliance questions? We'll walk you through it."
        subtitle="Ask for documentation, certificates, or a capability statement — we respond fast."
        secondaryHref="/services/medical-courier"
        secondaryLabel="Medical Courier"
      />
    </>
  );
}
