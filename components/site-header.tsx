"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { serviceLines } from "@/lib/company-brain";

const primaryNav = [
  { label: "Medical Courier", href: "/services/medical-courier" },
  { label: "Compliance", href: "/compliance" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // Stop the page behind the mobile menu from scrolling while it is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        // `transition-colors`, not `transition-all`: `transition-all` also
        // animated the backdrop blur on every scroll, which stutters on phones.
        "sticky top-0 z-50 w-full transition-colors duration-200",
        scrolled
          ? "border-b border-navy/10 bg-white/90 backdrop-blur-md"
          : "border-b border-transparent bg-white"
      )}
    >
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-navy-deep hover:bg-surface"
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              onClick={() => setServicesOpen((v) => !v)}
            >
              Services
              <ChevronDown className="h-4 w-4 text-gold" aria-hidden />
            </button>
            {servicesOpen && (
              <div className="absolute left-0 top-full w-72 pt-2">
                <div className="rounded-2xl border border-navy/10 bg-white p-2 shadow-card-hover">
                  <Link
                    href="/services"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-navy-deep hover:bg-surface"
                  >
                    All Services
                  </Link>
                  <div className="my-1 h-px bg-navy/5" />
                  {serviceLines.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}`}
                      className="block rounded-xl px-3 py-2 hover:bg-surface"
                    >
                      <span className="block text-sm font-medium text-navy-deep">
                        {s.name}
                      </span>
                      <span className="block text-xs text-ink/60">{s.short}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface",
                pathname === item.href ? "text-gold" : "text-navy-deep"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/portal"
            className="text-sm font-medium text-navy-deep hover:text-gold"
          >
            Portal Login
          </Link>
          <Link href="/contact" className="btn-gold">
            Request a Pickup
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-navy-deep lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        // The menu is taller than a phone screen, so it scrolls on its own now
        // that we lock the page behind it. `5rem` is the header height.
        <div className="max-h-[calc(100svh-5rem)] overflow-y-auto border-t border-navy/10 bg-white lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile">
            <span className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
              Services
            </span>
            <Link href="/services" className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-deep hover:bg-surface">
              All Services
            </Link>
            {serviceLines.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="rounded-lg px-3 py-2 text-sm text-navy-deep hover:bg-surface"
              >
                {s.name}
              </Link>
            ))}
            <div className="my-2 h-px bg-navy/5" />
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-navy-deep hover:bg-surface"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-navy/5" />
            <Link href="/portal" className="rounded-lg px-3 py-2 text-sm font-medium text-navy-deep hover:bg-surface">
              Portal Login
            </Link>
            <Link href="/contact" className="btn-gold mt-2 w-full">
              Request a Pickup
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
