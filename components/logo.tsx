import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { company } from "@/lib/company-brain";

/**
 * CSL logo lockup. `knockout` inverts to a white wordmark for dark sections
 * (the logo PNG itself reads well on navy; we only recolor the text here).
 */
export function Logo({
  className,
  knockout = false,
  showWordmark = true,
  href = "/",
  size = 40,
}: {
  className?: string;
  knockout?: boolean;
  showWordmark?: boolean;
  href?: string | null;
  size?: number;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/logo.png"
        alt="Capital Solutions & Logistics logo"
        width={size}
        height={size}
        className="h-auto w-auto"
        style={{ width: size, height: size, objectFit: "contain" }}
        priority
      />
      {showWordmark && (
        <span className="leading-tight">
          <span
            className={cn(
              "block text-[15px] font-bold tracking-tight",
              knockout ? "text-white" : "text-navy-deep"
            )}
          >
            Capital Solutions
          </span>
          <span
            className={cn(
              "block text-[11px] font-medium uppercase tracking-[0.2em]",
              knockout ? "text-gold-light" : "text-gold"
            )}
          >
            &amp; Logistics
          </span>
        </span>
      )}
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label={`${company.name} home`} className="shrink-0">
      {content}
    </Link>
  );
}
