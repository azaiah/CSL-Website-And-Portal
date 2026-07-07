"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/logo";
import { usePortal, ROLES, type Role } from "@/lib/portal-context";
import { cn } from "@/lib/utils";

const roleBlurbs: Record<Role, string> = {
  Owner: "Full view — dashboard, pipeline, agents, and settings.",
  Admin: "Manage opportunities, pipeline, and the Company Brain.",
  Viewer: "Read-only view of opportunities and reports.",
};

export function PortalGate() {
  const { signIn } = usePortal();
  const [role, setRole] = useState<Role>("Owner");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(40% 50% at 20% 10%, rgba(193,154,62,0.18), transparent 60%), radial-gradient(45% 55% at 90% 90%, rgba(22,54,92,0.6), transparent 60%)",
        }}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 flex justify-center">
          <Logo knockout href="/" size={48} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-card-hover">
          <div className="flex items-center gap-2 text-gold">
            <Lock className="h-5 w-5" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              Client Portal
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-navy-deep">
            Sign in to the CSL lead-gen engine
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            Choose a role to preview the portal. Roles change labels and access
            hints only.
          </p>

          <div className="mt-6">
            <span className="mb-2 block text-sm font-medium text-navy-deep">
              Role
            </span>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                    role === r
                      ? "border-gold bg-gold/10 text-navy-deep"
                      : "border-navy/15 bg-white text-ink/70 hover:border-navy/30"
                  )}
                  aria-pressed={role === r}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink/50">{roleBlurbs[role]}</p>
          </div>

          <button
            onClick={() => signIn(role)}
            className="btn-gold mt-7 w-full"
          >
            Enter portal
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-navy/10 bg-surface p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink/50" aria-hidden />
            <p className="text-xs text-ink/60">
              <strong className="text-navy-deep">Non-secure preview.</strong> This
              is a Phase 1 front gate with no real authentication.{" "}
              <span className="font-mono text-ink/50">
                TODO: replace with real auth.
              </span>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/60">
          <Link href="/" className="hover:text-gold-light">
            ← Back to trustcsl.com
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
