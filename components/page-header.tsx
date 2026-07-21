import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface Crumb {
  label: string;
  href?: string;
}

/** Navy hero band used at the top of interior pages — layered + textured. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="grain relative overflow-hidden bg-navy-deep">
      <div className="bg-grid-dark mask-fade absolute inset-0 opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 70% at 88% 0%, rgba(193,154,62,0.24), transparent 60%), radial-gradient(40% 60% at 0% 100%, rgba(22,54,92,0.6), transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="absolute right-[14%] top-6 h-40 w-40 rounded-full bg-gold/15 blur-3xl animate-float"
        aria-hidden
      />
      <div className="container-page relative py-16 sm:py-20">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-white/60">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-gold-light">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-white/80">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && (
                    <ChevronRight className="h-3.5 w-3.5 text-white/30" aria-hidden />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-4 max-w-3xl text-4xl font-bold text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
          {title}
        </h1>
        {lead && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
            {lead}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
