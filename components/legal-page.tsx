import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/ui";
import type { ReactNode } from "react";

/** Shared shell for legal pages: header, counsel-review notice, prose body. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title={title}
        crumbs={[{ label: "Home", href: "/" }, { label: title }]}
      />
      <Section>
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
            <p className="text-sm text-ink/75">
              <strong className="text-navy-deep">Starter content — for review.</strong>{" "}
              This document is a reasonable starting point and should be reviewed
              and finalized by CSL&apos;s legal counsel before it is relied upon.
            </p>
          </div>
          <p className="text-sm text-ink/50">Last updated: {updated}</p>
          <div className="prose-csl mt-6 space-y-6">{children}</div>
        </div>
      </Section>
    </>
  );
}

/** Small typographic helpers so legal pages stay consistent without a plugin. */
export function LegalHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xl font-semibold text-navy-deep">{children}</h2>
  );
}

export function LegalText({ children }: { children: ReactNode }) {
  // `break-words` keeps long email addresses and URLs from pushing the page
  // wider than a phone screen.
  return <p className="break-words leading-relaxed text-ink/75">{children}</p>;
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-ink/75 marker:text-gold">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}
