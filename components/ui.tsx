import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Section wrapper with consistent vertical rhythm. */
export function Section({
  children,
  className,
  tone = "light",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "surface" | "navy";
  id?: string;
}) {
  const tones = {
    light: "bg-white",
    surface: "bg-surface",
    navy: "bg-navy-deep text-white",
  };
  return (
    <section id={id} className={cn("py-16 sm:py-20 lg:py-24", tones[tone], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

/** Eyebrow + heading + optional lead paragraph. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  invert?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2
        className={cn(
          "mt-3 text-3xl font-semibold sm:text-4xl",
          invert ? "text-white" : "text-navy-deep"
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed",
            invert ? "text-white/75" : "text-ink/70"
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

/** Checklist item with gold check. */
export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10">
        <Check className="h-3.5 w-3.5 text-success" aria-hidden />
      </span>
      <span className="text-ink/80">{children}</span>
    </li>
  );
}

/** Closing call-to-action band (navy + gold). */
export function CtaBand({
  title = "Ready to move medical deliveries you can trust?",
  subtitle = "Tell us your route and urgency — we'll respond fast with a quote.",
  primaryHref = "/contact",
  primaryLabel = "Request a Pickup",
  secondaryHref = "/services",
  secondaryLabel = "Explore Services",
}: {
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-deep">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 80% at 80% 0%, rgba(193,154,62,0.25), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="container-page relative flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <h2 className="max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-xl text-lg text-white/75">{subtitle}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={primaryHref} className="btn-gold">
            {primaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href={secondaryHref} className="btn-outline">
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Small labeled stat. */
export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-gold sm:text-4xl">{value}</div>
      <div className="mt-1 text-sm text-ink/60">{label}</div>
    </div>
  );
}
