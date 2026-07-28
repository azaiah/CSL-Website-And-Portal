import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Section wrapper with consistent vertical rhythm and optional texture. */
export function Section({
  children,
  className,
  tone = "light",
  pattern,
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "surface" | "navy";
  pattern?: "grid" | "dots" | "none";
  id?: string;
}) {
  const tones = {
    light: "bg-white",
    surface: "bg-surface",
    navy: "bg-navy-deep text-white grain",
  };
  const patternClass =
    pattern === "grid"
      ? tone === "navy"
        ? "bg-grid-dark"
        : "bg-grid"
      : pattern === "dots"
      ? "bg-dots"
      : "";

  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden py-16 sm:py-20 lg:py-24",
        tones[tone],
        className
      )}
    >
      {patternClass && (
        <div
          className={cn("mask-fade absolute inset-0 opacity-70", patternClass)}
          aria-hidden
        />
      )}
      {tone === "navy" && (
        <div className="glow-gold absolute inset-0" aria-hidden />
      )}
      <div className="container-page relative">{children}</div>
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
      {eyebrow && (
        <p className={cn("eyebrow", align === "center" && "justify-center")}>
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "mt-4 text-3xl font-semibold sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
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

/** Closing call-to-action band (navy + gold, textured). */
export function CtaBand({
  eyebrow,
  title = "Ready to move medical deliveries you can trust?",
  subtitle = "Tell us your route and urgency — we'll respond fast with a quote.",
  primaryHref = "/contact",
  primaryLabel = "Request a Pickup",
  secondaryHref = "/services",
  secondaryLabel = "Explore Services",
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="grain relative overflow-hidden bg-navy-deep">
      <div className="bg-grid-dark mask-fade absolute inset-0 opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 80% at 50% -10%, rgba(193,154,62,0.28), transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="absolute right-[10%] top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl animate-float"
        aria-hidden
      />
      <div className="container-page relative flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        {eyebrow ? (
          <p className="eyebrow justify-center text-gold-light">{eyebrow}</p>
        ) : (
          <div className="rule-gold max-w-[120px]" />
        )}
        <h2 className="max-w-2xl text-3xl font-semibold text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
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

/** Small labeled stat with gradient number. */
export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-gradient-gold text-3xl font-bold sm:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-sm text-ink/60">{label}</div>
    </div>
  );
}
