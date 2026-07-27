"use client";

import { useState, Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { usePortal, ROLES, type Role } from "@/lib/portal-context";
import { canSwitchRoles, hasFullPortalAccess } from "@/lib/auth/config";
import { navItemsForRole } from "@/lib/auth/portal-nav";
import { PortalAccessGuard } from "./access-guard";
import { PortalGate } from "./gate";
import { cn } from "@/lib/utils";

export function PortalShell({ children }: { children: ReactNode }) {
  const { ready, signedIn } = usePortal();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Avoid a flash before hydration resolves the session.
  if (!ready) {
    return <div className="min-h-screen bg-surface" aria-hidden />;
  }

  if (!signedIn) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-surface" aria-hidden />}>
        <PortalGate />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Topbar onMenu={() => setMobileOpen((v) => !v)} mobileOpen={mobileOpen} />
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">
          <PortalAccessGuard>{children}</PortalAccessGuard>
        </main>
      </div>
    </div>
  );
}

function Topbar({
  onMenu,
  mobileOpen,
}: {
  onMenu: () => void;
  mobileOpen: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 text-navy-deep lg:hidden"
            onClick={onMenu}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Logo href="/portal" size={34} />
          <span className="hidden rounded-full bg-navy-deep px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-light sm:inline">
            Lead-Gen Engine
          </span>
        </div>
        <RoleSelector />
      </div>
    </header>
  );
}

function RoleSelector() {
  const { role, setRole, signOut, profile, user } = usePortal();
  const [open, setOpen] = useState(false);

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-sm hover:border-navy/30"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-deep text-[11px] font-bold text-gold">
          {initials}
        </span>
        <span className="hidden max-w-[140px] truncate font-medium text-navy-deep sm:inline">
          {displayName}
        </span>
        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#8a6c1f]">
          {role}
        </span>
        <ChevronDown className="h-4 w-4 text-ink/40" aria-hidden />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-navy/10 bg-white p-2 shadow-card-hover">
            {user?.email && (
              <p className="truncate px-3 py-1.5 text-xs text-ink/50">{user.email}</p>
            )}
            {canSwitchRoles(user?.email) && (
              <>
                <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink/40">
                  Preview role
                </p>
                {ROLES.map((r: Role) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-surface",
                      r === role ? "font-semibold text-navy-deep" : "text-ink/70"
                    )}
                  >
                    {r}
                    {r === role && <span className="h-2 w-2 rounded-full bg-gold" />}
                  </button>
                ))}
                <div className="my-1 h-px bg-navy/5" />
              </>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink/70 hover:bg-surface"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              View website
            </Link>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink/70 hover:bg-surface"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Sidebar({
  mobileOpen,
  onNavigate,
}: {
  mobileOpen: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const { role } = usePortal();
  const nav = navItemsForRole(role);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-navy-deep/40 lg:hidden"
          onClick={onNavigate}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-navy/10 bg-white transition-transform lg:static lg:z-auto lg:h-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex h-full flex-col gap-1 p-4" aria-label="Portal">
          {nav.map((item) => {
            const active =
              item.href === "/portal"
                ? pathname === "/portal"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-navy-deep text-white"
                    : "text-ink/70 hover:bg-surface hover:text-navy-deep"
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon
                  className={cn("h-5 w-5", active ? "text-gold" : "text-ink/50")}
                  aria-hidden
                />
                {item.label}
              </Link>
            );
          })}
          <div className="mt-auto rounded-xl border border-gold/30 bg-gold/10 p-3">
            {hasFullPortalAccess(role) ? (
              <>
                <p className="text-xs font-semibold text-success">Engine live</p>
                <p className="mt-1 text-xs text-ink/60">
                  Live data. Agents run weekly sweeps.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-navy-deep">Basic access</p>
                <p className="mt-1 text-xs text-ink/60">
                  Overview and company profile only. Contact Darren for full access.
                </p>
              </>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
