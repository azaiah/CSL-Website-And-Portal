"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { usePortal } from "@/lib/portal-context";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function PortalGate() {
  const { signInWithGoogle } = usePortal();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryError = searchParams.get("error");
  const queryMessage =
    queryError === "unauthorized"
      ? "This Google account is not authorized for the CSL portal. Contact your administrator."
      : queryError === "auth"
        ? "Sign-in failed. Please try again."
        : null;

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError("Could not start Google sign-in. Check Supabase configuration.");
      setLoading(false);
    }
  }

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
            Use your authorized Google account. Access is limited to CSL team
            members.
          </p>

          {(queryMessage || error) && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {queryMessage ?? error}
            </p>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm font-semibold text-navy-deep shadow-sm transition hover:border-navy/25 hover:bg-surface disabled:opacity-60"
          >
            <GoogleIcon />
            {loading ? "Redirecting…" : "Continue with Google"}
          </button>

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-navy/10 bg-surface p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            <p className="text-xs text-ink/60">
              Secured with Google sign-in and Supabase. Your session is encrypted
              and protected by row-level security.
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
